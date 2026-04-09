import express from 'express';
import auth from '../../common/middlewares/auth';
import notificationController from './notification.controller';

const router = express.Router();

router
  .route('/')
  .get(auth('superadmin', 'admin', 'librarian'), notificationController.getNotifications)
  .patch(auth('superadmin', 'admin', 'librarian'), notificationController.markAllAsRead);

router
  .route('/:notificationId/read')
  .patch(auth('superadmin', 'admin', 'librarian'), notificationController.markAsRead);

export default router;
