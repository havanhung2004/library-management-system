import { Document, Model, Types } from "mongoose";

export interface IBook {
  title: string;
  author: string;
  isbn: string;
  category: Types.ObjectId;
  description?: string;
  coverImage?: string;
  publisher?: string;
  publishedYear?: number;
  documentUrl?: string;
  documentPublicId?: string;
  previewUrl?: string;
  previewPublicId?: string;
  coverPublicId?: string;
}

export interface IBookDoc extends IBook, Document {}

export interface IBookModel extends Model<IBookDoc> {}

export interface ICategory {
  name: string;
  description?: string;
}

export interface ICategoryDoc extends ICategory, Document {}

export interface ICopy {
  bookId: Types.ObjectId;
  status: "available" | "borrowed" | "reserved" | "lost" | "damaged";
  barcode: string;
  location?: string;
}

export interface ICopyDoc extends ICopy, Document {}

export interface IDocument {
  fileUrl: string;
  fileType: "pdf" | "epub" | "mobi";
  fileSize?: number;
  publicId?: string;
  isDownloadable?: boolean;
}

export interface IDocumentDoc extends IDocument, Document {}
