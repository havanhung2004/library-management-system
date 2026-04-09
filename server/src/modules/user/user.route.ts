import express from 'express';
import auth from '../../common/middlewares/auth';
import userController from './user.controller';

const router = express.Router();

router
  .route('/')
  .get(auth('superadmin', 'admin', 'librarian'), userController.getUsers);

router
  .route('/:userId')
  .get(auth('superadmin', 'admin', 'librarian'), userController.getUser)
  .patch(auth('superadmin', 'admin', 'superadmin'), userController.updateUser)
  .delete(auth('superadmin'), userController.deleteUser);

export default router;
