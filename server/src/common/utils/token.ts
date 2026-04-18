import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (
  userId: Types.ObjectId,
  expires: string | number,
  secret: Secret = process.env.JWT_SECRET || 'secret'
): string => {
  const payload = {
    sub: userId,
  };
  const options: SignOptions = {
    expiresIn: expires as any,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: Secret = process.env.JWT_SECRET || 'secret') => {
  return jwt.verify(token, secret);
};
