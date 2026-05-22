import { Request, Response, NextFunction } from "express";
import { createLogger } from "./logger";

const logger = createLogger("errorHandler");

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Global Error Handler Middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(
      {
        statusCode: err.statusCode,
        message: err.message,
        path: req.path,
        method: req.method
      },
      "Application Error"
    );
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
      timestamp: new Date().toISOString()
    });
  }

  // Unhandled errors
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    },
    "Unhandled Exception"
  );

  res.status(500).json({
    error: process.env.NODE_ENV === "production" 
      ? "Internal Server Error" 
      : err.message,
    status: 500,
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
