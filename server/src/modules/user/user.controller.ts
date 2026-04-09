import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import userService from './user.service';

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = {};
  if (req.query.role) {
    Object.assign(filter, { role: req.query.role });
  }
  if (req.query.email) {
    Object.assign(filter, { email: { $regex: req.query.email, $options: 'i' } });
  }

  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    page: req.query.page,
  };
  const result = await userService.queryUsers(filter, options);
  res.send({
    success: true,
    data: result.results,
    meta: {
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
    },
  });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.send({
    success: true,
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send({
    success: true,
    data: user,
    message: 'User updated successfully',
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUserById(req.params.userId);
  res.send({
    success: true,
    message: 'User deleted successfully',
  });
});

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
