import { IUser } from '../user/user.interface';
import User from '../user/user.model';
import { ApiError } from '../../common/utils/ApiError';
import { generateToken } from '../../common/utils/token';

const createUser = async (userBody: any) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(400, 'Email already taken');
  }
  return User.create({
    email: userBody.email,
    password: userBody.password,
    role: userBody.role,
    profile: {
      firstName: userBody.firstName,
      lastName: userBody.lastName,
    },
  });
};

const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  return user;
};

const generateAuthTokens = async (user: any) => {
  const expires = process.env.JWT_EXPIRES_IN || '1d';
  const accessToken = generateToken(user._id, expires);
  return {
    access: {
      token: accessToken,
      expires: expires,
    },
  };
};

export default {
  createUser,
  loginUserWithEmailAndPassword,
  generateAuthTokens,
};
