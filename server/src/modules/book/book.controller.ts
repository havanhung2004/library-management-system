import { Request, Response } from "express";
import path from "path";
import axios from "axios";
import { catchAsync } from "../../common/utils/catchAsync";
import { ApiError } from "../../common/utils/ApiError";
import bookService from "./book.service";
import loanService from "../loan/loan.service";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../common/utils/cloudinary";
import { Readable } from "stream";
const createBook = catchAsync(async (req: Request, res: Response) => {
  const book = await bookService.createBook(req.body);
  res.status(201).send({
    success: true,
    data: book,
    message: "Book created successfully",
  });
});

const getBooks = catchAsync(async (req: Request, res: Response) => {
  const {
    title,
    author,
    category,
    format,
    q,
    limit = 9,
    page = 1,
    sortBy,
  } = req.query;
  const filter: any = {};

  if (q) {
    const regex = { $regex: q, $options: "i" };
    filter.$or = [{ title: regex }, { author: regex }, { isbn: regex }];
  } else {
    if (title) filter.title = { $regex: title, $options: "i" };
    if (author) filter.author = { $regex: author, $options: "i" };
  }

  if (category) {
    filter.category = category;
  }

  if (format === "ebook") {
    filter.documentUrl = { $exists: true, $ne: null };
  } else if (format === "physical") {
    filter.documentUrl = { $exists: false };
  }

  const options = {
    sortBy: sortBy || "createdAt:desc",
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
    res.status(404).send({ success: false, message: "Book not found" });
    return;
  }

  const Copy = (await import("./copy.model")).default;
  const totalCopies = await Copy.countDocuments({ bookId: book._id });
  const availableCopies = await Copy.countDocuments({
    bookId: book._id,
    status: "available",
  });

  res.send({
    success: true,
    data: {
      ...book.toObject(),
      totalCopies,
      availableCopies,
    },
  });
});

const updateBook = catchAsync(async (req: Request, res: Response) => {
  const book = await bookService.updateBookById(req.params.bookId, req.body);
  res.send({
    success: true,
    data: book,
    message: "Book updated successfully",
  });
});

const deleteBook = catchAsync(async (req: Request, res: Response) => {
  await bookService.deleteBookById(req.params.bookId);
  res.send({
    success: true,
    message: "Book deleted successfully",
  });
});

const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error("Please upload a file");
    }

    console.log("File name:", req.file.originalname);
    console.log("File size:", req.file.size);

    const book = await bookService.getBookById(req.params.bookId);

    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    const fileName = path
      .parse(req.file.originalname)
      .name.replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    console.log("Uploading to Cloudinary...");

    const result = await uploadToCloudinary(
      req.file.buffer,
      "digital-library/documents",
      fileName,
    );

    console.log("Cloudinary success:", result.secure_url);

    const updatedBook = await bookService.updateBookById(req.params.bookId, {
      documentUrl: result.secure_url,
      documentPublicId: result.public_id,
    });

    res.status(200).send({
      success: true,
      data: updatedBook,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    throw error;
  }
});
const uploadCover = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error("Please upload an image");
  }

  const book = await bookService.getBookById(req.params.bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }
  if (book.coverPublicId) {
    try {
      await deleteFromCloudinary(book.coverPublicId);
    } catch (error) {
      console.error("Failed to delete old cover image from Cloudinary:", error);
    }
  }
  // Upload to Cloudinary
  const result = await uploadToCloudinary(
    req.file.buffer,
    "digital-library/covers",
  );

  const updatedBook = await bookService.updateBookById(req.params.bookId, {
    coverImage: result.secure_url,
    coverPublicId: result.public_id,
  });

  res.status(200).send({
    success: true,
    data: updatedBook,
    message: "Cover image uploaded successfully",
  });
});

const getBookDocument = catchAsync(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = (req as any).user.id;

  const book = await bookService.getBookById(bookId);

  if (!book || !book.documentUrl) {
    throw new ApiError(404, "Tài liệu không tồn tại.");
  }

  const fullAccess = await loanService.hasActiveEbookLoan(userId, bookId);

  const response = await axios({
    method: "GET",
    url: book.documentUrl,
    responseType: "stream",
  });

  res.setHeader("X-Full-Access", fullAccess ? "true" : "false");

  res.setHeader("Content-Type", "application/pdf");

  (response.data as Readable).pipe(res);
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
