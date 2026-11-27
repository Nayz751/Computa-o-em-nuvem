# TraceMark

O TraceMark é uma interface web voltada à aproximação entre fotógrafos esportivos e corredores. Este repositório contém a implementação do frontend, com navegação, telas e dados de demonstração, e o worker de marca d'água que roda no Amazon ECS (`apps/worker`).

## Funcionalidades disponíveis

- Visualização do mural de fotografias.
- Pesquisa e consulta de fotografias e eventos.
- Visualização dos detalhes de uma fotografia, incluindo fotógrafo, evento, valor e prévia com marca d’água.
- Cadastro e login com seleção de perfil de corredor ou fotógrafo.
- Visualização e edição das informações básicas do perfil.
- Área do fotógrafo para enviar imagens e consultar as fotografias publicadas.
- Organização das fotografias publicadas por evento.
- Pré-visualização das imagens selecionadas, validação dos arquivos e mensagens de confirmação ou erro.
- Aplicação demonstrativa de marca d’água no navegador.

## Tecnologias

- React
- TypeScript
- Vite
- React Router DOM
- CSS

As dependências e versões utilizadas estão declaradas em `package.json`.

## Organização do frontend

A estrutura original do projeto foi mantida:

```text
src/
  assets/       arquivos estáticos
  components/   componentes reutilizáveis da interface
    common/     botões, campos, modais e feedback
    layout/     cabeçalho, navegação e estruturas de página
    photos/     componentes de exibição de fotografias
    uploads/    seleção e pré-visualização de imagens
    requests/   componentes relacionados ao fluxo de solicitações existente no código
    dashboard/  componentes de indicadores existentes no código
  context/      estado compartilhado e notificações
  hooks/        hooks reutilizáveis
  mocks/        dados de demonstração
  models/       tipos e modelos da aplicação
  pages/        páginas da interface
  routes/       definição e proteção das rotas
  services/     operações e regras utilizadas pelo frontend
  styles/       tokens, estilos de componentes e páginas
  utils/        funções auxiliares
```

A separação por pastas organiza a interface, o estado da aplicação, os modelos e as operações utilizadas pelas páginas. Alguns módulos permanecem na estrutura original mesmo quando suas telas não fazem parte da navegação principal simplificada.

## Executar o projeto

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

O Vite informa no terminal o endereço local para abrir a aplicação (normalmente `http://localhost:5173`).

Comandos adicionais:

```bash
npm run typecheck
npm run build
```

## Worker de marca d’água (Amazon ECS)

O worker fica em `apps/worker` e é independente do frontend. Ele é escrito em Python com a biblioteca Pillow e roda continuamente no Amazon ECS (EC2 Launch Type).

```text
apps/worker/
  worker.py              código do worker
  requirements.txt       Pillow, boto3 (S3 e SQS) e psycopg2 (PostgreSQL)
  Dockerfile             imagem do container
  fonts/                 fonte usada no texto da marca d’água
  task-definition.json   Task Definition do ECS (valores de exemplo)
```

### Funcionamento

A Lambda `process-photo-upload` envia para a fila SQS a mensagem `{"photo_id", "bucket", "key"}` sempre que uma foto chega em `originals/`. Para cada mensagem, o worker:

1. baixa a foto original do S3;
2. aplica a marca d’água (texto repetido na diagonal) e reduz a imagem para até 1600 px;
3. salva o resultado em `watermarked/<photo_id>.jpg`;
4. atualiza a foto no RDS para `PUBLICAVEL` e apaga a mensagem da fila.

Em caso de falha, a foto é marcada como `ERRO` no RDS. Se o arquivo não for uma imagem, a mensagem é apagada, pois uma nova tentativa não resolveria. Nos demais casos a mensagem não é apagada: o SQS a entrega novamente e, após 3 tentativas, ela vai para a fila de mensagens mortas (DLQ).

O worker usa três variáveis de ambiente, definidas na Task Definition: `AWS_REGION`, `QUEUE_URL` e `DATABASE_URL`. As credenciais da AWS vêm da Task Role, sem chaves no código.

### Implantação (região us-east-2)

1. **IAM:** criar a role `tracemark-worker-task-role` (serviço *Elastic Container Service Task*) com permissão para ler e apagar mensagens da fila, ler `originals/` e gravar em `watermarked/` no bucket.
2. **ECR:** criar o repositório privado `tracemark-worker`.
3. **Imagem:** no CloudShell, com a pasta `apps/worker`:
   ```bash
   CONTA=$(aws sts get-caller-identity --query Account --output text)
   aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $CONTA.dkr.ecr.us-east-2.amazonaws.com
   docker build -t $CONTA.dkr.ecr.us-east-2.amazonaws.com/tracemark-worker:latest .
   docker push $CONTA.dkr.ecr.us-east-2.amazonaws.com/tracemark-worker:latest
   ```
4. **Cluster:** criar `tracemark-cluster` com instâncias EC2 (sem Fargate), `t3.micro`, capacidade 1, em sub-rede pública com IP público.
5. **Task Definition:** criar o grupo de logs `/ecs/tracemark-worker` no CloudWatch e registrar `task-definition.json` pelo console (opção JSON), preenchendo conta, fila e banco. A senha do banco é informada apenas no console, nunca no repositório.
6. **Service:** no cluster, criar um serviço do tipo EC2, réplica, com 1 tarefa desejada. O ECS mantém a tarefa em execução continuamente.
7. **Banco:** liberar a porta 5432 do RDS para o grupo de segurança da instância do cluster.

Os logs ficam em CloudWatch, no grupo `/ecs/tracemark-worker`.

## Observações

Os dados de demonstração e o comportamento efetivamente implementado na interface devem ser considerados dentro do escopo do frontend. Não são descritas aqui funcionalidades futuras.
