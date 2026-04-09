import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import copyService from './copy.service';

const createCopy = catchAsync(async (req: Request, res: Response) => {
  const copy = await copyService.createCopy(req.params.bookId, req.body);
  res.status(201).send({
    success: true,
    data: copy,
    message: 'Thêm bản sao thành công',
  });
});

const getCopies = catchAsync(async (req: Request, res: Response) => {
  const copies = await copyService.getCopiesByBookId(req.params.bookId);
  res.send({
    success: true,
    data: copies,
  });
});

const updateCopy = catchAsync(async (req: Request, res: Response) => {
  const copy = await copyService.updateCopyById(req.params.copyId, req.body);
  res.send({
    success: true,
    data: copy,
    message: 'Cập nhật bản sao thành công',
  });
});

const deleteCopy = catchAsync(async (req: Request, res: Response) => {
  await copyService.deleteCopyById(req.params.copyId);
  res.send({
    success: true,
    message: 'Xóa bản sao thành công',
  });
});

export default {
  createCopy,
  getCopies,
  updateCopy,
  deleteCopy,
};
