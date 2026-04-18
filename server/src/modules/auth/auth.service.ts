import User from '../user/user.model';
import { ApiError } from '../../common/utils/ApiError';
import { generateToken, verifyToken } from '../../common/utils/token';
import Token from './token.model';
import { catchAsync } from '../../common/utils/catchAsync';

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

const saveToken = async (token: string, userId: any, expires: Date, type: string, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    userId,
    expires,
    type,
    blacklisted,
  });
  return tokenDoc;
};

const generateAuthTokens = async (user: any) => {
  const accessTokenExpires = process.env.JWT_ACCESS_EXPIRATION_MINUTES || '30m';
  const accessToken = generateToken(user._id, accessTokenExpires);

  const refreshTokenExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS || '7', 10);
  const refreshTokenExpiresDate = new Date();
  refreshTokenExpiresDate.setDate(refreshTokenExpiresDate.getDate() + refreshTokenExpiresDays);
  
  const refreshToken = generateToken(user._id, `${refreshTokenExpiresDays}d`);
  await saveToken(refreshToken, user._id, refreshTokenExpiresDate, 'refresh');

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires,
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpiresDate,
    },
  };
};

const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
    if (!refreshTokenDoc) {
      throw new Error();
    }
    const payload: any = verifyToken(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.deleteOne();
    return generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(401, 'Please authenticate');
  }
};

const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(404, 'Not found');
  }
  await refreshTokenDoc.deleteOne();
};

export default {
  createUser,
  loginUserWithEmailAndPassword,
  generateAuthTokens,
  refreshAuth,
  logout,
};
