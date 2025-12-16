# API de Enquetes – Trabalho III

## Descrição

Esta é uma **API REST** desenvolvida em **Node.js** (com TypeScript opcional), seguindo **Clean Architecture** e **Domain-Driven Design (DDD)**, para gerenciar enquetes.

A API permite que usuários autenticados:

- Criem enquetes com múltiplas opções;
- Votem em enquetes respeitando regras de negócio;
- Visualizem resultados parciais (públicos ou privados);
- Consultem histórico de enquetes criadas e votadas;
- Filtrar enquetes por categorias, status, datas e número de votos.

implementa desafio extras A como notificação por e-mail.

---

## Tecnologias

- Node.js
- Express
- Prisma ORM
- JWT para autenticação
- bcrypt para hash de senhas
- Zod para validação de payloads
- dotenv para variáveis de ambiente
- Nodemailer (para envio de e-mails,desafio extra)
- Docker & Docker Compose

---

## Pré-requisitos

- Node.js >= 20
- npm / yarn / pnpm
- Docker (opcional)
- Banco de dados configurado (SQLite por padrão)

---

## Instalação

```bash
npm install
# ou
yarn install
npx prisma migrate dev
npm run dev
# ou
npm run build
npm start
```

    docker compose up



