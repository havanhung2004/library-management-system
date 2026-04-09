import Copy from './copy.model';
import { ICopyDoc } from './book.interface';
import { ApiError } from '../../common/utils/ApiError';

const createCopy = async (bookId: string, copyData: any): Promise<ICopyDoc> => {
  const existingCopy = await Copy.findOne({ barcode: copyData.barcode });
  if (existingCopy) {
    throw new ApiError(400, 'Mã vạch (barcode) đã tồn tại trong hệ thống');
  }
  return Copy.create({ ...copyData, bookId });
};

const getCopiesByBookId = async (bookId: string): Promise<ICopyDoc[]> => {
  return Copy.find({ bookId }).sort({ createdAt: -1 });
};

const updateCopyById = async (copyId: string, updateBody: any): Promise<ICopyDoc | null> => {
  const copy = await Copy.findById(copyId);
  if (!copy) {
    throw new ApiError(404, 'Không tìm thấy bản sao');
  }
  Object.assign(copy, updateBody);
  await copy.save();
  return copy;
};

const deleteCopyById = async (copyId: string): Promise<void> => {
  const copy = await Copy.findById(copyId);
  if (!copy) {
    throw new ApiError(404, 'Không tìm thấy bản sao');
  }
  await copy.deleteOne();
};

export default {
  createCopy,
  getCopiesByBookId,
  updateCopyById,
  deleteCopyById,
};
