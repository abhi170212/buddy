import jwt from 'jsonwebtoken';
import { Response, CookieOptions } from 'express';
import { config } from '../config/env';
import { UserRole } from '../constants/roles';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const getAuthCookieOptions = (): CookieOptions => {
  const isProduction = config.isProd;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie('token', token, getAuthCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie('token', {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
};
