import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import userService from '../../modules/user/user.service';

const auth = (...requiredRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Please authenticate');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

    const user = await userService.getUserById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'Please authenticate');
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new ApiError(403, 'Forbidden');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    console.error('Auth Middleware Error:', error);
    next(new ApiError(401, 'Please authenticate'));
  }
};

export default auth;
