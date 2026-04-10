import Fine from './fine.model';
import { IFine } from './fine.interface';
import { Types } from 'mongoose';
import { ApiError } from '../../common/utils/ApiError';

const createFine = async (fineData: Partial<IFine>) => {
  return Fine.create(fineData);
};

const getFinesByUser = async (userId: Types.ObjectId) => {
  return Fine.find({ userId }).populate({
    path: 'loanId',
    populate: { path: 'copyId', populate: { path: 'bookId', select: 'title' } },
  }).sort({ createdAt: -1 });
};

const getAllFines = async (filter: any, options: any) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sortBy.split(':');
  const sort: any = {};
  sort[sortField] = sortOrder === 'desc' ? -1 : 1;

  const results = await Fine.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'profile.firstName profile.lastName email')
    .populate({
      path: 'loanId',
      populate: { path: 'copyId', populate: { path: 'bookId', select: 'title' } },
    });

  const totalResults = await Fine.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const payFine = async (fineId: string, paymentMethod: string) => {
  const fine = await Fine.findById(fineId);
  if (!fine) {
    throw new ApiError(404, 'Fine not found');
  }
  if (fine.status === 'paid') {
    throw new ApiError(400, 'Fine already paid');
  }

  fine.status = 'paid';
  fine.paymentDate = new Date();
  fine.paymentMethod = paymentMethod;
  await fine.save();

  return fine;
};

export default {
  createFine,
  getFinesByUser,
  getAllFines,
  payFine,
};
