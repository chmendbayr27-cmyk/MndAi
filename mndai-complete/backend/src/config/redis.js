const redis = require('redis');

let client = null;

if (process.env.REDIS_URL) {
  client = redis.createClient({
    url: process.env.REDIS_URL
  });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  client.on('connect', () => {
    console.log('✓ Redis connected');
  });

  (async () => {
    try {
      await client.connect();
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
    }
  })();
} else {
  console.log('Redis disabled - no REDIS_URL provided');
}

module.exports = client;
