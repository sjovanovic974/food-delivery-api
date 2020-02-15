const express = require('express');
const path = require('path');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Routers
const mealRouter = require('./routes/mealRoutes');
const userRouter = require('./routes/userRoutes');

// Start Express App
const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// ROUTES
app.use('/api/v1/meals', mealRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
