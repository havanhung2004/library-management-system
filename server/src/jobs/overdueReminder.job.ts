import cron from "node-cron";
import Loan from "../modules/loan/loan.model";
import Notification from "../modules/notification/notification.model";
import User from "../modules/user/user.model";
import { sendOverdueEmail } from "../common/utils/email";

let isOverdueJobRunning = false;
let isReminderJobRunning = false;
export const startOverdueStatusJob = () => {
  cron.schedule("0 * * * *", async () => {
    if (isOverdueJobRunning) return;

    isOverdueJobRunning = true;

    try {
      console.log("Checking overdue status...");

      const result = await Loan.updateMany(
        {
          status: "active",
          dueDate: { $lt: new Date() },
        },
        {
          $set: { status: "overdue" },
        },
      );

      console.log(`Updated ${result.modifiedCount} loans to overdue.`);
    } catch (error) {
      console.error("Overdue status job error:", error);
    } finally {
      isOverdueJobRunning = false;
    }
  });
};

export const startOverdueReminderJob = () => {
  cron.schedule("10 * * * *", async () => {
    if (isReminderJobRunning) return;

    isReminderJobRunning = true;

    try {
      console.log("Sending overdue reminders...");

      const overdueLoans = await Loan.find({
        status: "overdue",
        reminderSent: false,
      })
        .populate("bookId")
        .populate({
          path: "copyId",
          populate: { path: "bookId" },
        });

      console.log(`Found ${overdueLoans.length} overdue loans`);

      for (const loan of overdueLoans) {
        try {
          const user = await User.findById(loan.userId);
          if (!user?.email) continue;

          let title = "Tài liệu không xác định";

          if (loan.loanType === "ebook") {
            title = (loan.bookId as any)?.title || title;
          } else {
            title = (loan.copyId as any)?.bookId?.title || title;
          }

          await sendOverdueEmail({
            email: user.email,
            title,
            loanType: loan.loanType || "physical",
            dueDate: loan.dueDate,
          });

          await Notification.create({
            userId: loan.userId,
            type: "OVERDUE_BOOK",
            message:
              "Bạn có tài liệu đã quá hạn. Vui lòng xử lý để tránh phí phạt.",
          });

          loan.reminderSent = true;
          await loan.save();
        } catch (error) {
          console.error(`Reminder error for loan ${loan._id}:`, error);
        }
      }
    } catch (error) {
      console.error("Reminder job error:", error);
    } finally {
      isReminderJobRunning = false;
    }
  });
};
