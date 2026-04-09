import mongoose, { Schema } from 'mongoose';
import { IBook, IBookModel } from './book.interface';

const bookSchema = new Schema<IBook, IBookModel>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, trim: true },
    coverImage: { type: String },
    publisher: { type: String },
    publishedYear: { type: Number },
    documentUrl: { type: String },
    documentPublicId: { type: String },
    coverPublicId: { type: String },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model<IBook, IBookModel>('Book', bookSchema);

export default Book;
