const express = require('express');
const cors = require('cors');
require('express-async-errors');
const { pool } = require('./db');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const orderRoutes = require('./routes/orderRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      service: 'TradeIn Paper Trading',
      timestamp: new Date().toISOString(),
      database: result.rows[0].now ? 'connected' : 'error'
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully');

    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
