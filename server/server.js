import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

// Import routes
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Since we are using ES modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;

// Database setup
// Establishes a connection to the database to confirm accessibility on server start.
// Note: Controllers use openDb() from './db/setup.js' for their specific operations.
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    // Consider exiting the process if the database connection is critical for server startup
    // process.exit(1);
  } else {
    console.log('Connected to the SQLite database for initial check.');
    // Initial database schema setup and seeding is handled by
    // 'node db/setup.js' in the startup.sh script.
  }
});

// Middleware
app.use(cors()); // Enable CORS for all routes. For production, restrict origins.
app.use(express.json()); // Parse JSON request bodies
app.disable('x-powered-by'); // Security best practice: hide Express usage

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files from the React app build directory
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Avoid sending stack trace to client in production
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Something broke!' : err.message || 'Something broke!';
  res.status(status).send(message);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving frontend from: ${clientDistPath}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    }
    console.log('Database connection closed.');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    }
    console.log('Database connection closed.');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});
