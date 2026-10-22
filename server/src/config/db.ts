import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    // Sanitize URI for console output
    const sanitizedUri = config.mongoUri.replace(/:([^@]+)@/, ':****@');
    console.log(`[Database] Connecting to MongoDB at ${sanitizedUri}...`);
    
    // Use generous timeout for Atlas SRV / TLS, or quick probe for localhost
    const isCloudAtlas = config.mongoUri.startsWith('mongodb+srv://');
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: isCloudAtlas ? 10000 : 2500,
    });
    
    console.log('[Database] Connected to external MongoDB successfully.');
  } catch (err: unknown) {
    const error = err as Error;
    console.warn(`[Database] Could not connect to external MongoDB: ${error.message}`);

    // If in non-production, launch embedded MongoDB Memory Server
    if (!config.isProd) {
      console.log('[Database] Starting embedded MongoDB Memory Server for local development/testing...');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to embedded MongoDB Memory Server at ${memUri}`);
    } else {
      console.error('[Database] Fatal: Unable to connect to MongoDB in production environment.');
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost.');
  });
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error while disconnecting MongoDB:', err);
  }
};

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
