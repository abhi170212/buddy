import { config } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { createApp } from './app';

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Initialize Express application
    const app = createApp();

    // 3. Start listening
    const server = app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(` StudyTracker Express API Server Running`);
      console.log(` URL: http://localhost:${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Allowed Client: ${config.clientUrl}`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal: string) => {
      console.log(`\n[Process] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[Process] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('[Process] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
