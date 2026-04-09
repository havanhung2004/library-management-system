import Book from './book.model';
import { IBook, IDocument } from './book.interface';
import { ApiError } from '../../common/utils/ApiError';
import { deleteFromCloudinary } from '../../common/utils/cloudinary';

const createBook = async (bookBody: IBook) => {
  if (await Book.findOne({ isbn: bookBody.isbn })) {
    throw new ApiError(400, 'ISBN already exists');
  }
  return Book.create(bookBody);
};

const queryBooks = async (filter: any, options: any) => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sortBy.split(':');
  const sort: any = {};
  sort[sortField] = sortOrder === 'desc' ? -1 : 1;

  const books = await Book.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .limit(limit)
    .populate('category', 'name');

  const totalResults = await Book.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: books,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getBookById = async (id: string) => {
  return Book.findById(id).populate('category', 'name');
};

const updateBookById = async (bookId: string, updateBody: Partial<IBook>) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  Object.assign(book, updateBody);
  await book.save();
  return book;
};

const deleteBookById = async (bookId: string) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  // Delete associated document from Cloudinary if exists
  if (book.documentPublicId) {
    try {
      await deleteFromCloudinary(book.documentPublicId);
    } catch (error) {
      console.error('Failed to delete book doc from Cloudinary during book deletion:', error);
    }
  }

  // Delete associated cover image from Cloudinary if exists
  if (book.coverPublicId) {
    try {
      await deleteFromCloudinary(book.coverPublicId);
    } catch (error) {
      console.error('Failed to delete book cover from Cloudinary during book deletion:', error);
    }
  }

  await book.deleteOne();
  return book;
};

export default {
  createBook,
  queryBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
