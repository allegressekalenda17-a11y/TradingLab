import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export interface AppError extends Error {
  status?: number;
  details?: any;
}

// Global error handler middleware
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  // Log error
  logger.error({
    err,
    status,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  // Send response (hide details in production)
  res.status(status).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { details: err.details, stack: err.stack }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
