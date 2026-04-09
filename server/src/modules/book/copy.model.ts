import mongoose, { Schema } from 'mongoose';
import { ICopy, ICopyDoc } from './book.interface';

const copySchema = new Schema<ICopyDoc>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    status: {
      type: String,
      enum: ['available', 'borrowed', 'lost', 'damaged'],
      default: 'available',
    },
    barcode: { type: String, required: true, unique: true, trim: true },
    location: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Copy = mongoose.model<ICopyDoc>('Copy', copySchema);

export default Copy;
