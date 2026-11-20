# TraceMark — Frontend

O TraceMark é uma interface web voltada à aproximação entre fotógrafos esportivos e corredores. Este repositório contém a implementação do frontend, com navegação, telas e dados de demonstração.

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

## Observações

Esta entrega documenta o frontend e sua organização. Os dados de demonstração e o comportamento efetivamente implementado na interface devem ser considerados dentro desse escopo. Não são descritos aqui serviços externos ou funcionalidades futuras.
