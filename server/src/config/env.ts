import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/study_tracker',
  jwtSecret: process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod_study_tracker_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://127.0.0.1:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  isProd: process.env.NODE_ENV === 'production',
};
