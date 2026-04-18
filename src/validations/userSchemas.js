const { z } = require('zod');

z.setErrorMap((issue, ctx) => {
  if (issue.code === 'invalid_type') {
    const field = issue.path[issue.path.length - 1];
    if (field) {
      return { message: `O campo "${field}" é obrigatório` };
    }
  }
  return { message: ctx?.defaultError || issue.message || 'Erro de validação' };
});

const loginSchema = z.object({
  email: z.string()
    .min(1, 'O campo "email" é obrigatório')
    .email('O "email" deve ter o formato "email@email.com"'),

  password: z.string()
    .min(1, 'O campo "password" é obrigatório')
    .min(8, 'O "password" deve ter pelo menos 8 caracteres')
});

const userSchema = z.object({
  name: z.string()
    .min(1, 'O campo "name" é obrigatório')
    .min(3, 'O "name" deve ter pelo menos 3 caracteres'),

  age: z.number()
    .int('O campo "age" é obrigatório')
    .min(18, 'O usuário deve ser maior de idade'),

  info: z.object({
    phoneNumber: z.string()
      .min(1, 'O campo "phoneNumber" é obrigatório'),

    city: z.string()
      .min(1, 'O campo "city" é obrigatório')
  })
});

module.exports = {
  loginSchema,
  userSchema
};
