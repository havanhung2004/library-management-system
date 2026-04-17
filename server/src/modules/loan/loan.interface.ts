import { Document, Model, Types } from "mongoose";

export interface ILoan {
  userId: Types.ObjectId;
  copyId: Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status:
    | "pending"
    | "active"
    | "rejected"
    | "returned"
    | "overdue"
    | "renewed";
}

export interface ILoanDoc extends ILoan, Document {}

export interface ILoanModel extends Model<ILoanDoc> {}

