import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import notificationService from './notification.service';

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await notificationService.getNotifications();
  const unreadCount = await notificationService.getUnreadCount();
  res.send({
    success: true,
    data: {
      notifications,
      unreadCount,
    },
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAsRead(req.params.notificationId);
  res.send({
    success: true,
    message: 'Notification marked as read',
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead();
  res.send({
    success: true,
    message: 'All notifications marked as read',
  });
});

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
