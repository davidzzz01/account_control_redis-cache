const Redis = require('ioredis');

const redis = new Redis();

try {
  redis.on('connect', () => {
    console.log('[Redis]: Redis connected');
  });
} catch (error) {
  console.error('[Redis]: Redis error:', error);
}

module.exports = redis;
