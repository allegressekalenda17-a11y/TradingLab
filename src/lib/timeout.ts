import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Request timeout middleware (30 seconds for most endpoints, 60s for AI)
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeoutId = setTimeout(() => {
      logger.warn({ url: req.url, method: req.method }, 'Request timeout');
      if (!res.headersSent) {
        res.status(408).json({ error: 'Request timeout' });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeoutId));
    res.on('close', () => clearTimeout(timeoutId));

    next();
  };
};
