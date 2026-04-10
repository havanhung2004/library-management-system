import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import fineService from './fine.service';
import { ApiError } from '../../common/utils/ApiError';

const getMyFines = catchAsync(async (req: Request, res: Response) => {
  const fines = await fineService.getFinesByUser(req.user!._id);
  res.send({
    success: true,
    data: fines,
  });
});

const getFines = catchAsync(async (req: Request, res: Response) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc', status, userId } = req.query;
  const filter: any = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;

  const options = { limit: Number(limit), page: Number(page), sortBy };
  const result = await fineService.getAllFines(filter, options);
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

const payFine = catchAsync(async (req: Request, res: Response) => {
  const { paymentMethod = 'online' } = req.body;
  const fine = await fineService.payFine(req.params.fineId, paymentMethod);
  res.send({
    success: true,
    data: fine,
    message: 'Thanh toán thành công',
  });
});

export default {
  getMyFines,
  getFines,
  payFine,
};
