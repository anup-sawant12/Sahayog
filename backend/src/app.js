const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./core/middleware/error.middleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

module.exports = app;
