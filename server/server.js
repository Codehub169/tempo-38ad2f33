import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

// Import routes (to be created in a later step)
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dbSetup from './db/setup.js'; // Import the setup function

// Since we are using ES modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000; // Port 9000 for user-facing app

// Database setup
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Consider running dbSetup here if it's idempotent and needed on every start
    // For now, startup.sh handles initial setup.
  }
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

// Global error handler (optional basic example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving frontend from: ${path.join(__dirname, '..', 'client', 'dist')}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
