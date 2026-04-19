import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || '',
});

try {
  redis.on('connect', () => {
    console.log('[Redis]: Redis connected');
  });
} catch (error) {
  console.error('[Redis]: Redis error:', error);
}

export default redis;
