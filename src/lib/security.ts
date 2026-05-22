import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Rate limiter for general API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path === '/api/health', // Skip health checks
});

// Stricter rate limiter for AI endpoint
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for prediction endpoint
export const predictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: 'Too many prediction requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// JSON payload size limit middleware
export const jsonSizeLimit = (maxSize: string = '1mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1048576) { // 1MB
      return res.status(413).json({ error: 'Payload too large' });
    }
    next();
  };
};

// GEMINI API KEY validation
export const validateGeminiAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' });
  }
  next();
};
