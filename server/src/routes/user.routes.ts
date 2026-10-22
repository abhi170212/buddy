import { Router } from 'express';
import { getStudents } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRoles } from '../constants/roles';

const router = Router();

// Mentor-only route to inspect enrolled students
router.get('/students', requireAuth, requireRole([UserRoles.MENTOR]), getStudents);

export default router;
