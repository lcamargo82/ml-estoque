# Plano de Implementação: Recuperação de Senha via Link de E-mail (Web)

Este plano descreve a implementação do fluxo de recuperação de senha por link de e-mail ("Esqueci minha senha") para o projeto **ml_estoque**. O fluxo seguirá a **Opção A** (Link de redefinição com token de uso único) e estará disponível exclusivamente na interface web (o aplicativo móvel não terá a opção de redefinição).

---

## 🎯 Critérios de Sucesso

1. **Backend (NestJS):**
   - Criação de campos `resetPasswordToken` e `resetPasswordExpires` na tabela `users`.
   - Endpoint `POST /auth/forgot-password` que aceita um e-mail, gera um token seguro, salva a expiração (1 hora) e envia um e-mail HTML/texto estilizado através do servidor SMTP da Hostinger.
   - Endpoint `POST /auth/reset-password` que valida o token, atualiza a senha de forma segura (com hash bcrypt) e limpa os campos de token.
   - Cobertura de testes unitários para o fluxo de redefinição.
2. **Frontend Web (Vue 3):**
   - Adição do link "Esqueci minha senha" na tela de login.
   - Nova tela `/forgot-password` para inserir o e-mail de solicitação.
   - Nova tela `/reset-password` (com token na query param) para digitar a nova senha e confirmá-la.
   - Notificações visuais de sucesso ou erro (via `vue-toastification`).
3. **Segurança:**
   - Prevenção de enumeração de e-mails (retornar mensagem genérica mesmo se o e-mail não existir).
   - Expiração estrita de tokens.
   - Limpeza obrigatória do token de redefinição após o uso.
   - Rate limiting no envio de e-mails e na validação do token.

---

## 🛠️ Pilha Tecnológica
- **Backend:** NestJS, TypeORM, Nodemailer, PostgreSQL, `@nestjs/config` (Joi para validação de variáveis de ambiente).
- **Frontend:** Vue 3 (Composition API), Vue Router, Tailwind CSS, Axios, Pinia.

---

## 📁 Estrutura de Arquivos Proposta

### Backend (`projeto-nest/api/`)
```plaintext
src/
├── config/
│   └── env.validation.ts        # [MODIFICAR] Validação das novas variáveis SMTP
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── forgot-password.dto.ts # [NOVO] DTO para solicitar redefinição
│   │   │   └── reset-password.dto.ts  # [NOVO] DTO para redefinir senha
│   │   ├── auth.controller.ts   # [MODIFICAR] Adicionar endpoints de recuperação
│   │   └── auth.service.ts      # [MODIFICAR] Implementar lógica de geração de token
│   ├── mail/
│   │   ├── mail.module.ts       # [NOVO] Módulo de envio de e-mails
│   │   ├── mail.service.ts      # [NOVO] Serviço de envio via SMTP Hostinger
│   │   └── templates/           # [NOVO] Templates de e-mail
│   └── users/
│       └── entities/
│           └── user.entity.ts   # [MODIFICAR] Adicionar resetPasswordToken e resetPasswordExpires
```

### Frontend (`projeto-nest/frontend/`)
```plaintext
src/
├── router/
│   └── index.ts                 # [MODIFICAR] Adicionar rotas públicas de redefinição
├── views/
│   ├── ForgotPassword.vue       # [NOVO] Tela de inserção do e-mail
│   ├── ResetPassword.vue        # [NOVO] Tela de nova senha (validação do token)
│   └── Login.vue                # [MODIFICAR] Link para a tela de recuperar senha
```

---

## 📝 Detalhamento de Tarefas

### Tarefa 1: Atualização do Banco de Dados e Entidade User
- **Agente:** `database-architect`
- **Habilidades:** `database-design`
- **INPUT:** Arquivo `user.entity.ts`.
- **OUTPUT:** Entidade `User` com colunas `resetPasswordToken` (string, nullable) e `resetPasswordExpires` (timestamp, nullable).
- **VERIFICAÇÃO:** Executar `npm run build` na pasta `api` e gerar/rodar a migração do TypeORM para aplicar as alterações no banco de dados.

### Tarefa 2: Módulo de Envio de E-mail (MailModule) no NestJS
- **Agente:** `backend-specialist`
- **Habilidades:** `nodejs-best-practices`
- **INPUT:** Nova pasta `src/modules/mail`.
- **OUTPUT:** Módulo `MailModule` usando `nodemailer` que lê chaves SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`) do `ConfigService` e expõe um método para enviar e-mails estilizados em HTML.
- **VERIFICAÇÃO:** Testar o envio local ou injetar o serviço e verificar logs de sucesso.

### Tarefa 3: Endpoints de Recuperação no AuthModule
- **Agente:** `backend-specialist`
- **Habilidades:** `api-patterns`
- **INPUT:** Endpoints `POST /auth/forgot-password` e `POST /auth/reset-password` adicionados ao controller.
- **OUTPUT:** 
  - Geração segura de token com `crypto.randomBytes(32).toString('hex')`.
  - Salvamento dos dados na entidade `User` e envio do link `FRONTEND_URL/reset-password?token=TOKEN`.
  - Validação rigorosa na hora de redefinir e reset da senha utilizando hash `bcrypt`.
- **VERIFICAÇÃO:** Escrever testes de integração/unitários mockando o `MailService` e validar a resposta da API via Swagger ou chamadas cURL/Postman.

### Tarefa 4: Telas de Recuperação e Redefinição no Frontend Vue 3
- **Agente:** `frontend-specialist`
- **Habilidades:** `frontend-design`
- **INPUT:** Views `ForgotPassword.vue` e `ResetPassword.vue`.
- **OUTPUT:**
  - Formuários estilizados seguindo a identidade premium do app (`glass-card`, Tailwind, animações suaves, feedback visual de erros e sucesso).
  - Rotas configuradas no Vue Router como públicas.
- **VERIFICAÇÃO:** Testar navegação e interações de erro (senhas não coincidem, campo de e-mail inválido).

---

## 🔒 Variáveis de Ambiente Necessárias (Hostinger SMTP)
Adicionar no arquivo `.env` da API:
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=seu-email@hostinger.com
SMTP_PASSWORD=sua-senha-segura
SMTP_FROM="ML Estoque <seu-email@hostinger.com>"
FRONTEND_URL=http://localhost:5173
```

---

## ✅ Fase X: Verificação Final

Após a codificação das alterações, os seguintes passos de auditoria deverão ser executados:

1. **Validação de Código e Build:**
   - Rodar `npm run lint` nas pastas `api` e `frontend`.
   - Rodar `npm run build` em ambas as pastas para garantir que não existam erros de compilação ou de tipos TS.
2. **Varredura de Segurança:**
   - Executar a varredura automática:
     ```bash
     python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
     ```
3. **Auditoria de UX e Design:**
   - Garantir que as novas telas do frontend web respeitem a regra do "sem cores roxas" (Purple Ban) e utilizem as classes de design premium (`glass-card`, etc).
   - Executar:
     ```bash
     python .agent/skills/frontend-design/scripts/ux_audit.py .
     ```
4. **Verificação de Funcionamento:**
   - Levantar os containers Docker locais (`docker compose up -d`).
   - Testar o fluxo completo: inserir e-mail no formulário, capturar o e-mail gerado e as credenciais SMTP, acessar o link de redefinição com token, preencher a nova senha e realizar o login com sucesso no sistema.
