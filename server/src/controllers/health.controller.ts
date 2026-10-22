import { Request, Response } from 'express';
import { isDBConnected } from '../config/db';
import { config } from '../config/env';
import { sendSuccess, sendError } from '../utils/response';

export const getHealth = (_req: Request, res: Response): void => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
  });
};

export const getReadiness = (_req: Request, res: Response): void => {
  const dbConnected = isDBConnected();

  if (!dbConnected) {
    sendError(
      res,
      'SERVICE_UNAVAILABLE',
      'Database connectivity check failed. Service is not ready.',
      503,
      { database: 'disconnected' }
    );
    return;
  }

  const memoryUsage = process.memoryUsage();

  sendSuccess(res, {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'connected',
    },
    system: {
      nodeVersion: process.version,
      rssMemoryMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
    },
  });
};
