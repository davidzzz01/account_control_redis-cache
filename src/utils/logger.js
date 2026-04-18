import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Mostra no console (com cores, ótimo para desenvolvimento)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true })
      )
    }),
    // Salva apenas os erros em logs/error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Salva TUDO em logs/combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

export default logger;
