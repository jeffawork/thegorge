import { BaseException } from './base.exception';

export class AuthenticationException extends BaseException {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTH_FAILED', details);
  }
}

export class AuthorizationException extends BaseException {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 403, 'ACCESS_DENIED', details);
  }
}

export class TokenExpiredException extends BaseException {
  constructor(message: string = 'Token has expired', details?: any) {
    super(message, 401, 'TOKEN_EXPIRED', details);
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message: string = 'Invalid token', details?: any) {
    super(message, 401, 'INVALID_TOKEN', details);
  }
}

export class UserNotFoundException extends BaseException {
  constructor(message: string = 'User not found', details?: any) {
    super(message, 404, 'USER_NOT_FOUND', details);
  }
}
