import { Request, Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import dashboardService from './dashboard.service';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  res.send({
    success: true,
    data: stats,
  });
});

const getPublicStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await dashboardService.getPublicStats();
  res.send({
    success: true,
    data: stats,
  });
});

export default {
  getDashboardStats,
  getPublicStats,
};
