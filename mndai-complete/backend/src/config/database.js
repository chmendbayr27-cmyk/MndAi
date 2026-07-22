const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/mndai',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const query = (text, params) => {
  return pool.query(text, params);
};

const close = () => {
  return pool.end();
};

module.exports = {
  query,
  close
};
