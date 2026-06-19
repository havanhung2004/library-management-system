import mongoose, { Schema } from "mongoose";
import { ILoan, ILoanDoc } from "./loan.interface";

const loanSchema = new Schema<ILoanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    copyId: {
      type: Schema.Types.ObjectId,
      ref: "Copy",
      required: false,
      default: null,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: false,
      default: null,
    },
    loanType: {
      type: String,
      enum: ["physical", "ebook"],
      default: "physical",
    },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    reminderSent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "returned", "overdue", "renewed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Loan = mongoose.model<ILoanDoc>("Loan", loanSchema);
export default Loan;
