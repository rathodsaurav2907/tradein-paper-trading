const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await pool.query('TRUNCATE watchlist CASCADE');
    await pool.query('TRUNCATE orders CASCADE');
    await pool.query('TRUNCATE holdings CASCADE');
    await pool.query('TRUNCATE portfolios CASCADE');
    await pool.query('TRUNCATE users CASCADE');

    // Create users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const result = await pool.query(
        `INSERT INTO users (user_id, username, email, full_name, initial_balance)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          `USER-${i + 1}`,
          `user${i + 1}`,
          `user${i + 1}@tradein.com`,
          `User ${i + 1}`,
          100000 + (i * 10000)
        ]
      );
      users.push(result.rows[0]);
      console.log(`Created user ${i + 1}/10`);
    }

    // Create portfolios
    const portfolios = [];
    for (let i = 0; i < 10; i++) {
      const result = await pool.query(
        `INSERT INTO portfolios (portfolio_id, user_id, portfolio_name, cash_balance, total_value)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          `PORT-${i + 1}`,
          users[i].user_id,
          `Portfolio ${i + 1}`,
          100000 + (i * 10000),
          100000 + (i * 10000)
        ]
      );
      portfolios.push(result.rows[0]);
      console.log(`Created portfolio ${i + 1}/10`);
    }

    // Create holdings
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
    for (let i = 0; i < portfolios.length; i++) {
      const numHoldings = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numHoldings; j++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const quantity = Math.floor(Math.random() * 100) + 10;
        const avgCost = Math.random() * 200 + 50;
        const currentPrice = Math.random() * 250 + 50;
        const currentValue = quantity * currentPrice;

        await pool.query(
          `INSERT INTO holdings (portfolio_id, symbol, quantity, avg_cost, current_price, current_value, gain_loss, gain_loss_pct)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (portfolio_id, symbol) DO NOTHING`,
          [
            portfolios[i].portfolio_id,
            symbol,
            quantity,
            avgCost,
            currentPrice,
            currentValue,
            quantity * (currentPrice - avgCost),
            ((currentPrice - avgCost) / avgCost * 100).toFixed(2)
          ]
        );
      }
    }
    console.log('Created holdings for all portfolios');

    // Create orders
    for (let i = 0; i < 50; i++) {
      const portfolio = portfolios[Math.floor(Math.random() * portfolios.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const quantity = Math.floor(Math.random() * 100) + 10;
      const price = Math.random() * 200 + 50;
      const status = ['pending', 'executed', 'cancelled'][Math.floor(Math.random() * 3)];

      await pool.query(
        `INSERT INTO orders (order_id, portfolio_id, symbol, order_type, action, quantity, price, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `ORD-${i + 1}`,
          portfolio.portfolio_id,
          symbol,
          Math.random() > 0.5 ? 'market' : 'limit',
          Math.random() > 0.5 ? 'buy' : 'sell',
          quantity,
          price,
          quantity * price,
          status
        ]
      );
    }
    console.log('Created 50 orders');

    // Create watchlists
    for (let i = 0; i < users.length; i++) {
      const numSymbols = Math.floor(Math.random() * 5) + 2;
      const selectedSymbols = [...symbols].sort(() => Math.random() - 0.5).slice(0, numSymbols);
      
      for (const symbol of selectedSymbols) {
        await pool.query(
          `INSERT INTO watchlist (watchlist_id, user_id, symbol)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, symbol) DO NOTHING`,
          [`WL-${uuidv4().substring(0, 8)}`, users[i].user_id, symbol]
        );
      }
    }
    console.log('Created watchlists');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
