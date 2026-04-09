import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import loanService from './loan.service';

const borrowBook = catchAsync(async (req: Request, res: Response) => {
  const { copyId, bookId, durationDays } = req.body;
  const loan = await loanService.borrowBook(req.user!._id, { copyId, bookId, durationDays });
  res.status(201).send({
    success: true,
    data: loan,
    message: 'Book borrowed successfully',
  });
});

const returnBook = catchAsync(async (req: Request, res: Response) => {
  const loan = await loanService.returnBook(req.params.loanId);
  res.send({
    success: true,
    data: loan,
    message: 'Book returned successfully',
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
  const loans = await loanService.getAllLoans();
  res.send({
    success: true,
    data: loans,
  });
});

export default {
  borrowBook,
  returnBook,
  getMyLoans,
  getAllLoans,
};
