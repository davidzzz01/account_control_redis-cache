import Redis from 'ioredis';

const redis = new Redis();

try {
  redis.on('connect', () => {
    console.log('[Redis]: Redis connected');
  });
} catch (error) {
  console.error('[Redis]: Redis error:', error);
}

export default redis;
