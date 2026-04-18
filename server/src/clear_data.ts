import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./modules/user/user.model";
import Category from "./modules/book/category.model";
import Book from "./modules/book/book.model";
import Copy from "./modules/book/copy.model";
import Loan from "./modules/loan/loan.model";
import Fine from "./modules/fine/fine.model";
import Notification from "./modules/notification/notification.model";
import Token from "./modules/auth/token.model";
import { logger } from "./common/utils/logger";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital-library";

const clearData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB for data clearing");

    // Clear all data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      Copy.deleteMany({}),
      Loan.deleteMany({}),
      Fine.deleteMany({}),
      Notification.deleteMany({}),
      Token.deleteMany({})
    ]);

    logger.info("CLEARED ALL DATA FROM DATABASE SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    logger.error("Error during data clearing:", error);
    process.exit(1);
  }
};

clearData();
