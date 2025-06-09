import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Since we are using ES modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define serverInstance so it's accessible in handlers
let serverInstance;

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
const corsOptions = {
  // In production, specify allowed origins. Example:
  // origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : ['https://yourdomain.com', 'https://another.domain.com'],
  origin: true, // Allows all origins for now, similar to app.use(cors()). For development only.
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you need to handle cookies or authorization headers
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
  
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
        // If sendFile fails (e.g., file not found, or other I/O error),
        // pass error to Express error handler.
        // Set a specific status if it's a file not found type error
        if (err.code === 'ENOENT') {
            err.status = 404;
            err.message = `Entry point ${indexPath} not found. Ensure the client application is built.`;
        }
        next(err);
    }
  });
});

// Global Express error handler
app.use((err, req, res, next) => {
  console.error('EXPRESS ERROR HANDLER:', err.stack);
  const status = err.status || err.statusCode || 500;
  let message = 'Something broke on the server!';
  
  // Provide more detailed error messages in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    message = err.message || (typeof err === 'string' ? err : 'Internal Server Error');
  }
  
  // Ensure response is sent only if headers haven't been sent yet
  if (!res.headersSent) {
    res.status(status).json({ error: message });
  } else {
    // If headers already sent, delegate to the default Express error handler
    // This typically means the error occurred while streaming the response
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
  console.log(`${signal} signal received: closing HTTP server`);
  
  if (serverInstance && serverInstance.listening) {
    console.log('Closing HTTP server...');
    serverInstance.close(() => {
      console.log('HTTP server closed.');
      // Add any other cleanup here (e.g., closing database connection pools if managed globally)
      process.exit(0);
    });
  } else {
    console.log('HTTP server was not running or already closed.');
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught Exception Handler
process.on('uncaughtException', (error, origin) => {
  console.error(`UNCAUGHT EXCEPTION! Origin: ${origin}`, error);
  
  // Attempt to gracefully close the server first, then exit.
  // This is a last resort; ideally, all errors should be caught.
  if (serverInstance && serverInstance.listening) {
    console.log('Closing HTTP server due to uncaught exception...');
    serverInstance.close(() => {
      console.log('HTTP server closed due to uncaught exception.');
      process.exit(1); // Exit with error code
    });
  } else {
    console.log('HTTP server was not running or already closed during uncaught exception.');
    process.exit(1); // Exit with error code
  }
  // Set a timeout to force exit if graceful shutdown hangs
  setTimeout(() => {
    console.error('Graceful shutdown timed out during uncaught exception. Forcing exit.');
    process.exit(1);
  }, 5000).unref(); // 5 seconds timeout
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
