import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(ENV.PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Kinetiq AI API Server Running on port ${ENV.PORT}`);
      console.log(`📡 Health Check: http://localhost:${ENV.PORT}/health`);
      console.log(`⚡ API Prefix:   http://localhost:${ENV.PORT}/api/v1`);
      console.log(`===============================================`);
    });

    const gracefulShutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
