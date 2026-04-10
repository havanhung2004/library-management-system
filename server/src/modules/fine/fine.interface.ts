import { Document, Model, Types } from 'mongoose';

export interface IFine {
  userId: Types.ObjectId;
  loanId: Types.ObjectId;
  amount: number;
  reason: string;
  status: 'pending' | 'paid';
  paymentDate?: Date;
  paymentMethod?: string;
  overdueDays: number;
}

export interface IFineDoc extends IFine, Document {}
export interface IFineModel extends Model<IFineDoc> {}
