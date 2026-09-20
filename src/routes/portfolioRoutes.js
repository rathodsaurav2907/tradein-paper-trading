const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { validatePortfolio } = require('../middleware/validation');

router.post('/:userId', async (req, res) => {
  const { error, value } = validatePortfolio(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const portfolioId = `PORT-${uuidv4().substring(0, 8)}`;
  const initialBalance = req.body.initial_balance || 100000;

  const query = `
    INSERT INTO portfolios (portfolio_id, user_id, portfolio_name, cash_balance, total_value)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await pool.query(query, [
    portfolioId,
    req.params.userId,
    value.portfolio_name,
    initialBalance,
    initialBalance
  ]);

  res.status(201).json(result.rows[0]);
});

router.get('/:userId', async (req, res) => {
  const cacheKey = `portfolios:${req.params.userId}`;
  
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query(
    'SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC',
    [req.params.userId]
  );

  await redisClient.setEx(cacheKey, 1800, JSON.stringify(result.rows));
  res.json(result.rows);
});

router.get('/:userId/:portfolioId', async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, json_agg(h.*) as holdings
     FROM portfolios p
     LEFT JOIN holdings h ON p.portfolio_id = h.portfolio_id
     WHERE p.user_id = $1 AND p.portfolio_id = $2
     GROUP BY p.id`,
    [req.params.userId, req.params.portfolioId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  res.json(result.rows[0]);
});

module.exports = router;
