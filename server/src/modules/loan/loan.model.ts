import mongoose, { Schema } from "mongoose";
import { ILoan, ILoanDoc } from "./loan.interface";

const loanSchema = new Schema<ILoanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    copyId: { type: Schema.Types.ObjectId, ref: "Copy", required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "returned", "overdue", "renewed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Loan = mongoose.model<ILoanDoc>("Loan", loanSchema);

export default Loan;

