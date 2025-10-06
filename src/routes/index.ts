import { Router } from 'express';
import authRoutes from './auth.routes';
import rpcRoutes from './rpc.routes';

const router = Router();

// API versioning
router.use('/auth', authRoutes);
router.use('/rpcs', rpcRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default router;
