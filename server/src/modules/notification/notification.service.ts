import Notification from './notification.model';

const createNotification = async (userId: string, message: string, type: string) => {
  return Notification.create({
    userId,
    message,
    type,
    isRead: false,
  });
};

const getNotifications = async (filter: any = {}) => {
  return Notification.find(filter).sort({ createdAt: -1 }).limit(50);
};

const getUnreadCount = async () => {
  return Notification.countDocuments({ isRead: false });
};

const markAsRead = async (notificationId: string) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error('Notification not found');
  }
  notification.isRead = true;
  await notification.save();
  return notification;
};

const markAllAsRead = async () => {
  return Notification.updateMany({ isRead: false }, { isRead: true });
};

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
