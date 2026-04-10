import { Request, Response } from 'express';
import path from 'path';
import { catchAsync } from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import bookService from './book.service';
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
  const { title, author, category, q, limit = 9, page = 1, sortBy } = req.query;
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

export default {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  uploadDocument,
  uploadCover,
};
