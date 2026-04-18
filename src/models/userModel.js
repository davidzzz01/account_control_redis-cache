const fs = require('fs').promises;
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'users.json');

/**
 * Busca todos os usuários salvos no arquivo JSON.
 * @returns {Promise<Array<Object>>} Retorna um array de usuários.
 */
const getAll = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

/**
 * Busca um usuário pelo seu ID numérico.
 * @param {number|string} id O ID do usuário a ser buscado.
 * @returns {Promise<Object|undefined>} Retorna o objeto do usuário ou undefined caso não encontrado.
 */
const getById = async (id) => {
  const users = await getAll();
  return users.find((user) => user.id === Number(id));
};

/**
 * Cria um novo usuário no banco de dados (arquivo JSON).
 * O ID é gerado automaticamente baseado no maior ID existente.
 * @param {Object} user Os dados do usuário (name, email, password, age, info).
 * @returns {Promise<Object>} Retorna o usuário recém-criado com seu ID.
 */
const create = async (user) => {
  const users = await getAll();
  
  const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;
  const newUser = { id: maxId + 1, ...user };
  
  users.push(newUser);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  return newUser;
};

/**
 * Atualiza os dados de um usuário existente.
 * @param {number|string} id O ID do usuário a ser editado.
 * @param {Object} updatedFields Os novos campos a serem mesclados.
 * @returns {Promise<Object|null>} Retorna o usuário atualizado ou null se não for encontrado.
 */
const update = async (id, updatedFields) => {
  const users = await getAll();
  const userIndex = users.findIndex((user) => user.id === Number(id));
  
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updatedFields, id: Number(id) };
  
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  return users[userIndex];
};

/**
 * Remove um usuário da base de dados pelo seu ID.
 * @param {number|string} id O ID do usuário a ser removido.
 * @returns {Promise<boolean|null>} Retorna true caso removido com sucesso, ou null se não for encontrado.
 */
const remove = async (id) => {
  const users = await getAll();
  const userIndex = users.findIndex((user) => user.id === Number(id));
  
  if (userIndex === -1) return null;
  
  users.splice(userIndex, 1);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
