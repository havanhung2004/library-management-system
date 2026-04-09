import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'INFO' },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
