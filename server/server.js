import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { getAppDb, closeAppDb } from './db/setup.js'; // Import DB management functions

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverInstance;
const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173', `http://localhost:${PORT}`];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions)); 
app.use(express.json({ limit: '1mb' })); // Limit payload size for security
app.disable('x-powered-by');

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // err.status = 404; // This is fine, but Express default for ENOENT from sendFile is usually 404
        // More descriptive message for client build issue
        console.error(`Entry point ${indexPath} not found. Ensure the client application is built and clientDistPath is correct.`);
        res.status(404).send(`Frontend entry point not found. Client application might not be built. Please check server logs.`);
      } else {
        next(err); // Pass other errors to the global error handler
      }
    }
  });
});

// Global Express error handler
app.use((err, req, res, next) => {
  console.error('EXPRESS ERROR HANDLER:', err.stack || err);
  const status = err.status || err.statusCode || 500;
  let message = 'An unexpected error occurred on the server.';
  if (process.env.NODE_ENV !== 'production') {
    message = err.message || (typeof err === 'string' ? err : 'Internal Server Error (Development Mode)');
  }
  if (!res.headersSent) {
    res.status(status).json({ error: message });
  } else {
    next(err); 
  }
});

// Graceful shutdown logic
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server and database connection.`);
  let exitCode = 0;
  try {
    if (serverInstance && serverInstance.listening) {
      console.log('Closing HTTP server...');
      await new Promise((resolve, reject) => {
        serverInstance.close((err) => {
          if (err) {
            console.error('Error closing HTTP server:', err);
            exitCode = 1;
            return reject(err);
          }
          console.log('HTTP server closed.');
          resolve();
        });
      });
    }
    await closeAppDb();
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    exitCode = 1;
  } finally {
    console.log('Exiting process.');
    process.exit(exitCode);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught Exception Handler
process.on('uncaughtException', (error, origin) => {
  console.error(`UNCAUGHT EXCEPTION! Origin: ${origin}`, error);
  // Perform minimal cleanup and exit immediately. Avoid complex async operations.
  if (serverInstance && serverInstance.listening) {
    serverInstance.close(() => {
      closeAppDb().finally(() => process.exit(1));
    });
  } else {
    closeAppDb().finally(() => process.exit(1));
  }
  // Set a timeout to force exit if graceful shutdown hangs
  setTimeout(() => {
    console.error('Graceful shutdown timed out during uncaught exception. Forcing exit.');
    process.exit(1);
  }, 5000).unref();
});

// Unhandled Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED PROMISE REJECTION! Reason:', reason);
  // Treat unhandled rejections as uncaught exceptions
  // Throwing here will allow 'uncaughtException' handler to manage shutdown.
  if (reason instanceof Error) {
    throw reason;
  } else {
    throw new Error(`Unhandled promise rejection with non-Error reason: ${JSON.stringify(reason)}`);
  }
});

// Start server function
async function startServer() {
  try {
    await getAppDb(); // Pre-warm/initialize the database connection
    console.log('Database connection successfully pre-warmed for application.');

    serverInstance = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Serving frontend from: ${clientDistPath}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });

    serverInstance.on('error', (error) => { 
        console.error('HTTP Server error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Attempting to close DB and exit.`);
            closeAppDb().finally(() => process.exit(1));
        } else {
            gracefulShutdown('SERVER_ERROR');
        }
    });

  } catch (dbError) {
    console.error('FATAL: Failed to initialize database on startup. Exiting.', dbError);
    await closeAppDb().finally(() => process.exit(1));
  }
}

startServer();
