const request = require('supertest');
const app = require('../src/server');
const { pool } = require('../src/db');

beforeAll(async () => {
  // Test database ready
  try {
    await pool.query('SELECT NOW()');
  } catch (error) {
    console.error('Database not available:', error.message);
  }
  // Ensure idempotent re-runs against a non-ephemeral database
  await pool.query("DELETE FROM users WHERE username = 'testuser' OR email = 'test@tradein.com'");
});

afterAll(async () => {
  await pool.end();
});

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('TradeIn Paper Trading');
  });
});

describe('User Endpoints', () => {
  let userId;

  test('POST /api/users - Create user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        email: 'test@tradein.com',
        full_name: 'Test User',
        initial_balance: 50000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('testuser');
    userId = res.body.user_id;
  });

  test('GET /api/users - List users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  test('GET /api/users/:id - Get user', async () => {
    if (!userId) return;
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user_id).toBe(userId);
  });
});

describe('Portfolio Endpoints', () => {
  let portfolioId, userId;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/users')
      .send({
        username: `user${Date.now()}`,
        email: `user${Date.now()}@tradein.com`,
        full_name: 'Portfolio Test',
        initial_balance: 100000
      });
    userId = userRes.body.user_id;
  });

  test('POST /api/portfolios/:userId - Create portfolio', async () => {
    const res = await request(app)
      .post(`/api/portfolios/${userId}`)
      .send({
        portfolio_name: 'Test Portfolio',
        initial_balance: 75000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.portfolio_name).toBe('Test Portfolio');
    portfolioId = res.body.portfolio_id;
  });

  test('GET /api/portfolios/:userId - List portfolios', async () => {
    const res = await request(app).get(`/api/portfolios/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('Order Endpoints', () => {
  let orderId, portfolioId, userId;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/users')
      .send({
        username: `user${Date.now()}`,
        email: `user${Date.now()}@tradein.com`,
        full_name: 'Order Test',
        initial_balance: 100000
      });
    userId = userRes.body.user_id;

    const portRes = await request(app)
      .post(`/api/portfolios/${userId}`)
      .send({
        portfolio_name: 'Order Test Portfolio',
        initial_balance: 100000
      });
    portfolioId = portRes.body.portfolio_id;
  });

  test('POST /api/orders/:portfolioId - Create order', async () => {
    const res = await request(app)
      .post(`/api/orders/${portfolioId}`)
      .send({
        symbol: 'AAPL',
        order_type: 'market',
        action: 'buy',
        quantity: 10,
        price: 150
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.symbol).toBe('AAPL');
    expect(res.body.status).toBe('pending');
    orderId = res.body.order_id;
  });

  test('GET /api/orders/:portfolioId - List orders', async () => {
    const res = await request(app).get(`/api/orders/${portfolioId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.orders).toBeInstanceOf(Array);
  });

  test('PATCH /api/orders/:orderId - Update order', async () => {
    if (!orderId) return;
    const res = await request(app)
      .patch(`/api/orders/${orderId}`)
      .send({
        status: 'executed',
        price: 160
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('executed');
  });

  test('DELETE /api/orders/:orderId - Cancel order', async () => {
    if (!orderId) return;
    const res = await request(app).delete(`/api/orders/${orderId}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('Watchlist Endpoints', () => {
  let userId;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/users')
      .send({
        username: `user${Date.now()}`,
        email: `user${Date.now()}@tradein.com`,
        full_name: 'Watchlist Test',
        initial_balance: 50000
      });
    userId = userRes.body.user_id;
  });

  test('POST /api/watchlist/:userId - Add to watchlist', async () => {
    const res = await request(app)
      .post(`/api/watchlist/${userId}`)
      .send({
        symbol: 'GOOGL'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.symbol).toBe('GOOGL');
  });

  test('GET /api/watchlist/:userId - Get watchlist', async () => {
    const res = await request(app).get(`/api/watchlist/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
