import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { User, IUser } from '../models/user.model';

// Augment Express Request type to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: TokenPayload;
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Fall back to secure HTTP-only cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token required.'));
    }

    // Verify token validity
    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch {
      return next(AppError.unauthorized('Invalid or expired authentication token.'));
    }

    // Verify user exists and is active
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return next(AppError.unauthorized('User session is invalid or account deactivated.'));
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
};
