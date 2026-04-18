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

const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ success: true, data: { ...tokens } });
});

export default {
  register,
  login,
  logout,
  refreshTokens,
};
