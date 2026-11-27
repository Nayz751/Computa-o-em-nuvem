# Testes da lambda, n usam a AWS de verdade, a fila e trocada por uma falsa
# rodar: pip install boto3 pytest  e depois  pytest -v
import json
import os

import pytest

# o boto3 precisa de uma regiao pra criar o cliente, aqui no teste qualquer uma serve
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-2")

import lambda_function

URL_FILA = "https://sqs.us-east-2.amazonaws.com/123456789012/photo-processing-queue"
BUCKET = "bucket-teste"
MB = 1024 * 1024


class FilaFalsa:
    def __init__(self, dar_erro=False):
        self.mensagens = []
        self.dar_erro = dar_erro

    def send_message(self, QueueUrl, MessageBody):
        if self.dar_erro:
            raise RuntimeError("fila fora do ar")
        self.mensagens.append({"QueueUrl": QueueUrl, "MessageBody": MessageBody})


@pytest.fixture
def fila(monkeypatch):
    falsa = FilaFalsa()
    monkeypatch.setattr(lambda_function, "sqs", falsa)
    monkeypatch.setenv("QUEUE_URL", URL_FILA)
    return falsa


def registro(key, tamanho=None):
    objeto = {"key": key}
    if tamanho is not None:
        objeto["size"] = tamanho
    return {"s3": {"bucket": {"name": BUCKET}, "object": objeto}}


def evento(*keys):
    return {"Records": [registro(k) for k in keys]}


# extensoes validas 

@pytest.mark.parametrize("key", [
    "originals/abc-123.jpg",
    "originals/abc-123.jpeg",
    "originals/abc-123.png",
    "originals/abc-123.JPG",
])
def test_extensao_valida_manda_pra_fila(fila, key):
    resultado = lambda_function.lambda_handler(evento(key), None)

    assert resultado == {"enviadas": 1, "ignoradas": 0, "malformadas": 0}
    assert len(fila.mensagens) == 1
    assert fila.mensagens[0]["QueueUrl"] == URL_FILA


def test_corpo_da_mensagem(fila):
    lambda_function.lambda_handler(evento("originals/abc-123.jpg"), None)

    corpo = json.loads(fila.mensagens[0]["MessageBody"])
    assert corpo == {"photo_id": "abc-123", "bucket": BUCKET, "key": "originals/abc-123.jpg"}


def test_key_codificada_e_decodificada(fila):
    lambda_function.lambda_handler(evento("originals/minha+foto.jpg"), None)

    corpo = json.loads(fila.mensagens[0]["MessageBody"])
    assert corpo["key"] == "originals/minha foto.jpg"
    assert corpo["photo_id"] == "minha foto"


def test_varios_registros(fila):
    resultado = lambda_function.lambda_handler(evento("originals/a.jpg", "originals/b.png"), None)

    assert resultado["enviadas"] == 2
    assert len(fila.mensagens) == 2


#  extensao invalida e key fora do padrao

@pytest.mark.parametrize("key", [
    "originals/documento.txt",
    "originals/animacao.gif",
    "originals/arquivo.pdf",
    "originals/semextensao",
    "originals/.jpg",
    "watermarked/abc-123.jpg",
    "originals/pasta/abc.jpg",
])
def test_arquivo_invalido_nao_manda_pra_fila(fila, key):
    resultado = lambda_function.lambda_handler(evento(key), None)

    assert resultado == {"enviadas": 0, "ignoradas": 1, "malformadas": 0}
    assert fila.mensagens == []


def test_evento_misto_manda_so_o_valido(fila):
    resultado = lambda_function.lambda_handler(evento("originals/ok.jpg", "originals/ruim.txt"), None)

    assert resultado == {"enviadas": 1, "ignoradas": 1, "malformadas": 0}


# tamanho 

def test_arquivo_dentro_do_limite(fila):
    ev = {"Records": [registro("originals/ok.jpg", tamanho=5 * MB)]}

    assert lambda_function.lambda_handler(ev, None)["enviadas"] == 1


def test_arquivo_acima_do_limite_e_ignorado(fila):
    ev = {"Records": [registro("originals/gigante.jpg", tamanho=11 * MB)]}

    resultado = lambda_function.lambda_handler(ev, None)

    assert resultado == {"enviadas": 0, "ignoradas": 1, "malformadas": 0}
    assert fila.mensagens == []


# evento e egistro malformado

@pytest.mark.parametrize("ev", [{}, {"Records": "texto"}, None, "texto solto"])
def test_evento_sem_records_da_erro(fila, ev):
    with pytest.raises(ValueError):
        lambda_function.lambda_handler(ev, None)

    assert fila.mensagens == []


@pytest.mark.parametrize("reg", [
    {},
    {"s3": {}},
    {"s3": {"bucket": {"name": BUCKET}}},
    {"s3": {"bucket": {}, "object": {"key": "originals/a.jpg"}}},
    {"s3": {"bucket": {"name": BUCKET}, "object": {"key": ""}}},
    "nao-e-um-dict",
])
def test_registro_malformado_nao_derruba_o_resto(fila, reg):
    ev = {"Records": [reg, registro("originals/ok.jpg")]}

    resultado = lambda_function.lambda_handler(ev, None)

    assert resultado == {"enviadas": 1, "ignoradas": 0, "malformadas": 1}


# falhas 

def test_erro_da_fila_sobe_pra_permitir_retry(monkeypatch):
    monkeypatch.setattr(lambda_function, "sqs", FilaFalsa(dar_erro=True))
    monkeypatch.setenv("QUEUE_URL", URL_FILA)

    with pytest.raises(RuntimeError):
        lambda_function.lambda_handler(evento("originals/abc.jpg"), None)


def test_sem_queue_url_da_erro(monkeypatch):
    monkeypatch.delenv("QUEUE_URL", raising=False)
    monkeypatch.setattr(lambda_function, "sqs", FilaFalsa())

    with pytest.raises(KeyError):
        lambda_function.lambda_handler(evento("originals/abc.jpg"), None)
