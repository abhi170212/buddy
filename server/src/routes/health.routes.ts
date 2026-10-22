import { Router } from 'express';
import { getHealth, getReadiness } from '../controllers/health.controller';

const router = Router();

// Liveness check
router.get('/', getHealth);

// Readiness check (verifies database)
router.get('/ready', getReadiness);

export default router;
