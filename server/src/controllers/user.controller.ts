import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { UserRoles } from '../constants/roles';
import { sendSuccess } from '../utils/response';

export const getStudents = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only accessible to mentors (guarded by requireRole(['mentor']))
    const students = await User.find({ role: UserRoles.STUDENT, isActive: true })
      .select('name email timezone avatarUrl bio createdAt')
      .sort({ createdAt: -1 });

    sendSuccess(res, {
      count: students.length,
      students: students.map((s) => s.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};
