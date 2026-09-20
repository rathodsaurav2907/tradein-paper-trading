const { Pool } = require('pg');
const { createClient } = require('redis');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

module.exports = { pool, redisClient };
