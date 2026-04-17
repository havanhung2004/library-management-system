import Loan from "./loan.model";
import Copy from "../book/copy.model";
import Book from "../book/book.model";
import User from "../user/user.model";
import notificationService from "../notification/notification.service";
import { ApiError } from "../../common/utils/ApiError";
import { Types } from "mongoose";
import fineService from "../fine/fine.service";

const borrowBook = async (
  userId: Types.ObjectId,
  options: { copyId?: string; bookId?: string; durationDays?: number },
) => {
  const { copyId, bookId, durationDays = 14 } = options;

  let copy;
  if (copyId) {
    copy = await Copy.findById(copyId).populate("bookId");
  } else if (bookId) {
    copy = await Copy.findOne({ bookId, status: "available" }).populate(
      "bookId",
    );
  }

  if (!copy || copy.status !== "available") {
    throw new ApiError(400, "Không còn bản sao nào sẵn có để mượn");
  }

  const user = await User.findById(userId);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + durationDays);

  const loan = await Loan.create({
    userId,
    copyId: copy._id,
    dueDate,
    status: "pending",
  });

  copy.status = "reserved";
  await copy.save();

  // Create notification for Admin
  const bookTitle = (copy.bookId as any)?.title || "một cuốn sách";
  const userName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : "Một sinh viên";

  await notificationService.createNotification(
    userId.toString(),
    `${userName} đã đăng ký mượn cuốn sách "${bookTitle}"`,
    "LOAN_REQUEST",
  );

  return loan;
};

const returnBook = async (loanId: string) => {
  const loan = await Loan.findById(loanId);
  if (!loan || loan.status === "returned") {
    throw new ApiError(400, "Invalid loan record");
  }

  loan.status = "returned";
  loan.returnDate = new Date();
  await loan.save();

  // Check for overdue and create fine
  const dueDate = new Date(loan.dueDate);
  const returnDate = new Date(loan.returnDate);

  if (returnDate > dueDate) {
    const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
    const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const amount = overdueDays * 5000; // 5k per day

    await fineService.createFine({
      userId: loan.userId,
      loanId: loan._id as Types.ObjectId,
      amount,
      overdueDays,
      reason: `Trả sách chậm ${overdueDays} ngày`,
      status: "pending",
    });

    // Create notification for user
    await notificationService.createNotification(
      loan.userId.toString(),
      `Bạn đã trả sách chậm ${overdueDays} ngày. Phí phạt là ${amount.toLocaleString("vi-VN")} VNĐ.`,
      "FINE_CREATED",
    );
  }

  const copy = await Copy.findById(loan.copyId);
  if (copy) {
    copy.status = "available";
    await copy.save();
  }

  return loan;
};

const getLoansByUser = async (userId: Types.ObjectId) => {
  return Loan.find({ userId }).populate({
    path: "copyId",
    populate: { path: "bookId", select: "title author coverImage" },
  });
};

const queryLoans = async (filter: any, options: any) => {
  const { limit = 10, page = 1, sortBy = "createdAt:desc", search } = options;
  const skip = (page - 1) * limit;

  let finalFilter = { ...filter };

  if (search) {
    const regex = { $regex: search, $options: "i" };

    // 1. Find users matching search
    const users = await User.find({
      $or: [
        { "profile.firstName": regex },
        { "profile.lastName": regex },
        { email: regex },
      ],
    }).select("_id");
    const userIds = users.map((u) => u._id);

    // 2. Find books matching search
    const books = await Book.find({
      $or: [{ title: regex }, { author: regex }],
    }).select("_id");
    const bookIds = books.map((b) => b._id);

    // 3. Find copies belonging to those books
    const copies = await Copy.find({ bookId: { $in: bookIds } }).select("_id");
    const copyIds = copies.map((c) => c._id);

    // 4. Update filter
    finalFilter = {
      ...filter,
      $or: [{ userId: { $in: userIds } }, { copyId: { $in: copyIds } }],
    };
  }

  const [sortField, sortOrder] = sortBy.split(":");
  const sort: any = {};
  sort[sortField] = sortOrder === "desc" ? -1 : 1;

  const loans = await Loan.find(finalFilter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("userId", "profile.firstName profile.lastName email")
    .populate({
      path: "copyId",
      populate: { path: "bookId", select: "title author coverImage" },
    });

  const totalResults = await Loan.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: loans,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getAllLoans = async () => {
  return Loan.find()
    .populate("userId", "profile.firstName profile.lastName email")
    .populate({
      path: "copyId",
      populate: { path: "bookId", select: "title author" },
    })
    .sort({ createdAt: -1 });
};

const approveLoan = async (loanId: string) => {
  const loan = await Loan.findById(loanId).populate("copyId");
  if (!loan || loan.status !== "pending") {
    throw new ApiError(400, "Yêu cầu không hợp lệ hoặc đã được xử lý");
  }

  const durationDays = 14; // Default or extract from original loan if saved
  const borrowDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + durationDays);

  loan.status = "active";
  loan.borrowDate = borrowDate;
  loan.dueDate = dueDate;
  await loan.save();

  const copy = await Copy.findById(loan.copyId);
  if (copy) {
    copy.status = "borrowed";
    await copy.save();
  }

  // Notify user
  await notificationService.createNotification(
    loan.userId.toString(),
    `Yêu cầu mượn sách của bạn đã được phê duyệt. Hạn trả là ${dueDate.toLocaleDateString("vi-VN")}.`,
    "LOAN_APPROVED",
  );

  return loan;
};

const rejectLoan = async (loanId: string) => {
  const loan = await Loan.findById(loanId);
  if (!loan || loan.status !== "pending") {
    throw new ApiError(400, "Yêu cầu không hợp lệ hoặc đã được xử lý");
  }

  loan.status = "rejected";
  await loan.save();

  const copy = await Copy.findById(loan.copyId);
  if (copy) {
    copy.status = "available";
    await copy.save();
  }

  // Notify user
  await notificationService.createNotification(
    loan.userId.toString(),
    `Rất tiếc, yêu cầu mượn sách của bạn đã bị từ chối.`,
    "LOAN_REJECTED",
  );

  return loan;
};

export default {
  borrowBook,
  approveLoan,
  rejectLoan,
  returnBook,
  getLoansByUser,
  getAllLoans,
  queryLoans,
};

