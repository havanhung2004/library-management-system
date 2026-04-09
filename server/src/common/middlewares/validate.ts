import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

const validate = (schema: Record<string, any>) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = Joi.object(schema);
  const object: Record<string, any> = {};

  // Chỉ lấy những phần (body, params, query) mà schema yêu cầu kiểm tra
  Object.keys(schema).forEach((key) => {
    if (['params', 'query', 'body'].includes(key)) {
      object[key] = req[key as keyof Request];
    }
  });

  const { value, error } = validSchema
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

export default validate;
