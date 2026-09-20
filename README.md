# TradeIn - Paper Trading Platform

[![CI/CD](https://github.com/rathodsaurav2907/tradein-paper-trading/actions/workflows/ci.yml/badge.svg)](https://github.com/rathodsaurav2907/tradein-paper-trading/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?logo=redis&logoColor=white)](https://redis.io/)

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
