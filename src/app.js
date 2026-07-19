'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

/**
 * Configure Security Middlewares
 */
// Helmet for strict Content Security Policy and HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.github.com"]
    }
  }
}));

app.use(cors());
app.use(express.json({ limit: '1mb' }));

/**
 * Simple data sanitization middleware to prevent NoSQL/XSS injections
 */
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>]/g, ''); // Simple strip of < and >
      }
    }
  }
  next();
});

/**
 * Rate Limiting to prevent abuse (Efficiency and Security)
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

/**
 * Serve Static Files (Frontend)
 */
app.use(express.static(path.join(__dirname, '../public')));

/**
 * API Routes
 */
app.use('/api', apiRoutes);

/**
 * Fallback Route for SPA or missing assets
 */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

module.exports = app;
