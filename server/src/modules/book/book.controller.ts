import { Request, Response } from 'express';
import path from 'path';
import axios from 'axios';
import { catchAsync } from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import bookService from './book.service';
import loanService from '../loan/loan.service';
import { deleteFromCloudinary, uploadToCloudinary } from '../../common/utils/cloudinary';

const createBook = catchAsync(async (req: Request, res: Response) => {
  const book = await bookService.createBook(req.body);
  res.status(201).send({
    success: true,
    data: book,
    message: 'Book created successfully',
  });
});

const getBooks = catchAsync(async (req: Request, res: Response) => {
  const { title, author, category, format, q, limit = 9, page = 1, sortBy } = req.query;
  const filter: any = {};
  
  if (q) {
    const regex = { $regex: q, $options: 'i' };
    filter.$or = [
      { title: regex },
      { author: regex },
      { isbn: regex }
    ];
  } else {
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
  }
  
  if (category) {
    filter.category = category;
  }

  if (format === 'ebook') {
    filter.documentUrl = { $exists: true, $ne: null };
  } else if (format === 'physical') {
    // For now, assume physical is just any book that isn't EXCLUSIVELY an ebook 
    // (though in this system, they all have physical copies)
  }

  const options = {
    sortBy: sortBy || 'createdAt:desc',
    limit: Number(limit),
    page: Number(page),
  };
  const result = await bookService.queryBooks(filter, options);
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

const getBook = catchAsync(async (req: Request, res: Response) => {
  const book = await bookService.getBookById(req.params.bookId);
  if (!book) {
    res.status(404).send({ success: false, message: 'Book not found' });
    return;
  }
  res.send({
    success: true,
    data: book,
  });
});

const updateBook = catchAsync(async (req: Request, res: Response) => {
  const book = await bookService.updateBookById(req.params.bookId, req.body);
  res.send({
    success: true,
    data: book,
    message: 'Book updated successfully',
  });
});

const deleteBook = catchAsync(async (req: Request, res: Response) => {
  await bookService.deleteBookById(req.params.bookId);
  res.send({
    success: true,
    message: 'Book deleted successfully',
  });
});

const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('Please upload a file');
  }

  // Check if book already has a document and delete it from Cloudinary
  const book = await bookService.getBookById(req.params.bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  if (book.documentPublicId) {
    try {
      await deleteFromCloudinary(book.documentPublicId);
    } catch (error) {
      console.error('Failed to delete old document from Cloudinary during replacement:', error);
    }
  }

  // Extract filename without extension and sanitize it
  const fileName = path.parse(req.file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, 'digital-library/documents', fileName);

  const updatedBook = await bookService.updateBookById(req.params.bookId, {
    documentUrl: result.secure_url,
    documentPublicId: result.public_id,
  });

  res.status(200).send({
    success: true,
    data: updatedBook,
    message: 'Document uploaded and linked to book successfully',
  });
});

const uploadCover = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('Please upload an image');
  }

  // Check if book exists
  const book = await bookService.getBookById(req.params.bookId);
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  // Delete old cover from Cloudinary if exists
  if (book.coverPublicId) {
    try {
      await deleteFromCloudinary(book.coverPublicId);
    } catch (error) {
      console.error('Failed to delete old cover image from Cloudinary:', error);
    }
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, 'digital-library/covers');

  const updatedBook = await bookService.updateBookById(req.params.bookId, {
    coverImage: result.secure_url,
    coverPublicId: result.public_id,
  });

  res.status(200).send({
    success: true,
    data: updatedBook,
    message: 'Cover image uploaded successfully',
  });
});

const getBookDocument = catchAsync(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = (req as any).user.id;

  const canAccess = await loanService.hasActiveLoan(userId, bookId);
  
  if (!canAccess) {
    throw new ApiError(403, 'Bạn không có quyền truy cập tài liệu này. Vui lòng mượn sách trước.');
  }

  const book = await bookService.getBookById(bookId);
  if (!book || !book.documentUrl) {
    throw new ApiError(404, 'Tài liệu không tồn tại cho cuốn sách này.');
  }

  try {
    const response = await axios({
      method: 'GET',
      url: book.documentUrl,
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=document.pdf');

    response.data.pipe(res);
  } catch (error) {
    throw new ApiError(500, 'Không thể tải tài liệu từ nguồn lưu trữ.');
  }
});

export default {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  uploadDocument,
  uploadCover,
  getBookDocument,
};
