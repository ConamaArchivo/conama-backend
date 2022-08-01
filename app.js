require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const homeRouter = require('./routes/home');
const newRouter = require('./routes/new');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/obras', homeRouter);
app.use('/nueva-entrada', newRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
