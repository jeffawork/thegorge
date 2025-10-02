import { BaseException } from './base.exception';

export class ValidationException extends BaseException {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ResourceNotFoundException extends BaseException {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, 'RESOURCE_NOT_FOUND', details);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitException extends BaseException {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}
