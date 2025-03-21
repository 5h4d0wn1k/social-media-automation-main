import { NextApiRequest, NextApiResponse } from 'next';
import { validateConfig } from './config';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
function rateLimit(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Get or create rate limit entry
  let rateLimitEntry = rateLimitStore.get(ip);
  if (!rateLimitEntry) {
    rateLimitEntry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(ip, rateLimitEntry);
  }

  // Reset if window has passed
  if (now > rateLimitEntry.resetTime) {
    rateLimitEntry.count = 0;
    rateLimitEntry.resetTime = now + RATE_LIMIT_WINDOW;
  }

  // Check if rate limit exceeded
  if (rateLimitEntry.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimitEntry.resetTime - now) / 1000),
    });
  }

  // Increment counter
  rateLimitEntry.count++;

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS_PER_WINDOW - rateLimitEntry.count);
  res.setHeader('X-RateLimit-Reset', rateLimitEntry.resetTime);

  next();
}

// Authentication middleware
function authenticate(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Error handling middleware
function errorHandler(err: any, req: NextApiRequest, res: NextApiResponse, next: () => void) {
  console.error('API Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
}

// Combined middleware
export function withMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Validate environment variables
      validateConfig();

      // Apply middleware
      await new Promise((resolve, reject) => {
        rateLimit(req, res, () => {
          authenticate(req, res, () => {
            resolve(null);
          });
        });
      });

      // Call the handler
      return handler(req, res);
    } catch (error) {
      return errorHandler(error, req, res, () => {});
    }
  };
} 