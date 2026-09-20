# TradeIn - Paper Trading Platform

A simulated stock trading platform built with Node.js, Express, PostgreSQL, and Redis.

Part of the **[Microservices & ML Data Platform Portfolio](../README.md)**.

---

## 🌟 Overview

TradeIn enables risk-free equity and asset trading simulation for educational and algorithmic testing purposes. It enforces transactional ledger integrity in PostgreSQL and uses Redis caching for low-latency ticker quotes and portfolio state management.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js 22 (LTS)
* **Framework:** Express.js
* **Database:** PostgreSQL 17 (relational ledger, portfolios, orders)
* **Cache:** Redis 7 (in-memory quotes, session state)
* **Validation:** Joi schema validation
* **Testing:** Jest, Supertest
* **Containerization:** Docker & Docker Compose

---

## 🚀 Quick Start

### 1. Using Docker (Recommended)

```bash
# Start API (port 4005), Postgres (port 5435), and Redis (port 6380)
docker compose up --build -d

# Verify health status
curl http://localhost:4005/health

# View logs
docker compose logs -f api
```

### 2. Running Locally

```bash
npm install
cp .env.example .env

# Initialize DB schema & seed demo users/orders
npm run seed

# Start server
npm run dev

# Run automated tests
npm test
```

---

## 🔌 API Endpoints

### Health Check
* `GET /health` - Service health, PostgreSQL connection status, uptime

### Users & Authentication (`/api/users`)
* `POST /api/users/register` - Create simulated trader account
* `GET /api/users/:id` - Retrieve user profile and buying power

### Portfolios (`/api/portfolios`)
* `GET /api/portfolios/:userId` - Fetch active portfolio balances, cash, and P&L
* `GET /api/portfolios/:userId/holdings` - List current stock positions and average costs

### Orders (`/api/orders`)
* `POST /api/orders` - Submit order (`BUY`/`SELL`, `MARKET`/`LIMIT`)
* `GET /api/orders/:userId` - List historical and pending orders
* `DELETE /api/orders/:id` - Cancel pending order

### Watchlists (`/api/watchlist`)
* `GET /api/watchlist/:userId` - Fetch tracked stock symbols
* `POST /api/watchlist/:userId` - Add ticker to watchlist
* `DELETE /api/watchlist/:userId/:symbol` - Remove ticker from watchlist

---

## 🧪 Testing

```bash
npm test
```
Tests execution validation, cash balance deductions, and order placement limits.
