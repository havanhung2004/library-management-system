import express from "express";
import auth from "../../common/middlewares/auth";
import validate from "../../common/middlewares/validate";
import loanValidation from "./loan.validation";
import loanController from "./loan.controller";

const router = express.Router();

router.post(
  "/borrow",
  auth(),
  validate(loanValidation.borrowBook),
  loanController.borrowBook,
);
router.post(
  "/approve/:loanId",
  auth("superadmin", "admin", "librarian"),
  validate(loanValidation.returnBook),
  loanController.approveLoan,
);
router.post(
  "/reject/:loanId",
  auth("superadmin", "admin", "librarian"),
  validate(loanValidation.returnBook),
  loanController.rejectLoan,
);
router.post(
  "/return/:loanId",
  auth(),
  validate(loanValidation.returnBook),
  loanController.returnBook,
);
router.get("/my-loans", auth(), loanController.getMyLoans);
router.get(
  "/",
  auth("superadmin", "admin", "librarian"),
  loanController.getAllLoans,
);

export default router;

