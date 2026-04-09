import User from './user.model';

const getUserById = async (id: string) => {
  return User.findById(id);
};

const queryUsers = async (filter: any, options: any) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sortBy.split(':');
  const sort: any = {};
  sort[sortField] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalResults = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: users,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const updateUserById = async (userId: string, updateBody: any) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, user._id))) {
    throw new Error('Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  await user.deleteOne();
  return user;
};

export default {
  getUserById,
  queryUsers,
  updateUserById,
  deleteUserById,
};
