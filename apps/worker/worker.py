import io
import json
import os
import signal
from pathlib import Path
import boto3
import psycopg2
from PIL import Image, ImageDraw, ImageFont, ImageOps, UnidentifiedImageError

QUEUE_URL = os.environ["QUEUE_URL"]
DATABASE_URL = os.environ["DATABASE_URL"]
REGION = os.environ.get("AWS_REGION", "us-east-2")

sqs = boto3.client("sqs", region_name=REGION)
s3 = boto3.client("s3", region_name=REGION)

TEXT = "TRACEMARK / FOTO DE PROVA"
FONT = Path(__file__).parent / "fonts" / "DejaVuSans-Bold.ttf"

def aplicar_marca_dagua(dados: bytes) -> bytes:
    """Recebe a foto original e devolve um JPEG de até 1600 px com o texto
    repetido na diagonal, branco semitransparente com contorno escuro."""
    foto = Image.open(io.BytesIO(dados))
    foto.load()  # erro se o arquivo não for imagem
    foto = ImageOps.exif_transpose(foto).convert("RGB")  # respeita a orientação da câmera
    if foto.width > 1600:
        foto = foto.resize((1600, round(foto.height * 1600 / foto.width)), Image.LANCZOS)
    w, h = foto.size

    tamanho = max(16, round(w / 24))
    fonte = ImageFont.truetype(str(FONT), tamanho)
    largura_texto = ImageDraw.Draw(foto).textlength(TEXT, font=fonte)

    # Camada maior que a foto, gira e recorta o centro 
    lado = int((w ** 2 + h ** 2) ** 0.5) + tamanho * 2
    camada = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    desenho = ImageDraw.Draw(camada)
    passo_x, passo_y = int(largura_texto + tamanho * 3), max(60, round(h / 5))
    for linha, y in enumerate(range(0, lado, passo_y)):
        deslocamento = (linha % 2) * passo_x // 2
        for x in range(-passo_x + deslocamento, lado, passo_x):
            desenho.text((x, y), TEXT, font=fonte, fill=(255, 255, 255, 128),
                         stroke_width=max(1, tamanho // 24), stroke_fill=(26, 26, 26, 64))
    camada = camada.rotate(30, resample=Image.BICUBIC)
    esq, topo = (lado - w) // 2, (lado - h) // 2
    camada = camada.crop((esq, topo, esq + w, topo + h))

    saida = io.BytesIO()
    Image.alpha_composite(foto.convert("RGBA"), camada).convert("RGB").save(saida, "JPEG", quality=80)
    return saida.getvalue()


# ---------------------------------------------------------------- banco (RDS)
conexao = None


def atualizar_status(photo_id, status, watermarked_key=None, erro=None):
    global conexao
    try:
        if conexao is None or conexao.closed:
            conexao = psycopg2.connect(DATABASE_URL, sslmode="prefer")
            conexao.autocommit = True
        with conexao.cursor() as cur:
            cur.execute(
                "UPDATE photos SET status = %s, watermarked_key = COALESCE(%s, watermarked_key),"
                " error_message = %s WHERE id = %s",
                (status, watermarked_key, erro, photo_id),
            )
    except psycopg2.Error:
        conexao = None  # a conexão reconecta na próxima
        raise


def processar(mensagem):
    try:
        corpo = json.loads(mensagem["Body"])
        photo_id, bucket, key = corpo["photo_id"], corpo["bucket"], corpo["key"]
    except (ValueError, KeyError, TypeError):
        print("mensagem inválida, fica na fila até ir para a DLQ:", mensagem["Body"], flush=True)
        return

    destino = f"watermarked/{photo_id}.jpg"
    apagar = True
    try:
        original = s3.get_object(Bucket=bucket, Key=key)["Body"].read()
        resultado = aplicar_marca_dagua(original)
        s3.put_object(Bucket=bucket, Key=destino, Body=resultado, ContentType="image/jpeg")
        atualizar_status(photo_id, "PUBLICAVEL", watermarked_key=destino)
        print("PUBLICAVEL", photo_id, destino, flush=True)
    except UnidentifiedImageError:
        # não é imagem: tentar de novo não adianta, então marca ERRO e tira da fila
        print("ERRO", photo_id, "não é uma imagem válida", flush=True)
        atualizar_status(photo_id, "ERRO", erro="O arquivo enviado não é uma imagem válida.")
    except Exception as e:
        # falha passageira (S3, banco...): marca ERRO e deixa a mensagem voltar (retry e DLQ)
        apagar = False
        print("ERRO", photo_id, e, flush=True)
        try:
            atualizar_status(photo_id, "ERRO", erro=str(e)[:500])
        except Exception as e2:
            print("não consegui gravar ERRO no banco:", e2, flush=True)

    if apagar:
        sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=mensagem["ReceiptHandle"])

rodando = True

def parar(*_):
    global rodando  # o ECS manda SIGTERM ao parar a tarefa: termina a foto atual e sai
    rodando = False

signal.signal(signal.SIGTERM, parar)
signal.signal(signal.SIGINT, parar)

print("ouvindo a fila", QUEUE_URL, flush=True)
while rodando:
    # long polling: espera até 20 s por mensagens em vez de ficar perguntando toda hora
    resposta = sqs.receive_message(QueueUrl=QUEUE_URL, MaxNumberOfMessages=5, WaitTimeSeconds=20)
    for mensagem in resposta.get("Messages", []):
        processar(mensagem)