import mongoose from 'mongoose';
import authService from './auth.service';
import User from '../user/user.model';

describe('Auth Service', () => {
  beforeAll(async () => {
    // In a real scenario, use a test database
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/hnue-digital-library-test';
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test@example.com' });
    await mongoose.connection.close();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userBody = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      };

      const user = await authService.createUser(userBody);
      expect(user).toBeDefined();
      expect(user.email).toBe(userBody.email);
    });

    it('should throw error if email is taken', async () => {
      const userBody = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(authService.createUser(userBody)).rejects.toThrow('Email already taken');
    });
  });

  describe('loginUserWithEmailAndPassword', () => {
    it('should return user for valid credentials', async () => {
      const user = await authService.loginUserWithEmailAndPassword('test@example.com', 'password123');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error for invalid password', async () => {
      await expect(authService.loginUserWithEmailAndPassword('test@example.com', 'wrongpassword')).rejects.toThrow('Incorrect email or password');
    });
  });
});
