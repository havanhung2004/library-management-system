import Loan from './loan.model';
import Copy from '../book/copy.model';
import User from '../user/user.model';
import notificationService from '../notification/notification.service';
import { ApiError } from '../../common/utils/ApiError';
import { Types } from 'mongoose';

const borrowBook = async (
  userId: Types.ObjectId,
  options: { copyId?: string; bookId?: string; durationDays?: number }
) => {
  const { copyId, bookId, durationDays = 14 } = options;

  let copy;
  if (copyId) {
    copy = await Copy.findById(copyId).populate('bookId');
  } else if (bookId) {
    copy = await Copy.findOne({ bookId, status: 'available' }).populate('bookId');
  }

  if (!copy || copy.status !== 'available') {
    throw new ApiError(400, 'Không còn bản sao nào sẵn có để mượn');
  }

  const user = await User.findById(userId);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + durationDays);

  const loan = await Loan.create({
    userId,
    copyId: copy._id,
    dueDate,
    status: 'active',
  });

  copy.status = 'borrowed';
  await copy.save();

  // Create notification for Admin
  const bookTitle = (copy.bookId as any)?.title || 'một cuốn sách';
  const userName = user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Một sinh viên';
  
  await notificationService.createNotification(
    userId.toString(),
    `${userName} đã đăng ký mượn cuốn sách "${bookTitle}"`,
    'LOAN_REQUEST'
  );

  return loan;
};

const returnBook = async (loanId: string) => {
  const loan = await Loan.findById(loanId);
  if (!loan || loan.status === 'returned') {
    throw new ApiError(400, 'Invalid loan record');
  }

  loan.status = 'returned';
  loan.returnDate = new Date();
  await loan.save();

  const copy = await Copy.findById(loan.copyId);
  if (copy) {
    copy.status = 'available';
    await copy.save();
  }

  return loan;
};

const getLoansByUser = async (userId: Types.ObjectId) => {
  return Loan.find({ userId }).populate({
    path: 'copyId',
    populate: { path: 'bookId', select: 'title author' },
  });
};

const getAllLoans = async () => {
  return Loan.find()
    .populate('userId', 'profile.firstName profile.lastName email')
    .populate({
      path: 'copyId',
      populate: { path: 'bookId', select: 'title author' },
    })
    .sort({ createdAt: -1 });
};

export default {
  borrowBook,
  returnBook,
  getLoansByUser,
  getAllLoans,
};
