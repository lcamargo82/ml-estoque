# ML Estoque - Sistema de Gestão Premium

Um ecossistema moderno e escalável para gerenciamento de inventário, construído com tecnologias de ponta e uma arquitetura modular robusta.

## 🚀 Tecnologias

### Backend (NestJS)
- **Framework**: NestJS 10 (Modular)
- **BD**: PostgreSQL + TypeORM
- **Logs**: Winston
- **Métricas**: OpenTelemetry + Prometheus
- **Documentação**: Scalar (API Reference)
- **Segurança**: JWT + Roles (Admin-only creation)

### Frontend (Vue.js 3)
- **Build Tool**: Vite
- **Linguagem**: TypeScript
- **Estado**: Pinia
- **Estilo**: Tailwind CSS (Design System Global)
- **Servidor**: Nginx (Production optimized)

## 🎨 Design System

O frontend segue um padrão visual "Premium Dark" com a seguinte paleta de cores:
- **Primária**: `#a951c6` (Roxo Vibrante)
- **Secundária**: `#90699a` (Lilás Suave)
- **Terciária**: `#4f3800` (Ouro Envelhecido)
- **Neutra**: `#7e747d` (Cinza Urbano)
- **Fundo**: `#0f172a` (Deep Dark)

## 🛠️ Como Iniciar (Docker)

Todo o ambiente é orquestrado via Docker para garantir paridade entre desenvolvimento e produção.

1.  **Clonar o repositório**
2.  **Navegar até a pasta do projeto**:
    ```bash
    cd projeto-nest
    ```
3.  **Subir os serviços**:
    ```bash
    docker-compose up -d --build
    ```
4.  **Configurar o Banco (Migrations & Seeding)**:
    Instale as tabelas e o usuário administrador padrão com seus produtos de exemplo:
    ```bash
    # 1. Criar as tabelas no banco de dados
    docker exec -it nest_api npm run migration:run

    # 2. Inserir dados iniciais (Admin e Produtos)
    docker exec -it nest_api npm run seed
    ```

## 🔐 Acessos Padrão

- **Frontend**: [http://localhost](http://localhost) (Porta 80)
- **API Reference**: [http://localhost:3000/reference](http://localhost:3000/reference)
- **Logs/Metrics**: [http://localhost:9090](http://localhost:9090) (Prometheus)

**Usuário Admin Inicial:**
- **Login**: `le.camargo81@gmail.com`
- **Senha**: `@ML_070426`

---
*Desenvolvido com Antigravity Kit - 2026*
