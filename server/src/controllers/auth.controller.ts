import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { AppError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, timezone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(AppError.conflict('An account with this email address already exists.'));
    }

    // Secure password hashing with cost factor 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user document
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      timezone: timezone || 'UTC',
    });

    // Issue JWT token and set HTTP-only cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    setAuthCookie(res, token);

    sendSuccess(
      res,
      {
        token,
        user: user.toJSON(),
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(AppError.unauthorized('Invalid email or password.'));
    }

    // Check password against bcrypt hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(AppError.unauthorized('Invalid email or password.'));
    }

    // Verify account active state
    if (!user.isActive) {
      return next(AppError.unauthorized('Your account has been deactivated. Please contact your mentor.'));
    }

    // Issue token and set cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    setAuthCookie(res, token);

    sendSuccess(
      res,
      {
        token,
        user: user.toJSON(),
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

export const logout = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  clearAuthCookie(res);
  sendSuccess(res, { message: 'Successfully signed out.' }, 200);
};

export const getMe = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Attached by requireAuth middleware
  sendSuccess(res, { user: req.user!.toJSON() }, 200);
};
