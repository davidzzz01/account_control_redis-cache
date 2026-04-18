import userService from '../services/userService.js';

/**
 * Controlador responsável por retornar a lista de usuários cadastrados.
 * @param {import('express').Request} req Requisição Express
 * @param {import('express').Response} res Resposta Express
 * @param {import('express').NextFunction} next Próximo middleware
 */
const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador responsável por buscar um usuário pelo ID.
 * @param {import('express').Request} req Requisição Express com params.id
 * @param {import('express').Response} res Resposta Express
 * @param {import('express').NextFunction} next Próximo middleware
 */
const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador de busca avançada via querystring ?q=nome.
 * @param {import('express').Request} req Requisição Express com query.q
 * @param {import('express').Response} res Resposta Express
 * @param {import('express').NextFunction} next Próximo middleware
 */
const search = async (req, res, next) => {
  try {
    const users = await userService.search(req.query.q);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint encarregado de processar o login dos usuários.
 * @param {import('express').Request} req Requisição Express (body: email, password)
 * @param {import('express').Response} res Resposta Express
 * @param {import('express').NextFunction} next Próximo middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await userService.login(email, password);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Criação de uma nova conta de usuário.
 * @param {import('express').Request} req Requisição Express contendo o body completo do usuário
 * @param {import('express').Response} res Resposta Express (201)
 * @param {import('express').NextFunction} next Próximo middleware
 */
const create = async (req, res, next) => {
  try {
    const newUser = await userService.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Modificação dos dados da conta baseada no ID.
 * @param {import('express').Request} req Requisição Express com params.id e body
 * @param {import('express').Response} res Resposta Express
 * @param {import('express').NextFunction} next Próximo middleware
 */
const update = async (req, res, next) => {
  try {
    const updatedUser = await userService.update(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Exclusão lógica/física da conta de um usuário.
 * @param {import('express').Request} req Requisição Express com params.id
 * @param {import('express').Response} res Resposta Express (204)
 * @param {import('express').NextFunction} next Próximo middleware
 */
const remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
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
