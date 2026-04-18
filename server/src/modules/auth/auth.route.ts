import express from 'express';
import validate from '../../common/middlewares/validate';
import authValidation from './auth.validation';
import authController from './auth.controller';

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-tokens', authController.refreshTokens);

export default router;
