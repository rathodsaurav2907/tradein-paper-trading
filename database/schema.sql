-- PostgreSQL Schema for TradeIn Paper Trading Platform

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    initial_balance NUMERIC(12, 2) DEFAULT 100000.00,
    status VARCHAR(20) DEFAULT 'active',
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    portfolio_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    portfolio_name VARCHAR(255),
    cash_balance NUMERIC(12, 2),
    total_value NUMERIC(12, 2),
    invested_amount NUMERIC(12, 2) DEFAULT 0.00,
    daily_gain_loss NUMERIC(12, 2) DEFAULT 0.00,
    daily_gain_loss_pct NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    portfolio_id VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    order_type VARCHAR(20),
    action VARCHAR(10),
    quantity INT NOT NULL,
    price NUMERIC(10, 2),
    total_amount NUMERIC(12, 2),
    status VARCHAR(20) DEFAULT 'pending',
    execution_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id)
);

CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity INT,
    avg_cost NUMERIC(10, 2),
    current_price NUMERIC(10, 2),
    current_value NUMERIC(12, 2),
    gain_loss NUMERIC(12, 2),
    gain_loss_pct NUMERIC(5, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id),
    UNIQUE(portfolio_id, symbol)
);

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    watchlist_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE(user_id, symbol)
);

CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    price NUMERIC(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_orders_portfolio_id ON orders(portfolio_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_price_history_symbol ON price_history(symbol);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);
