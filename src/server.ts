import createApp from './app';
import config from './config';
import connectDB from './config/database';

/**
 * Server Entry Point
 * Initializes database connection and starts the Express server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create Express application
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      console.log('='.repeat(50));
      console.log('🚀 AU Chapel Workers API Server');
      console.log('='.repeat(50));
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Server URL: http://localhost:${config.port}`);
      console.log(`📖 Health Check: http://localhost:${config.port}/api/health`);
      console.log('='.repeat(50));
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
