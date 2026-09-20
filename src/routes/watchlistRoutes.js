const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.post('/:userId', async (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const watchlistId = `WL-${uuidv4().substring(0, 8)}`;

  const query = `
    INSERT INTO watchlist (watchlist_id, user_id, symbol)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, symbol) DO NOTHING
    RETURNING *
  `;

  const result = await pool.query(query, [watchlistId, req.params.userId, symbol]);

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Symbol already in watchlist' });
  }

  // Invalidate cache
  await redisClient.del(`watchlist:${req.params.userId}`);

  res.status(201).json(result.rows[0]);
});

router.get('/:userId', async (req, res) => {
  const cacheKey = `watchlist:${req.params.userId}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query(
    'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_date DESC',
    [req.params.userId]
  );

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows));
  res.json(result.rows);
});

router.delete('/:userId/:symbol', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2 RETURNING *',
    [req.params.userId, req.params.symbol]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Symbol not in watchlist' });
  }

  // Invalidate cache
  await redisClient.del(`watchlist:${req.params.userId}`);

  res.json({ message: 'Symbol removed from watchlist' });
});

module.exports = router;
