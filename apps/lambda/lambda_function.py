# Lambda da parte 3: o S3 avisa que chegou uma foto, a gente confere
# se o arquivo e valido e manda uma mensagem pra fila SQS
import json
import os
from urllib.parse import unquote_plus

import boto3

sqs = boto3.client("sqs")

EXTENSOES_VALIDAS = ("jpg", "jpeg", "png")
TAMANHO_MAXIMO = 10 * 1024 * 1024  # foto de 10 MB  e se for maior que isso a gente ignora


def lambda_handler(event, context):
    # se nao tem Records, nao e um evento do S3
    if not isinstance(event, dict) or not isinstance(event.get("Records"), list):
        raise ValueError("evento invalido: sem Records")

    # a url da fila fica numa variavel de ambiente da lambda
    fila_url = os.environ["QUEUE_URL"]

    enviadas = 0
    ignoradas = 0
    malformadas = 0

    for registro in event["Records"]:
        # pega o bucket e o nome do arquivo do registro
        try:
            bucket = registro["s3"]["bucket"]["name"]
            # o S3 manda o nome codificado e decodifica
            key = unquote_plus(registro["s3"]["object"]["key"])
        except (KeyError, TypeError, AttributeError):
            print("registro malformado, pulando:", registro)
            malformadas += 1
            continue

        if not bucket or not key:
            print("bucket ou key vazio, pulando")
            malformadas += 1
            continue

        # so aceita arquivos que estao em originals/ pq assim a foto com marca
        # d'agua nao dispara a lambda de novo
        if not key.startswith("originals/"):
            print("fora da pasta originals/, ignorando:", key)
            ignoradas += 1
            continue

        nome_arquivo = key[len("originals/"):]
        if "/" in nome_arquivo or "." not in nome_arquivo:
            print("nome de arquivo fora do padrao, ignorando:", key)
            ignoradas += 1
            continue

        # originals/abc123.jpg ---> photo_id = abc123 e extensao = jpg
        photo_id, extensao = nome_arquivo.rsplit(".", 1)
        extensao = extensao.lower()

        if photo_id == "" or extensao not in EXTENSOES_VALIDAS:
            print("extensao nao permitida, ignorando:", key)
            ignoradas += 1
            continue

        # o evento do S3 ja traz o tamanho do arquivo
        tamanho = registro["s3"]["object"].get("size")
        if isinstance(tamanho, int) and tamanho > TAMANHO_MAXIMO:
            print("arquivo muito grande, ignorando:", key)
            ignoradas += 1
            continue

        mensagem = {"photo_id": photo_id, "bucket": bucket, "key": key}

        # se der erro aqui a excecao sobe e o S3 tenta de novo sozinho
        sqs.send_message(QueueUrl=fila_url, MessageBody=json.dumps(mensagem))
        print("mensagem enviada:", mensagem)
        enviadas += 1

    return {"enviadas": enviadas, "ignoradas": ignoradas, "malformadas": malformadas}
