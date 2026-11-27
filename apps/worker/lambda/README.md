# Lambda - pipeline de processamento

## função
Nome: process-photo-upload

Runtime: Python 3.12

Região: us-east-2 (Ohio)

## funcionamento

a função é acionada quando uma imagem é enviada para a pasta "originals/" do S3
ela valida a extensão do arquivo e envia uma mensagem para a fila SQS

## extensões aceitas
JPG, JPEG, PNG

## fila SQS
nome: photo-processing-queue

## estrutura da mensagem
 photo_id
 bucket
 key

## fluxo

S3 -> lambda -> SQS -> worker ECS

## pastas do S3
 originals/: fotos sem marca d'água
 watermarked/: fotos com marca d'água
