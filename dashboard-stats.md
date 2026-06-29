# Plano de Implementação: Dashboard Stats

Este documento detalha o planejamento para a implementação do módulo de estatísticas do Dashboard (Opção C) e a correspondente exibição dos dados reais no frontend (Opção 1).

---

## Overview
Implementar um módulo dedicado de estatísticas (`DashboardModule`) na API backend para agregação de dados de produtos e atualizar os cards visuais na interface web para exibir:
1. Total de unidades em estoque (soma de quantidades).
2. Valor total investido (soma de preço de custo).
3. Divisão de anúncios no Mercado Livre (anunciados vs não anunciados).

---

## Project Type
**WEB** (composto por API NestJS no backend e App Vue 3 no frontend).

---

## Success Criteria
- Rota `GET /api/v1/dashboard/stats` funcional e protegida por JWT.
- Redução de payload: os cálculos agregados ocorrem no banco de dados.
- O frontend exibe os dados corretos no painel, com o valor monetário formatado como Real Brasileiro (R$).
- Rebuild e inicialização de todos os containers sem falhas de rede ou portas.

---

## Tech Stack
- **Backend**: NestJS, TypeORM, PostgreSQL.
- **Frontend**: Vue 3, TypeScript, Axios, Tailwind CSS.

---

## File Structure

```plaintext
projeto-nest/
├── api/
│   └── src/
│       ├── app.module.ts              # Modificado (registro do DashboardModule)
│       └── modules/
│           └── dashboard/             # Novo módulo
│               ├── dashboard.module.ts
│               ├── dashboard.controller.ts
│               └── dashboard.service.ts
├── frontend/
│   └── src/
│       ├── repositories/
│       │   └── DashboardRepository.ts  # Novo repositório
│       └── views/
│           └── Dashboard.vue          # Modificado (atualização da UI e chamadas de API)
└── mobile/
    └── src/
        └── views/
            └── HomeView.vue           # Modificado (consumo do endpoint e atualização dos cards)
```

---

## Task Breakdown

### Task 1: Criar o DashboardModule no Backend
- **Agent**: `backend-specialist`
- **Skills**: `nestjs-expert`, `api-patterns`
- **Input**: Estrutura atual da API
- **Output**: Arquivos `dashboard.module.ts`, `dashboard.controller.ts` e `dashboard.service.ts` criados.
- **Verify**: A API reinicia com sucesso e compila sem erros.

### Task 2: Implementar Query de Agregação no Service
- **Agent**: `database-architect` / `backend-specialist`
- **Skills**: `database-design`
- **Input**: Repositório de `Product` injetado no `DashboardService`.
- **Output**: Lógica de consulta SQL agregada usando `createQueryBuilder` implementada e testada no `DashboardService`.
- **Verify**: Execução da query retorna valores inteiros e decimais corretos, com tratamento de nulos.

### Task 3: Expor Endpoint no Controller
- **Agent**: `backend-specialist`
- **Skills**: `api-patterns`
- **Input**: `DashboardService` injetado no `DashboardController`.
- **Output**: Rota `GET /dashboard/stats` exposta, guardas de autorização (`JwtAuthGuard`) configuradas e documentação Swagger adicionada.
- **Verify**: Rota visível em `http://localhost:3000/reference`.

### Task 4: Criar DashboardRepository no Frontend
- **Agent**: `frontend-specialist`
- **Skills**: `typescript-expert`
- **Input**: Instância Axios configurada no frontend.
- **Output**: [DashboardRepository.ts](file:///Users/leandro/Documents/Projetos/ml_estoque/projeto-nest/frontend/src/repositories/DashboardRepository.ts) criado.
- **Verify**: Tipagem TS do retorno de estatísticas definida e validada.

### Task 5: Atualizar DashboardView (UI)
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Input**: [Dashboard.vue](file:///Users/leandro/Documents/Projetos/ml_estoque/projeto-nest/frontend/src/views/Dashboard.vue) e `DashboardRepository`.
- **Output**: Cards atualizados com os dados dinâmicos da API e helper de formatação de moeda brasileira (Intl.NumberFormat BRL) aplicado.
- **Verify**: Os 3 cards exibem os dados agregados corretos em tempo real na rota `http://localhost:8080/`.

### Task 6: Atualizar HomeView (Mobile)
- **Agent**: `mobile-developer`
- **Skills**: `mobile-design`
- **Input**: [HomeView.vue](file:///Users/leandro/Documents/Projetos/ml_estoque/projeto-nest/mobile/src/views/HomeView.vue) no app Capacitor.
- **Output**: Adicionar chamada ao endpoint `/dashboard/stats` e atualizar os cards correspondentes na tela inicial mobile, aplicando a mesma formatação BRL.
- **Verify**: App mobile carrega sem erros de runtime e reflete os valores consolidados.

---

## Phase X: Verification

- [x] Lint & Type Check: `docker exec nest_api npm run lint` e `npx tsc --noEmit`
- [x] Build: `docker compose build` passa sem erros
- [x] Runtime: Todos os containers em execução e saudáveis
- [x] Funcional: Exclusões, adições e edições de produtos atualizam corretamente os valores agregados no Dashboard.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-06-16
