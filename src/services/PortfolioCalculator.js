const { pool } = require('../db');

class PortfolioCalculator {
  static async calculatePortfolioValue(portfolioId) {
    const result = await pool.query(
      `SELECT 
        p.cash_balance,
        COALESCE(SUM(h.current_value), 0) as holdings_value
      FROM portfolios p
      LEFT JOIN holdings h ON p.portfolio_id = h.portfolio_id
      WHERE p.portfolio_id = $1
      GROUP BY p.cash_balance`,
      [portfolioId]
    );

    if (result.rows.length === 0) return 0;

    const row = result.rows[0];
    return parseFloat(row.cash_balance) + parseFloat(row.holdings_value || 0);
  }

  static async calculateGainLoss(portfolioId) {
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(h.gain_loss), 0) as total_gain_loss
      FROM holdings h
      WHERE h.portfolio_id = $1`,
      [portfolioId]
    );

    return parseFloat(result.rows[0].total_gain_loss || 0);
  }
}

module.exports = PortfolioCalculator;
