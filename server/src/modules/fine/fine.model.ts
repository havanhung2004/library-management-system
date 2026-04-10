import mongoose, { Schema } from 'mongoose';
import { IFineDoc, IFineModel } from './fine.interface';

const fineSchema = new Schema<IFineDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    overdueDays: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
  },
  {
    timestamps: true,
  }
);

const Fine = mongoose.model<IFineDoc, IFineModel>('Fine', fineSchema);

export default Fine;
