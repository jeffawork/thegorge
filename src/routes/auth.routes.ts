import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/authService';
import { UserRepository } from '../repositories/user.repository';
import { authenticate } from '../middleware/auth';
import { generalRateLimit, authRateLimit } from '../middleware/rateLimiting';

const router = Router();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Apply rate limiting
router.use(generalRateLimit);

// Public routes
router.post('/login', authRateLimit, authController.login.bind(authController));
router.post('/register', authRateLimit, authController.register.bind(authController));
router.post('/refresh', authRateLimit, authController.refreshToken.bind(authController));
router.post('/forgot-password', authRateLimit, authController.forgotPassword.bind(authController));
router.post('/reset-password', authRateLimit, authController.resetPassword.bind(authController));

// Protected routes
router.use(authenticate);
router.get('/profile', authController.getProfile.bind(authController));
router.put('/profile', authController.updateProfile.bind(authController));
router.put('/change-password', authController.changePassword.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
