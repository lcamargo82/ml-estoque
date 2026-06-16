# Plano de Implementação: Importação e Exportação de Produtos via Excel

Este documento detalha o planejamento para criar o módulo de importação e exportação de produtos utilizando planilhas Excel (`.xlsx`), mapeando todos os campos do cadastro do produto.

---

## Overview
Implementar suporte para importação e exportação em lote de produtos por meio de planilhas Excel.
- **Exportação**: Gera uma planilha `.xlsx` com cabeçalhos claros contendo todas as propriedades de cadastro do produto, preenchida com os dados atuais do estoque.
- **Importação**: Lê uma planilha `.xlsx` enviada pelo usuário, resolve opcionalmente os fornecedores por nome/ID, trata duplicidades (atualiza o produto caso o SKU já exista, ou cria um novo caso não exista) e salva em lote.

---

## Project Type
**WEB** (composto por API NestJS no backend e App Vue 3 no frontend).

---

## Success Criteria
- Instalação e integração bem-sucedida do pacote `exceljs`.
- Rota `GET /api/v1/import-export/export` gerando e enviando uma planilha `.xlsx` válida com formatação adequada e auto-ajuste de colunas.
- Rota `POST /api/v1/import-export/import` processando arquivos Excel multipart/form-data com tratamento de erros de validação nas linhas.
- Botões de "Importar Planilha" e "Exportar Planilha" inseridos na barra de ações da página de Catálogo no frontend Web.
- Notificação de progresso/sucesso da importação e recarga automática do estoque na tela.

---

## Tech Stack
- **Bibliotecas Adicionais (Backend)**: `exceljs` (processador de planilhas Excel).
- **Backend**: NestJS, TypeORM, PostgreSQL.
- **Frontend**: Vue 3, Axios, Tailwind CSS.

---

## File Structure

```plaintext
projeto-nest/
├── api/
│   └── src/
│       ├── app.module.ts                   # Modificado (registro do ImportExportModule)
│       └── modules/
│           └── import-export/              # Novo módulo
│               ├── import-export.module.ts
│               ├── import-export.controller.ts
│               └── import-export.service.ts
└── frontend/
    └── src/
        ├── repositories/
        │   └── ImportExportRepository.ts   # Novo repositório
        └── views/
            └── Products.vue                # Modificado (adição dos botões e upload de arquivo)
```

---

## Mapeamento de Colunas do Excel

Para facilitar o preenchimento, usaremos cabeçalhos amigáveis em português:

| Cabeçalho Excel | Campo da Entidade | Tipo | Regras / Observações |
| :--- | :--- | :--- | :--- |
| **Nome** | `name` | Texto | Obrigatório |
| **SKU** | `sku` | Texto | Obrigatório, chave única |
| **Slug** | `slug` | Texto | Opcional (auto-gerado se vazio) |
| **Quantidade** | `quantity` | Inteiro | Obrigatório (min: 0) |
| **Preço de Custo** | `purchasePrice` | Decimal | Obrigatório (min: 0) |
| **Preço de Venda ML** | `mlSellingPrice` | Decimal | Obrigatório (min: 0) |
| **Preço de Venda Direta** | `directSellingPrice` | Decimal | Obrigatório (min: 0) |
| **Anunciado ML (Sim/Não)** | `isListedOnML` | Booleano | Mapeado de "Sim"/"Não" ou True/False |
| **Fornecedor (Nome ou ID)** | `supplierId` | Texto | Opcional. Busca fornecedor pelo nome exato no banco; se não achado, deixa vazio |
| **Imagens (URLs separadas por vírgula)** | `images` | Texto | Opcional. Lista de URLs das imagens associadas |

---

## Task Breakdown

### Task 1: Instalar Dependência `exceljs` no Backend
- **Agent**: `devops-engineer`
- **Skills**: `bash-linux`
- **Input**: Pasta da API backend
- **Output**: Pacote `exceljs` adicionado ao `package.json` da API.
- **Verify**: Execução bem-sucedida do comando `pnpm add exceljs` no diretório `projeto-nest/api`.

### Task 2: Criar Estrutura do ImportExportModule
- **Agent**: `backend-specialist`
- **Skills**: `nestjs-expert`
- **Input**: Diretórios da API
- **Output**: Arquivos do módulo criados e registrados no [app.module.ts](file:///Users/leandro/Documents/Projetos/ml_estoque/projeto-nest/api/src/app.module.ts).
- **Verify**: A API reinicia com sucesso e compila normalmente.

### Task 3: Implementar Serviço de Exportação de Excel
- **Agent**: `backend-specialist`
- **Skills**: `clean-code`
- **Input**: Acesso aos repositórios de `Product` e `Supplier`.
- **Output**: Lógica no `ImportExportService` que consulta todos os produtos do estoque e gera o arquivo binário do Excel usando a API do `exceljs`.
- **Verify**: Rota `GET /import-export/export` inicia download de um arquivo `.xlsx` válido que abre no Excel/Google Sheets.

### Task 4: Implementar Serviço de Importação de Excel
- **Agent**: `backend-specialist`
- **Skills**: `clean-code`
- **Input**: Buffer do arquivo Excel enviado via multipart form.
- **Output**: Lógica no `ImportExportService` que decodifica as linhas da planilha, valida tipos, busca correspondência de SKUs existentes e salva em lote (inserindo ou atualizando).
- **Verify**: Rota `POST /import-export/import` processa a planilha com sucesso, cadastrando novos produtos e editando os existentes.

### Task 5: Criar Repositório e Conectar Frontend Web
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Input**: [Products.vue](file:///Users/leandro/Documents/Projetos/ml_estoque/projeto-nest/frontend/src/views/Products.vue)
- **Output**: Adicionados botões de exportação e input file oculto para importação na barra de ferramentas.
- **Verify**: Teste manual de importação e exportação de planilha na UI, verificando atualização imediata da tabela de produtos.

---

## Phase X: Verification

- [ ] Lint & Type Check: `docker exec nest_api npm run lint` e `npx tsc --noEmit`
- [ ] Build: `docker compose build` passa sem erros
- [ ] Teste de Fluxo Completo: Exportar planilha, alterar valores de um produto, adicionar uma nova linha, importar de volta e verificar a consistência no banco.
