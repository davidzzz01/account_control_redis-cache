const userModel = require('../models/userModel');
const redis = require('../redis/client');
const UserError = require('../errors/UserError');
const { loginSchema, userSchema } = require('../validations/userSchemas');

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

/**
 * Recupera todos os usuários.
 * Implementa cache via Redis.
 * @returns {Promise<Array<Object>>} Retorna a lista de usuários cadastrados.
 */
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

/**
 * Busca um único usuário pelo ID.
 * Implementa cache via Redis.
 * @param {number|string} id O ID a ser pesquisado.
 * @throws {UserError} Caso o usuário não seja encontrado.
 * @returns {Promise<Object>} Objeto do usuário.
 */
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

/**
 * Filtra a lista de usuários pelo nome baseado num termo de busca.
 * @param {string} searchTerm O nome ou pedaço do nome para buscar.
 * @returns {Promise<Array<Object>>} Lista filtrada de usuários.
 */
const search = async (searchTerm) => {
  const users = await getAll();
  if (!searchTerm) return users;

  return users.filter(user => user.name.includes(searchTerm));
};

/**
 * Realiza o login de um usuário validando email e senha.
 * @param {string} email O e-mail do usuário.
 * @param {string} password A senha do usuário.
 * @throws {ZodError} Em caso de dados inválidos de acordo com o Schema.
 * @throws {UserError} Se o e-mail ou senha não baterem.
 * @returns {Promise<Object>} Mensagem de sucesso no login.
 */
const login = async (email, password) => {
  loginSchema.parse({ email, password });

  const users = await userModel.getAll();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw UserError.invalidCredentials();
  }

  return { message: 'Login realizado com sucesso' };
};

/**
 * Cria um novo usuário validando o formato de entrada.
 * @param {Object} user Dados brutos do usuário enviados via requisição.
 * @throws {ZodError} Em caso de payload inválido de acordo com o Schema.
 * @returns {Promise<Object>} Objeto completo do usuário inserido.
 */
const create = async (user) => {
  userSchema.parse(user);

  const newUser = await userModel.create(user);
  await clearCache();

  return newUser;
};

/**
 * Atualiza um usuário garantindo a validação de formato e a limpeza de cache.
 * @param {number|string} id ID numérico do usuário.
 * @param {Object} updatedFields Os novos dados do usuário para o merge.
 * @throws {ZodError|UserError} Lança erros de validação ou se não encontrado.
 * @returns {Promise<Object>} O usuário atualizado com as modificações aplicadas.
 */
const update = async (id, updatedFields) => {
  userSchema.parse(updatedFields);

  const user = await userModel.update(id, updatedFields);
  if (!user) {
    throw UserError.notFound();
  }

  await clearCache();
  return user;
};

/**
 * Exclui a conta de um usuário baseado no ID, e invalida o cache atual.
 * @param {number|string} id O ID numérico do usuário.
 * @throws {UserError} Se o usuário a ser deletado não for encontrado.
 * @returns {Promise<void>}
 */
const remove = async (id) => {
  const user = await userModel.getById(id);
  if (!user) {
    throw UserError.notFound();
  }
  await userModel.remove(id);
  await clearCache();
};

module.exports = {
  getAll,
  getById,
  search,
  login,
  create,
  update,
  remove
};
