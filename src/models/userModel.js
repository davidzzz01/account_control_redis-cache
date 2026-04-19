import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '..', 'users.json');

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

const getById = async (id) => {
  const users = await getAll();
  return users.find((user) => user.id === Number(id));
};

const create = async (user) => {
  const users = await getAll();
  
  const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;
  const newUser = { id: maxId + 1, ...user };
  
  users.push(newUser);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  return newUser;
};

const update = async (id, updatedFields) => {
  const users = await getAll();
  const userIndex = users.findIndex((user) => user.id === Number(id));
  
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updatedFields, id: Number(id) };
  
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  return users[userIndex];
};

const remove = async (id) => {
  const users = await getAll();
  const userIndex = users.findIndex((user) => user.id === Number(id));
  
  if (userIndex === -1) return null;
  
  users.splice(userIndex, 1);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  return true;
};

export default {
  getAll,
  getById,
  create,
  update,
  remove
};
