import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public auth routes with rate limiting
router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);

// Protected session restoration route
router.get('/me', requireAuth, getMe);

export default router;
