import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './utils/errors';

export const createApp = (): Express => {
  const app = express();

  // 1. Security HTTP Headers
  app.use(helmet());

  // 2. CORS configuration with credentials support
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or supertest)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body and Cookie Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // 4. Request Logging (non-production)
  if (!config.isProd) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[HTTP] ${req.method} ${req.url}`);
      next();
    });
  }

  // 5. Mount API Routes
  app.use('/api', apiRoutes);

  // 6. Handle Undefined Routes (404)
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`));
  });

  // 7. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
