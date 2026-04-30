# Controle de Compras Familiar

Aplicacao Next.js + TypeORM + PostgreSQL para controle de compras domesticas com:
- Login por email/senha
- Listas compartilhadas por familia
- Atualizacao em tempo real via WebSocket
- Registro de compras e historico de precos
- OCR local de foto para sugestao de cadastro de produto

## Rodar local
1. Copie `.env.example` para `.env`.
2. Suba um Postgres local.
3. Instale dependencias: `npm install`.
4. Execute: `npm run dev`.

## Variaveis
- `DATABASE_URL`
- `JWT_SECRET`
