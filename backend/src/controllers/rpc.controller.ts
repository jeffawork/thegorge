import { Request, Response } from 'express';
// NextFunction removed - not used in this controller
import { BaseController } from './base.controller';
import { CreateRpcDto, UpdateRpcDto } from '../dto/rpc.dto';
import { RpcService } from '../services/rpc.service';
import { ValidationException } from '../exceptions';
// ResourceNotFoundException and AuthorizationException removed - not currently used
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class RpcController extends BaseController {
  private rpcService: RpcService;

  constructor(rpcService: RpcService) {
    super();
    this.rpcService = rpcService;
  }

  async getRpcConfigs(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { limit, offset } = this.getPaginationParams(req);

      const rpcs = await this.rpcService.getRpcConfigs(userId, limit, offset);
      this.sendSuccess(res, rpcs, 'RPC configurations retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async getRpcConfig(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const rpcId = req.params.rpcId;

      const rpc = await this.rpcService.getRpcConfig(userId, rpcId);
      this.sendSuccess(res, rpc, 'RPC configuration retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async createRpcConfig(req: Request, res: Response): Promise<void> {
    try {
      const createRpcDto = plainToClass(CreateRpcDto, req.body);
      const validationErrors = await validate(createRpcDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid RPC configuration data', validationErrors);
      }

      const userId = this.getUserId(req);
      const rpc = await this.rpcService.createRpcConfig(userId, createRpcDto);

      this.sendCreated(res, rpc, 'RPC configuration created successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async updateRpcConfig(req: Request, res: Response): Promise<void> {
    try {
      const updateRpcDto = plainToClass(UpdateRpcDto, req.body);
      const validationErrors = await validate(updateRpcDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid RPC configuration data', validationErrors);
      }

      const userId = this.getUserId(req);
      const rpcId = req.params.rpcId;

      const rpc = await this.rpcService.updateRpcConfig(userId, rpcId, updateRpcDto);
      this.sendSuccess(res, rpc, 'RPC configuration updated successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async deleteRpcConfig(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const rpcId = req.params.rpcId;

      await this.rpcService.deleteRpcConfig(userId, rpcId);
      this.sendNoContent(res);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async getRpcStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const rpcId = req.params.rpcId;

      const status = await this.rpcService.getRpcStatus(userId, rpcId);
      this.sendSuccess(res, status, 'RPC status retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async testRpcConnection(req: Request, res: Response): Promise<void> {
    try {
      const createRpcDto = plainToClass(CreateRpcDto, req.body);
      const validationErrors = await validate(createRpcDto);

      if (validationErrors.length > 0) {
        throw new ValidationException('Invalid RPC configuration data', validationErrors);
      }

      const result = await this.rpcService.testRpcConnection(createRpcDto);
      this.sendSuccess(res, result, 'RPC connection test completed');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async getRpcMetrics(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const rpcId = req.params.rpcId;
      const timeRange = req.query.timeRange as string || '24h';

      const metrics = await this.rpcService.getRpcMetrics(userId, rpcId, timeRange);
      this.sendSuccess(res, metrics, 'RPC metrics retrieved successfully');
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  async toggleRpcStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const rpcId = req.params.rpcId;
      const enabled = req.body.enabled;

      if (typeof enabled !== 'boolean') {
        throw new ValidationException('Enabled field must be a boolean');
      }

      const rpc = await this.rpcService.toggleRpcStatus(userId, rpcId, enabled);
      this.sendSuccess(res, rpc, `RPC ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }
}
