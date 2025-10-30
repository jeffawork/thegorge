import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { AlertService } from '../services/alertService';
import { authenticate, authorizeResource } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimiting';

export default function createAlertRoutes() {
  const router = Router();
  const alertService = new AlertService();
  const alertController = new AlertController(alertService);

  // Apply rate limiting
  router.use(generalRateLimit);

  // All routes require authentication
  router.use(authenticate);

  // Alert management routes
  router.get('/', alertController.getAlerts.bind(alertController));
  router.get('/:alertId', authorizeResource('alert'), alertController.getAlert.bind(alertController));
  router.put('/:alertId/resolve', authorizeResource('alert'), alertController.resolveAlert.bind(alertController));
  router.delete('/:alertId', authorizeResource('alert'), alertController.deleteAlert.bind(alertController));

  // Alert rules management routes removed - methods not implemented in AlertController
  // TODO: Implement alert rule management routes when AlertRuleService is created

  // Alert statistics routes removed - methods not implemented in AlertController
  // TODO: Implement alert statistics routes when methods are added to AlertController

  return router;
}
