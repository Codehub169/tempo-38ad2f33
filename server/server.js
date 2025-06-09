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

// Define serverInstance and initialDbConnection variables so they are accessible in handlers
let serverInstance;
let initialDbConnection;

const app = express();
const PORT = process.env.PORT || 9000;

// Database setup (initial check for connectivity)
// Controllers will use openDb() from './db/setup.js' for their operations.
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
initialDbConnection = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database for initial check:', err.message);
    initialDbConnection = null; // Mark as failed or unable to open
  } else {
    console.log('Connected to the SQLite database for initial check.');
  }
});

// Middleware
const corsOptions = {
  // In production, specify allowed origins. Example:
  // origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*', 
  origin: true, // Allows all origins for now, same as app.use(cors())
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); 
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
app.get('*', (req, res, next) => {
  // Avoid sending index.html for API-like paths that weren't caught by API routers
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
        // If sendFile fails (e.g., file not found), pass error to Express error handler
        next(err);
    }
  });
});

// Global Express error handler
app.use((err, req, res, next) => {
  console.error('EXPRESS ERROR HANDLER:', err.stack);
  const status = err.status || err.statusCode || 500;
  let message = 'Something broke on the server!';
  
  if (process.env.NODE_ENV !== 'production') {
    message = err.message || (typeof err === 'string' ? err : 'Internal Server Error');
  }
  
  if (!res.headersSent) {
    res.status(status).json({ error: message });
  } else {
    // If headers already sent, delegate to the default Express error handler
    next(err); 
  }
});

// Start server
serverInstance = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving frontend from: ${clientDistPath}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown logic
const gracefulShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server and DB`);
  
  const closeInitialDb = (callback) => {
    if (initialDbConnection && typeof initialDbConnection.close === 'function') {
      console.log('Closing initial check database connection...');
      initialDbConnection.close((err) => {
        if (err) {
          console.error('Error closing the initial check database connection:', err.message);
        } else {
          console.log('Initial check database connection closed.');
        }
        if (callback) callback();
      });
    } else {
      console.log('Initial check database connection was not open or available to close.');
      if (callback) callback();
    }
  };

  if (serverInstance && serverInstance.listening) {
    console.log('Closing HTTP server...');
    serverInstance.close(() => {
      console.log('HTTP server closed.');
      closeInitialDb(() => process.exit(0));
    });
  } else {
    console.log('HTTP server was not running or already closed.');
    closeInitialDb(() => process.exit(0));
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught Exception Handler
process.on('uncaughtException', (error, origin) => {
  console.error(`UNCAUGHT EXCEPTION! Origin: ${origin}`, error);
  
  const closeInitialDbAndExit = () => {
    if (initialDbConnection && typeof initialDbConnection.close === 'function') {
      initialDbConnection.close((dbErr) => {
        if (dbErr) console.error('Error closing initial check DB on uncaught exception:', dbErr.message);
        else console.log('Initial check DB closed on uncaught exception.');
        process.exit(1); // Exit with error code
      });
    } else {
      console.log('Initial check DB was not open or available to close during uncaught exception.');
      process.exit(1);
    }
  };

  // Attempt to gracefully close the server first, then the DB, then exit.
  if (serverInstance && serverInstance.listening) {
    serverInstance.close(() => {
      console.log('HTTP server closed due to uncaught exception.');
      closeInitialDbAndExit();
    });
  } else {
    console.log('HTTP server was not running or already closed during uncaught exception.');
    closeInitialDbAndExit();
  }
});

// Unhandled Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED PROMISE REJECTION! Details below. Shutting down...');
  console.error('Reason:', reason);
  // console.error('Promise:', promise); // Promise object can be verbose
  
  // It's recommended to treat unhandled rejections as critical errors.
  // Throwing here will allow 'uncaughtException' handler to manage shutdown.
  if (reason instanceof Error) {
    throw reason;
  } else {
    // Wrap non-Error reasons in an Error object for better stack traces
    throw new Error(`Unhandled promise rejection with non-Error reason: ${JSON.stringify(reason)}`);
  }
});
