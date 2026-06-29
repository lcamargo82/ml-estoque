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

## 🛠️ Como Iniciar

Você pode rodar o ecossistema completo usando Docker ou subir os serviços individualmente em modo de desenvolvimento local para agilizar o processo de hot-reload.

### Opção A: Orquestração Completa via Docker

Todo o ambiente é configurado para rodar com paridade de produção/desenvolvimento via Docker Compose.

1. **Navegar até a pasta do projeto**:
   ```bash
   cd projeto-nest
   ```
2. **Subir os serviços**:
   ```bash
   docker-compose up -d --build
   ```
3. **Configurar o Banco (Migrations & Seeding)**:
   ```bash
   # Criar tabelas
   docker exec -it nest_api npm run migration:run

   # Inserir dados iniciais (Admin e Produtos de exemplo)
   docker exec -it nest_api npm run seed
   ```

---

### Opção B: Desenvolvimento Local (Watch/Hot-Reload)

Para desenvolvimento rápido com hot-reload ativo em todos os serviços, você pode rodar os servidores Node.js localmente.

#### 1. Banco de Dados (PostgreSQL via Docker)
Suba apenas o serviço do banco de dados para evitar a necessidade de instalar o PostgreSQL na sua máquina local:
```bash
cd projeto-nest
docker-compose up -d db
```

#### 2. Backend (API NestJS)
1. Acesse o diretório da API:
   ```bash
   cd projeto-nest/api
   ```
2. Crie o arquivo `.env` (baseado no `.env.example`) e configure a conexão com o banco local:
   ```properties
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=user
   DATABASE_PASSWORD=password
   DATABASE_NAME=nest_db
   ```
3. Instale as dependências e inicialize:
   ```bash
   npm install
   npm run migration:run
   npm run seed        # Opcional para dados fictícios
   npm run start:dev   # API rodará em http://localhost:3000
   ```

#### 3. Frontend (Web Vue.js 3)
1. Acesse o diretório do frontend:
   ```bash
   cd ../frontend
   ```
2. Instale as dependências e inicie o Vite:
   ```bash
   npm install
   npm run dev         # Frontend rodará em http://localhost:5173
   ```

---

### 📱 Configuração do Mobile (Capacitor/Ionic)

O projeto mobile é construído com Ionic + Capacitor, gerando uma pasta nativa `/android` pronta para compilação.

#### 1. Ajuste de IP do Emulador/Dispositivo
Como emuladores e aparelhos físicos não conseguem acessar a API local por `localhost`, você deve configurar o IP local de sua máquina de rede.

1. Acesse o diretório mobile:
   ```bash
   cd ../mobile
   ```
2. Edite o `.env` especificando o IP local da sua máquina:
   ```properties
   VITE_API_URL=http://<SEU_IP_LOCAL>:3000/api/v1
   ```

#### 2. Sincronização e Abertura no Android Studio
1. Instale as dependências e prepare o build web:
   ```bash
   npm install
   npm run android:sync # Compila a web e copia os assets para a pasta nativa Android
   ```
2. Abra o projeto no **Android Studio**:
   - **Via CLI (Recomendado)**:
     ```bash
     npx cap open android
     ```
   - **Via Interface do Android Studio**:
     Selecione a opção **"Open"** e escolha a pasta:
     `/Users/leandro/Documents/Projetos/ml_estoque/projeto-nest/mobile/android`
3. Aguarde o término da sincronização do Gradle e clique no ícone **Run** (Play verde) para iniciar no seu emulador ou dispositivo físico conectado.

---

## 🔐 Acessos Padrão

- **Frontend (Docker)**: [http://localhost](http://localhost) (Porta 80)
- **Frontend (Local Dev)**: [http://localhost:5173](http://localhost:5173) (Vite)
- **API Reference**: [http://localhost:3000/reference](http://localhost:3000/reference)
- **Logs/Metrics**: [http://localhost:9090](http://localhost:9090) (Prometheus)

**Usuário Admin Inicial:**
- **Login**: `le.camargo81@gmail.com`
- **Senha**: `@ML_070426`

## 📊 Importação e Exportação via Excel

O sistema permite a importação e exportação em lote de produtos utilizando planilhas no formato `.xlsx`. A importação realiza um **Upsert** (insere novos produtos ou atualiza existentes correspondendo pelo **SKU**).

### Padrão de Colunas da Planilha

| Cabeçalho Excel | Tipo | Obrigatório | Regras e Formato |
| :--- | :--- | :--- | :--- |
| **Nome** | Texto | Sim | Nome de exibição do produto |
| **SKU** | Texto | Sim | Identificador único do produto (usado para localizar duplicidades) |
| **Slug** | Texto | Não | Slug para URL. Se deixado em branco, será gerado automaticamente a partir do Nome |
| **Quantidade** | Inteiro | Não | Quantidade em estoque. Se omitido em atualizações, preserva o valor atual (mínimo: 0) |
| **Preço de Custo** | Decimal | Não | Valor de custo unitário. Se omitido em atualizações, preserva o valor atual (mínimo: 0) |
| **Preço de Venda ML** | Decimal | Não | Valor de venda no Mercado Livre. Se omitido em atualizações, preserva o valor atual (mínimo: 0) |
| **Preço de Venda Direta** | Decimal | Não | Valor de venda em canais diretos. Se omitido em atualizações, preserva o valor atual (mínimo: 0) |
| **Anunciado ML (Sim/Não)** | Texto | Não | Deve conter `Sim` para anunciado ou `Não` para não anunciado. Se omitido em atualizações, preserva o valor atual |
| **Fornecedor (Nome ou ID)** | Texto | Não | Nome ou UUID do fornecedor cadastrado. A busca é feita sem distinção de maiúsculas/minúsculas. Se omitido em atualizações, preserva o valor atual |
| **Imagens (URLs separadas por vírgula)** | Texto | Não | Lista de URLs de imagens do produto separadas por vírgula. Se omitido em atualizações, preserva as fotos atuais. Se enviado vazio, limpa as imagens |

> 💡 **Nota sobre atualizações:** Se um produto com o SKU informado já existir no banco, quaisquer campos opcionais deixados em branco (vazios) na planilha **não serão sobrescritas**, preservando os valores já cadastrados no banco de dados.

> 💡 **Dica:** Para gerar uma planilha modelo com a formatação e os cabeçalhos corretos, utilize o botão **"Exportar Excel"** na listagem de Catálogo do sistema.

---
*Desenvolvido com Antigravity Kit - 2026*

