import { Document, Model, Types } from "mongoose";

export interface ILoan {
  userId: Types.ObjectId;
  copyId?: Types.ObjectId | null; // ← optional
  bookId?: Types.ObjectId | null; // ← thêm mới
  loanType?: "physical" | "ebook"; // ← thêm mới
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  reminderSent?: boolean;
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
