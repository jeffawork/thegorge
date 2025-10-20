import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { OrganizationService } from '../services/organizationService';
import { authenticate, authorize, authorizeOrganization } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimiting';

export default function createOrganizationRoutes() {
  const router = Router();
  const organizationService = new OrganizationService();
  const organizationController = new OrganizationController(organizationService);

  // Apply rate limiting
  router.use(generalRateLimit);

  // All routes require authentication
  router.use(authenticate);

  // Organization management routes (simplified for now)
  router.get('/:organizationId', authorizeOrganization, organizationController.getOrganization.bind(organizationController));
  router.post('/', authorize('admin'), organizationController.createOrganization.bind(organizationController));
  router.put('/:organizationId', authorizeOrganization, organizationController.updateOrganization.bind(organizationController));
  router.delete('/:organizationId', authorize('admin'), organizationController.deleteOrganization.bind(organizationController));

  return router;
}
