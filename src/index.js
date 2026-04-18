import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import logger from './utils/logger.js';

const app = express();
app.use(bodyParser.json());
app.use(requestLogger);

app.use(userRoutes);
app.use(errorHandler);

app.listen('3001', () => {
  logger.info('Servidor Online na porta 3001');
});
