import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./modules/user/user.model";
import Category from "./modules/book/category.model";
import Book from "./modules/book/book.model";
import Copy from "./modules/book/copy.model";
import Loan from "./modules/loan/loan.model";
import Fine from "./modules/fine/fine.model";
import Notification from "./modules/notification/notification.model";
import { logger } from "./common/utils/logger";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital-library";

const bookImages = [
  "https://images.unsplash.com/photo-1544640808-32ca72ac7f67?w=500&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
  "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&q=80",
  "https://images.unsplash.com/photo-1543003923-9992642ce441?w=500&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80",
];

const samplePdfs = [
  "https://res.cloudinary.com/demo/image/upload/multi_page_pdf.pdf",
  "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
];

const bookTitles = [
  "Bắt trẻ đồng xanh", "Nhà giả kim", "1984", "Giết con chim nhại", "Kiêu hãnh và định kiến",
  "Trăm năm cô đơn", "Thái tử nhỏ", "Đại Gatsby", "Chúa tể những chiếc nhẫn", "Harry Potter",
  "Suối nguồn", "Tội ác và hình phạt", "Anh em nhà Karamazov", "Chiến tranh và hòa bình",
  "Ulysses", "Moby-Dick", "Don Quixote", "Hamlet", "Odyssey", "Thần khúc"
];

const authors = [
  "J.D. Salinger", "Paulo Coelho", "George Orwell", "Harper Lee", "Jane Austen",
  "Gabriel García Márquez", "Antoine de Saint-Exupéry", "F. Scott Fitzgerald",
  "J.R.R. Tolkien", "J.K. Rowling", "Ayn Rand", "Fyodor Dostoevsky", "Leo Tolstoy"
];

const departments = [
  "Khoa Công nghệ thông tin", "Khoa Toán - Tin", "Khoa Vật lý", "Khoa Hóa học",
  "Khoa Ngữ văn", "Khoa Lịch sử", "Khoa Địa lý", "Khoa Giáo dục tiểu học",
  "Khoa Tâm lý giáo dục", "Khoa Tiếng Anh"
];

const clearAndSeedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB for high-volume seeding");

    // Clear all data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      Copy.deleteMany({}),
      Loan.deleteMany({}),
      Fine.deleteMany({}),
      Notification.deleteMany({})
    ]);
    logger.info("Cleared all data from database");

    // 1. Seed Superadmin
    const superadmin = await User.create({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "password123",
      role: "superadmin",
      profile: { firstName: "System", lastName: "Administrator" },
      isEmailVerified: true,
    });
    logger.info("Superadmin created");

    // 2. Seed 500 Students
    const studentData = [];
    for (let i = 1; i <= 500; i++) {
      studentData.push({
        email: `student${i}@example.com`,
        password: "password123",
        role: "student",
        profile: {
          firstName: `Sinh viên ${i}`,
          lastName: "Nguyễn Văn",
          studentId: `7051010${i.toString().padStart(3, "0")}`,
          department: departments[i % departments.length],
        },
        isEmailVerified: true,
      });
    }
    const users = await User.insertMany(studentData);
    logger.info("500 students seeded");

    // 3. Seed 20 Categories
    const categoryNames = [
      "Giáo dục", "Toán học", "CNTT", "Văn học", "Khoa học", "Triết học", "Lịch sử", "Địa lý", 
      "Kinh tế", "Nghệ thuật", "Y học", "Ngoại ngữ", "Kỹ năng mềm", "Tâm lý học", "Tôn giáo", 
      "Chính trị", "Pháp luật", "Thể thao", "Nấu ăn", "Du lịch"
    ];
    const categoryDocs = await Category.insertMany(categoryNames.map(name => ({
      name, description: `Tài liệu thuộc lĩnh vực ${name}`
    })));
    logger.info("20 categories seeded");

    // 4. Seed 5000 Books & 15,000 Copies
    const BATCH_SIZE = 500;
    const totalBooks = 5000;
    const allBooks = [];

    for (let i = 0; i < totalBooks; i += BATCH_SIZE) {
      const bookBatch = [];
      const currentBatchSize = Math.min(BATCH_SIZE, totalBooks - i);

      for (let j = 0; j < currentBatchSize; j++) {
        const id = i + j;
        const title = bookTitles[id % bookTitles.length] + ` (Vol ${Math.floor(id / bookTitles.length) + 1})`;
        const isbn = `978-${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`;
        
        bookBatch.push({
          title,
          author: authors[id % authors.length],
          isbn,
          category: categoryDocs[id % categoryDocs.length]._id,
          description: `Detailed description for "${title}". Essential reading for students.`,
          coverImage: bookImages[id % bookImages.length],
          documentUrl: id < 1000 ? samplePdfs[id % samplePdfs.length] : undefined,
          documentPublicId: id < 1000 ? `seed-pdf-${id}` : undefined,
          publishedYear: 2005 + Math.floor(Math.random() * 20),
        });
      }
      
      const insertedBooks = await Book.insertMany(bookBatch);
      allBooks.push(...insertedBooks);

      // Create copies for this batch
      const copyBatch = [];
      for (const book of insertedBooks) {
        for (let k = 1; k <= 3; k++) {
          copyBatch.push({
            bookId: book._id,
            barcode: `BC-${book.isbn}-${k}`,
            status: "available",
            location: `Zone ${String.fromCharCode(65 + (allBooks.length % 10))}-${k}`,
          });
        }
      }
      await Copy.insertMany(copyBatch);
      logger.info(`Processed ${allBooks.length}/${totalBooks} books...`);
    }
    logger.info("5000 books and 15,000 copies created");

    // 5. Seed 2500 Loans
    const allCopies = await Copy.find({}).limit(3000); // Sample some copies
    const loanData = [];
    const now = new Date();

    for (let i = 0; i < 2500; i++) {
      const user = users[i % users.length];
      const copy = allCopies[i % allCopies.length];
      const status = i < 200 ? "pending" : i < 800 ? "active" : i < 1200 ? "overdue" : "returned";

      const borrowDate = new Date();
      borrowDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
      borrowDate.setDate(Math.floor(Math.random() * 28) + 1);

      const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      let returnDate = status === "returned" ? new Date(dueDate.getTime() + (Math.random() > 0.5 ? -2 : 5) * 24 * 60 * 60 * 1000) : undefined;

      loanData.push({
        userId: user._id,
        copyId: copy._id,
        borrowDate,
        dueDate,
        returnDate,
        status,
        createdAt: borrowDate,
      });

      // Update copy status for active/overdue in DB later or manually
    }
    const seededLoans = await Loan.insertMany(loanData);
    
    // Sync copy statuses for non-returned loans
    const loansToUpdate = seededLoans.filter(l => l.status !== 'returned');
    for (const loan of loansToUpdate) {
        await Copy.findByIdAndUpdate(loan.copyId, { 
            status: loan.status === 'pending' ? 'reserved' : 'borrowed' 
        });
    }
    logger.info("2500 loans seeded and copy statuses synced");

    // 6. Seed 200 Fines
    const overdueLoans = seededLoans.filter(l => l.status === 'overdue' || (l.status === 'returned' && l.returnDate! > l.dueDate)).slice(0, 200);
    const fineData = overdueLoans.map((loan, idx) => {
        const daysLate = Math.ceil(( (loan.returnDate || now).getTime() - loan.dueDate.getTime()) / (1000 * 3600 * 24));
        const overdueDays = Math.max(daysLate, 1);
        return {
            userId: loan.userId,
            loanId: loan._id,
            amount: overdueDays * 5000,
            reason: "Trả sách muộn",
            overdueDays,
            status: idx < 50 ? "paid" : "pending",
            createdAt: loan.dueDate
        };
    });
    await Fine.insertMany(fineData);
    logger.info("200 fines seeded");

    logger.info("HIGH-VOLUME SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    logger.error("Error during high-volume seeding:", error);
    process.exit(1);
  }
};

clearAndSeedData();
