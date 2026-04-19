import userModel from '../models/userModel.js';
import redis from '../redis/client.js';
import UserError from '../errors/UserError.js';
import { loginSchema, userSchema } from '../validations/userSchemas.js';

const cacheKey = 'users';

const CACHE_EXPIRATION = 3600;

const clearCache = async () => {
  try {
    const keys = await redis.keys(`${cacheKey}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis clear cache error:', error);
  }
};

const getAll = async () => {
  const disableCache = process.env.DISABLE_CACHE === 'true';
  
  if (!disableCache) {
    try {
      const cachedUsers = await redis.get(cacheKey);
      if (cachedUsers) return JSON.parse(cachedUsers);
    } catch (err) {
      console.error('Redis get error:', err);
    }
  }

  const users = await userModel.getAll();

  if (!disableCache) {
    try {
      await redis.set(cacheKey, JSON.stringify(users), 'EX', CACHE_EXPIRATION);
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  return users;
};

const getById = async (id) => {
  const specificCacheKey = `${cacheKey}:${id}`;
  const disableCache = process.env.DISABLE_CACHE === 'true';

  if (!disableCache) {
    try {
      const cachedUser = await redis.get(specificCacheKey);
      if (cachedUser) return JSON.parse(cachedUser);
    } catch (err) {
      console.error('Redis get error:', err);
    }
  }

  const user = await userModel.getById(id);
  if (!user) {
    throw UserError.notFound();
  }

  if (!disableCache) {
    try {
      await redis.set(specificCacheKey, JSON.stringify(user), 'EX', CACHE_EXPIRATION);
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  return user;
};

const search = async (searchTerm) => {
  const users = await getAll();
  if (!searchTerm) return users;

  return users.filter(user => user.name.includes(searchTerm));
};

const login = async (email, password) => {
  loginSchema.parse({ email, password });

  const users = await userModel.getAll();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw UserError.invalidCredentials();
  }

  return { message: 'Login realizado com sucesso' };
};

const create = async (user) => {
  userSchema.parse(user);

  const newUser = await userModel.create(user);
  await clearCache();

  return newUser;
};

const update = async (id, updatedFields) => {
  userSchema.parse(updatedFields);

  const user = await userModel.update(id, updatedFields);
  if (!user) {
    throw UserError.notFound();
  }

  await clearCache();
  return user;
};

const remove = async (id) => {
  const user = await userModel.getById(id);
  if (!user) {
    throw UserError.notFound();
  }
  await userModel.remove(id);
  await clearCache();
};

export default {
  getAll,
  getById,
  search,
  login,
  create,
  update,
  remove
};
