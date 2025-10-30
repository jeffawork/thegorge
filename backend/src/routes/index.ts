import { Router } from 'express';
import authRoutes from './auth.routes';
import createRpcRoutes from './rpc.routes';
// import createOrganizationRoutes from './organization.routes';
// import createAlertRoutes from './alert.routes';
import { MonitoringService } from '../services/monitoringService';

export default function createApiRoutes(monitoringService: MonitoringService) {
  const router = Router();

  // API versioning
  router.use('/auth', authRoutes);
  router.use('/rpcs', createRpcRoutes(monitoringService));
  // router.use('/organizations', createOrganizationRoutes());
  // router.use('/alerts', createAlertRoutes());

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  return router;
}
