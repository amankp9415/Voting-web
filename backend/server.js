const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

// ✅ SAFE PORT HANDLING
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});