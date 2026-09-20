const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { validateOrder } = require('../middleware/validation');

router.post('/:portfolioId', async (req, res) => {
  const { error, value } = validateOrder(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const orderId = `ORD-${uuidv4().substring(0, 8)}`;
  const totalAmount = value.quantity * (value.price || 100);

  const query = `
    INSERT INTO orders (order_id, portfolio_id, symbol, order_type, action, quantity, price, total_amount, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
    RETURNING *
  `;

  const result = await pool.query(query, [
    orderId,
    req.params.portfolioId,
    value.symbol,
    value.order_type,
    value.action,
    value.quantity,
    value.price || 100,
    totalAmount
  ]);

  res.status(201).json(result.rows[0]);
});

router.get('/:portfolioId', async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const result = await pool.query(
    `SELECT * FROM orders
     WHERE portfolio_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.params.portfolioId, parseInt(limit), parseInt(offset)]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM orders WHERE portfolio_id = $1',
    [req.params.portfolioId]
  );

  res.json({
    orders: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
});

router.patch('/:orderId', async (req, res) => {
  const allowedFields = ['status', 'price', 'execution_time'];
  const updates = {};

  allowedFields.forEach(field => {
    if (field in req.body) {
      updates[field] = req.body[field];
    }
  });

  const setClause = Object.keys(updates)
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(', ');

  const result = await pool.query(
    `UPDATE orders SET ${setClause} WHERE order_id = $${Object.keys(updates).length + 1} RETURNING *`,
    [...Object.values(updates), req.params.orderId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(result.rows[0]);
});

router.delete('/:orderId', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM orders WHERE order_id = $1 RETURNING *',
    [req.params.orderId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ message: 'Order cancelled successfully' });
});

module.exports = router;
