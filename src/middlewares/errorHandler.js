import { ZodError } from 'zod';
import AppError from '../errors/AppError.js';

import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.issues[0].message });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }

  logger.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor' });
};

export default errorHandler;
