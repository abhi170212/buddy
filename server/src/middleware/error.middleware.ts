import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { config } from '../config/env';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // 1. Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    error = new AppError(message, 409, 'CONFLICT', { duplicateField: field });
  }

  // 2. Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid identifier format: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // 3. JWT error handling
  if (err.name === 'JsonWebTokenError') {
    error = AppError.unauthorized('Invalid authentication token signature.');
  }
  if (err.name === 'TokenExpiredError') {
    error = AppError.unauthorized('Authentication token has expired. Please log in again.');
  }

  // Determine response status and payload
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred on the server.';
  const details = error.details || (!config.isProd && statusCode === 500 ? { stack: error.stack } : undefined);

  if (statusCode === 500) {
    console.error('[ServerError]', err);
  }

  sendError(res, errorCode, message, statusCode, details);
};
