import AppError from './AppError.js';

class UserError extends AppError {
  constructor(message, status) {
    super(message, status);
  }

  static notFound() {
    return new UserError('Usuário não encontrado', 404);
  }

  static invalidCredentials() {
    return new UserError('Email ou senha incorretos', 401);
  }
}

export default UserError;
