import { Request, Response } from "express";
import { catchAsync } from "../../common/utils/catchAsync";
import loanService from "./loan.service";

const borrowBook = catchAsync(async (req: Request, res: Response) => {
  const { copyId, bookId, durationDays } = req.body;
  const loan = await loanService.borrowBook(req.user!._id, {
    copyId,
    bookId,
    durationDays,
  });
  res.status(201).send({
    success: true,
    data: loan,
    message: "Book borrowed successfully",
  });
});

const returnBook = catchAsync(async (req: Request, res: Response) => {
  const loan = await loanService.returnBook(req.params.loanId);
  res.send({
    success: true,
    data: loan,
    message: "Book returned successfully",
  });
});

const getMyLoans = catchAsync(async (req: Request, res: Response) => {
  const loans = await loanService.getLoansByUser(req.user!._id);
  res.send({
    success: true,
    data: loans,
  });
});

const getAllLoans = catchAsync(async (req: Request, res: Response) => {
  const {
    status,
    limit = 10,
    page = 1,
    sortBy = "createdAt:desc",
    search,
  } = req.query;
  const filter: any = {};

  // Mapping frontend status to backend status
  if (status === "Đang mượn") filter.status = "active";
  else if (status === "Đã trả") filter.status = "returned";
  else if (status === "Chờ duyệt") filter.status = "pending";
  else if (status === "Từ chối") filter.status = "rejected";
  else if (status === "Quá hạn") {
    filter.status = "active";
    filter.dueDate = { $lt: new Date() };
  } else if (status && status !== "Tất cả") {
    filter.status = status;
  }

  const options = {
    limit: Number(limit),
    page: Number(page),
    sortBy: sortBy as string,
    search: search as string,
  };

  const result = await loanService.queryLoans(filter, options);
  res.send({
    success: true,
    data: result.results,
    meta: {
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
    },
  });
});

const approveLoan = catchAsync(async (req: Request, res: Response) => {
  const loan = await loanService.approveLoan(req.params.loanId);
  res.send({
    success: true,
    data: loan,
    message: "Yêu cầu mượn đã được phê duyệt",
  });
});

const rejectLoan = catchAsync(async (req: Request, res: Response) => {
  const loan = await loanService.rejectLoan(req.params.loanId);
  res.send({
    success: true,
    data: loan,
    message: "Yêu cầu mượn đã bị từ chối",
  });
});

export default {
  borrowBook,
  returnBook,
  getMyLoans,
  getAllLoans,
  approveLoan,
  rejectLoan,
};

