import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // O evento 'finish' é disparado quando a resposta termina de ser enviada
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`;
    
    // Se o status code for um erro (4xx ou 5xx), loga como erro
    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      // Caso contrário, loga como informação (sucesso)
      logger.info(message);
    }
  });

  next();
};

export default requestLogger;
