import express from 'express';
import auth from '../../common/middlewares/auth';
import userController from './user.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router
  .route('/')
  .get(auth('superadmin', 'admin', 'librarian'), userController.getUsers);

router.get('/me', auth(), userController.getMe);
router.patch('/me', auth(), userController.updateMe);
router.post('/me/avatar', auth(), upload.single('avatar'), userController.updateAvatar);

router
  .route('/:userId')
  .get(auth('superadmin', 'admin', 'librarian'), userController.getUser)
  .patch(auth('superadmin', 'admin', 'superadmin'), userController.updateUser)
  .delete(auth('superadmin'), userController.deleteUser);

export default router;
