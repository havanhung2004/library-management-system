import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import userService from './user.service';
import { uploadToCloudinary, deleteFromCloudinary } from '../../common/utils/cloudinary';

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { role, email, search, limit = 10, page = 1, sortBy } = req.query;
  const filter: any = {};
  if (role) filter.role = role;
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { 'profile.studentId': { $regex: search, $options: 'i' } },
    ];
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

const getMe = catchAsync(async (req: Request, res: Response) => {
  res.send({
    success: true,
    data: req.user,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, studentId, department } = req.body;
  const updateBody = {
    profile: {
      ...req.user!.profile,
      firstName: firstName || req.user!.profile.firstName,
      lastName: lastName || req.user!.profile.lastName,
      studentId: studentId || req.user!.profile.studentId,
      department: department || req.user!.profile.department,
    },
  };

  const user = await userService.updateUserById(req.user!._id, updateBody);
  res.send({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
});

const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image');
  }

  // Delete old avatar if exists
  if (req.user!.profile.avatarPublicId) {
    await deleteFromCloudinary(req.user!.profile.avatarPublicId);
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, 'avatars', `avatar_${req.user!._id}`);
  
  const updateBody = {
    profile: {
      ...req.user!.profile,
      avatar: result.secure_url,
      avatarPublicId: result.public_id,
    },
  };

  const user = await userService.updateUserById(req.user!._id, updateBody);
  res.send({
    success: true,
    data: user,
    message: 'Avatar updated successfully',
  });
});

export default {
  getUsers,
  getUser,
  getMe,
  updateMe,
  updateAvatar,
  updateUser,
  deleteUser,
};
