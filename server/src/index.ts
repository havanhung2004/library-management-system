import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import { logger } from "./common/utils/logger";
import { seedAdmin } from "./common/config/seed";
import { startOverdueReminderJob } from "./jobs/overdueReminder.job";
import { startOverdueStatusJob } from "./jobs/overdueReminder.job";
const port = process.env.PORT || 5000;
const mongodb_uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hnue-digital-library";

mongoose
  .connect(mongodb_uri)
  .then(async () => {
    logger.info("Connected to MongoDB");
    await seedAdmin();
    startOverdueStatusJob();
    startOverdueReminderJob();
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    logger.error("Could not connect to MongoDB", err);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection: ", err);
  process.exit(1);
});
