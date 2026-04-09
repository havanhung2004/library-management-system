import { Model, Document, Types } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'librarian' | 'admin' | 'superadmin';
  profile: {
    firstName: string;
    lastName: string;
    studentId?: string;
    department?: string;
  };
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: Types.ObjectId): Promise<boolean>;
}
