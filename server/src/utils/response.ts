import { Response } from 'express';

export interface ApiResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponseMetadata
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const sendError = (
  res: Response,
  errorCode: string,
  message: string,
  statusCode: number = 400,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
};
