import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions';
import { apiLogger } from '../utils/logger';

export abstract class BaseController {
  protected handleError(error: any, req: Request, res: Response): void {
    apiLogger.error('Controller error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (error instanceof BaseException) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
        timestamp: error.timestamp,
        details: error.details,
      });
      return;
    }

    // Handle unexpected errors
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date(),
    });
  }

  protected sendSuccess(res: Response, data: any, message?: string): void {
    res.json({
      success: true,
      data,
      message,
      timestamp: new Date(),
    });
  }

  protected sendCreated(res: Response, data: any, message?: string): void {
    res.status(201).json({
      success: true,
      data,
      message,
      timestamp: new Date(),
    });
  }

  protected sendNoContent(res: Response): void {
    res.status(204).send();
  }

  protected getUserId(req: Request): string {
    if (!req.user?.userId) {
      throw new Error('User ID not found in request');
    }
    return req.user.userId;
  }

  protected getPaginationParams(req: Request): { limit?: number; offset?: number } {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    return { limit, offset };
  }
}
