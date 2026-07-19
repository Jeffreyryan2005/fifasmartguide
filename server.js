'use strict';

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

/**
 * Start Server (only if not in test environment)
 * In Vercel (or when exported for testing), it will be handled automatically.
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

