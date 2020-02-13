const express = require('express');
const path = require('path');
const morgan = require('morgan');

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

module.exports = app;
