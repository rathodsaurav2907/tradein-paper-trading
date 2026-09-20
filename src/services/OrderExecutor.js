const { pool } = require('../db');

class OrderExecutor {
  static async executeOrder(orderId) {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult.rows[0];
    const portfolioResult = await pool.query(
      'SELECT * FROM portfolios WHERE portfolio_id = $1',
      [order.portfolio_id]
    );

    const portfolio = portfolioResult.rows[0];

    if (order.action === 'buy') {
      return this.executeBuy(order, portfolio);
    } else if (order.action === 'sell') {
      return this.executeSell(order, portfolio);
    }
  }

  static async executeBuy(order, portfolio) {
    const totalCost = order.quantity * order.price;

    if (portfolio.cash_balance < totalCost) {
      throw new Error('Insufficient cash balance');
    }

    // Update portfolio cash
    await pool.query(
      'UPDATE portfolios SET cash_balance = cash_balance - $1 WHERE portfolio_id = $2',
      [totalCost, order.portfolio_id]
    );

    // Update or insert holding
    await pool.query(
      `INSERT INTO holdings (portfolio_id, symbol, quantity, avg_cost, current_price, current_value)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (portfolio_id, symbol) DO UPDATE SET
       quantity = holdings.quantity + $3,
       current_value = (holdings.quantity + $3) * $5`,
      [order.portfolio_id, order.symbol, order.quantity, order.price, order.price, totalCost]
    );

    // Update order status
    await pool.query(
      'UPDATE orders SET status = $1, execution_time = NOW() WHERE order_id = $2',
      ['executed', order.order_id]
    );

    return { success: true, message: 'Buy order executed' };
  }

  static async executeSell(order, portfolio) {
    const holdingResult = await pool.query(
      'SELECT * FROM holdings WHERE portfolio_id = $1 AND symbol = $2',
      [order.portfolio_id, order.symbol]
    );

    if (holdingResult.rows.length === 0 || holdingResult.rows[0].quantity < order.quantity) {
      throw new Error('Insufficient holdings');
    }

    const totalProceeds = order.quantity * order.price;

    // Update portfolio cash
    await pool.query(
      'UPDATE portfolios SET cash_balance = cash_balance + $1 WHERE portfolio_id = $2',
      [totalProceeds, order.portfolio_id]
    );

    // Update holding
    const newQuantity = holdingResult.rows[0].quantity - order.quantity;
    if (newQuantity === 0) {
      await pool.query(
        'DELETE FROM holdings WHERE portfolio_id = $1 AND symbol = $2',
        [order.portfolio_id, order.symbol]
      );
    } else {
      await pool.query(
        'UPDATE holdings SET quantity = $1, current_value = $1 * current_price WHERE portfolio_id = $2 AND symbol = $3',
        [newQuantity, order.portfolio_id, order.symbol]
      );
    }

    // Update order status
    await pool.query(
      'UPDATE orders SET status = $1, execution_time = NOW() WHERE order_id = $2',
      ['executed', order.order_id]
    );

    return { success: true, message: 'Sell order executed' };
  }
}

module.exports = OrderExecutor;
