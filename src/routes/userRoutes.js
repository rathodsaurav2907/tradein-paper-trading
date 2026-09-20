const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { validateUser } = require('../middleware/validation');

router.post('/', async (req, res) => {
  const { error, value } = validateUser(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const userId = `USER-${uuidv4().substring(0, 8)}`;
  const query = `
    INSERT INTO users (user_id, username, email, full_name, initial_balance)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await pool.query(query, [
    userId,
    value.username,
    value.email,
    value.full_name,
    req.body.initial_balance || 100000
  ]);

  res.status(201).json(result.rows[0]);
});

router.get('/', async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  const result = await pool.query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [parseInt(limit), parseInt(offset)]
  );

  const countResult = await pool.query('SELECT COUNT(*) FROM users');

  res.json({
    users: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
});

router.get('/:id', async (req, res) => {
  const cacheKey = `user:${req.params.id}`;
  
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query(
    'SELECT * FROM users WHERE user_id = $1 OR id = $1',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows[0]));
  res.json(result.rows[0]);
});

module.exports = router;
