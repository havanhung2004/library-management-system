import Book from "./book.model";
import Copy from "./copy.model";
import Loan from "../loan/loan.model";
import { IBook, IDocument } from "./book.interface";
import { ApiError } from "../../common/utils/ApiError";
import { deleteFromCloudinary } from "../../common/utils/cloudinary";

const createBook = async (bookBody: IBook) => {
  if (await Book.findOne({ isbn: bookBody.isbn })) {
    throw new ApiError(400, "ISBN already exists");
  }
  return Book.create(bookBody);
};

const queryBooks = async (filter: any, options: any) => {
  const { limit = 10, page = 1, sortBy = "createdAt:desc" } = options;
  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sortBy.split(":");
  const sort: any = {};
  sort[sortField] = sortOrder === "desc" ? -1 : 1;

  const books = await Book.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("category", "name");

  console.log("1. Books:", books.length);

  const booksWithCopies = await Promise.all(
    books.map(async (book) => {
      console.log("2. Processing:", book.title);

      const totalCopies = await Copy.countDocuments({
        bookId: book._id,
      });

      console.log("3. Total:", totalCopies);

      const availableCopies = await Copy.countDocuments({
        bookId: book._id,
        status: "available",
      });

      console.log("4. Available:", availableCopies);

      return {
        ...book.toObject(),
        totalCopies,
        availableCopies,
      };
    }),
  );

  console.log("5. Done");

  const totalResults = await Book.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: booksWithCopies,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getBookById = async (id: string) => {
  return Book.findById(id).populate("category", "name");
};

const updateBookById = async (bookId: string, updateBody: Partial<IBook>) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }
  Object.assign(book, updateBody);
  await book.save();
  return book;
};

const deleteBookById = async (bookId: string) => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  // Kiểm tra sách có đang được mượn hay không
  const copies = await Copy.find({ bookId: book._id });
  const copyIds = copies.map((copy) => copy._id);

  const activeLoan = await Loan.findOne({
    copyId: { $in: copyIds },
    status: { $in: ["pending", "active", "overdue", "renewed"] },
  });

  if (activeLoan) {
    throw new ApiError(400, "Không thể xóa sách vì sách đang được mượn.");
  }

  if (book.documentPublicId) {
    try {
      await deleteFromCloudinary(book.documentPublicId);
    } catch (error) {
      console.error(
        "Failed to delete book doc from Cloudinary during book deletion:",
        error,
      );
    }
  }
  if (book.coverPublicId) {
    try {
      await deleteFromCloudinary(book.coverPublicId);
    } catch (error) {
      console.error(
        "Failed to delete book cover from Cloudinary during book deletion:",
        error,
      );
    }
  }

  await Copy.deleteMany({ bookId: book._id });
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
