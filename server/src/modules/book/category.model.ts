import mongoose, { Schema } from 'mongoose';
import { ICategory, ICategoryDoc } from './book.interface';

const categorySchema = new Schema<ICategoryDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategoryDoc>('Category', categorySchema);

export default Category;
