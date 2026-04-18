import { jest } from '@jest/globals';
import { ZodError } from 'zod';
import UserError from '../../errors/UserError.js';

jest.unstable_mockModule('../../models/userModel.js', () => ({
  default: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  }
}));

jest.unstable_mockModule('../../redis/client.js', () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    keys: jest.fn(),
    del: jest.fn()
  }
}));

const userModel = (await import('../../models/userModel.js')).default;
const redis = (await import('../../redis/client.js')).default;
const userService = (await import('../userService.js')).default;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('deve retornar a lista em cache se existir', async () => {
      redis.get.mockResolvedValueOnce(JSON.stringify([{ id: 1, name: 'Cached User' }]));
      const result = await userService.getAll();
      expect(result).toEqual([{ id: 1, name: 'Cached User' }]);
      expect(redis.get).toHaveBeenCalledWith('users');
      expect(userModel.getAll).not.toHaveBeenCalled();
    });

    it('deve buscar do model e setar no cache se nao existir', async () => {
      redis.get.mockResolvedValueOnce(null);
      userModel.getAll.mockResolvedValueOnce([{ id: 2, name: 'Model User' }]);
      
      const result = await userService.getAll();
      
      expect(result).toEqual([{ id: 2, name: 'Model User' }]);
      expect(userModel.getAll).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith('users', JSON.stringify([{ id: 2, name: 'Model User' }]), 'EX', 3600);
    });
  });

  describe('create', () => {
    it('deve criar e limpar o cache', async () => {
      const newUser = {
        name: 'Ana',
        age: 20,
        info: { phoneNumber: '123', city: 'Sp' }
      };
      
      userModel.create.mockResolvedValueOnce({ id: 1, ...newUser });
      redis.keys.mockResolvedValueOnce(['users']);
      
      const result = await userService.create(newUser);
      
      expect(result).toHaveProperty('id', 1);
      expect(userModel.create).toHaveBeenCalledWith(newUser);
      expect(redis.del).toHaveBeenCalledWith('users');
    });

    it('deve falhar se a idade for menor que 18', async () => {
      const newUser = {
        name: 'Ana',
        age: 17,
        info: { phoneNumber: '123', city: 'Sp' }
      };

      try {
        await userService.create(newUser);
      } catch (err) {
        expect(err).toBeInstanceOf(ZodError);
        expect(err.issues[0].message).toBe('O usuário deve ser maior de idade');
      }
    });
  });

  describe('login', () => {
    it('deve realizar login com sucesso', async () => {
      userModel.getAll.mockResolvedValueOnce([
        { email: 'test@email.com', password: 'password123' }
      ]);
      const result = await userService.login('test@email.com', 'password123');
      expect(result).toEqual({ message: 'Login realizado com sucesso' });
    });

    it('deve falhar com email invalido', async () => {
      try {
        await userService.login('invalid', 'password123');
      } catch (err) {
        expect(err).toBeInstanceOf(ZodError);
        expect(err.issues[0].message).toBe('O "email" deve ter o formato "email@email.com"');
      }
    });

    it('deve falhar com email ou senha incorretos', async () => {
      userModel.getAll.mockResolvedValue([]);
      await expect(userService.login('test@email.com', 'password123')).rejects.toThrow(UserError);
      await expect(userService.login('test@email.com', 'password123')).rejects.toThrow('Email ou senha incorretos');
    });
  });
});
