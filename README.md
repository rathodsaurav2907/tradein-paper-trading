# TradeIn - Paper Trading Platform

A simulated trading platform for educational use only - no brokerage connection, real-money order execution, or investment advice. The Docker environment provides a Node.js API, PostgreSQL, and Redis.

## Start

1. Copy `.env.example` to `.env`.
2. Add the API project under `api/` (Node 22, Express, PostgreSQL client/ORM).
3. Run `docker compose up --build`.

API: `http://localhost:4005`.

## Suggested milestones

- accounts, virtual cash, portfolios, watchlists, and paper orders
- deterministic price fixture service before adding any market-data API
- order lifecycle and transaction ledger with PostgreSQL migrations
- Redis quote cache and React dashboard
