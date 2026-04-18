const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(bodyParser.json());

app.use(userRoutes);
app.use(errorHandler);

app.listen('3001', () => {
  console.log('Online');
});
