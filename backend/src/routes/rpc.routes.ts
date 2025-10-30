import { Router } from 'express';
import { RpcController } from '../controllers/rpc.controller';
import { RpcService } from '../services/rpc.service';
import { RpcRepository } from '../repositories/rpc.repository';
import { Web3Service } from '../services/web3Service';
import { MonitoringService } from '../services/monitoringService';
import { authenticate, authorizeResource } from '../middleware/auth';
import { generalRateLimit, strictRateLimit } from '../middleware/rateLimiting';

export default function createRpcRoutes(monitoringService: MonitoringService) {
  const router = Router();
  const rpcRepository = new RpcRepository();
  const web3Service = new Web3Service();
  const rpcService = new RpcService(rpcRepository, web3Service, monitoringService);
  const rpcController = new RpcController(rpcService);

  // Apply rate limiting
  router.use(generalRateLimit);

  // All routes require authentication
  router.use(authenticate);

  // RPC configuration routes
  router.get('/', rpcController.getRpcConfigs.bind(rpcController));
  router.get('/:rpcId', authorizeResource('rpc'), rpcController.getRpcConfig.bind(rpcController));
  router.post('/', strictRateLimit, rpcController.createRpcConfig.bind(rpcController));
  router.put('/:rpcId', authorizeResource('rpc'), rpcController.updateRpcConfig.bind(rpcController));
  router.delete('/:rpcId', authorizeResource('rpc'), rpcController.deleteRpcConfig.bind(rpcController));

  // RPC status and testing routes
  router.get('/:rpcId/status', authorizeResource('rpc'), rpcController.getRpcStatus.bind(rpcController));
  router.get('/:rpcId/metrics', authorizeResource('rpc'), rpcController.getRpcMetrics.bind(rpcController));
  router.put('/:rpcId/toggle', authorizeResource('rpc'), rpcController.toggleRpcStatus.bind(rpcController));

  // Public testing route (no resource authorization needed)
  router.post('/test', rpcController.testRpcConnection.bind(rpcController));

  return router;
}
