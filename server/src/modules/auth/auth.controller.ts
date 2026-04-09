import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import authService from './auth.service';

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.createUser(req.body);
  const tokens = await authService.generateAuthTokens(user);
  res.status(201).send({
    success: true,
    data: { user, tokens },
    message: 'User registered successfully',
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await authService.generateAuthTokens(user);
  res.send({
    success: true,
    data: { user, tokens },
    message: 'Login successful',
  });
});

export default {
  register,
  login,
};
