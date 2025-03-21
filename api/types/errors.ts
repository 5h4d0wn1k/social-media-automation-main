export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class ValidationError extends APIError {
  constructor(message: string = 'Invalid input') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class PlatformError extends APIError {
  constructor(
    platform: string,
    message: string,
    public originalError?: any
  ) {
    super(`${platform}: ${message}`, 500, `${platform.toUpperCase()}_ERROR`);
  }
} 