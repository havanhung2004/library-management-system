import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./modules/user/user.model";
import Category from "./modules/book/category.model";
import Book from "./modules/book/book.model";
import Copy from "./modules/book/copy.model";
import Loan from "./modules/loan/loan.model";
import Fine from "./modules/fine/fine.model";
import Notification from "./modules/notification/notification.model";
import { logger } from "./common/utils/logger";

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital-library";

const bookImages = [
  "https://images.unsplash.com/photo-1544640808-32ca72ac7f67?w=500&q=80", // Book 1
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80", // Book 2
  "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&q=80", // Book 3
  "https://images.unsplash.com/photo-1543003923-9992642ce441?w=500&q=80", // Book 4
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80", // Book 5
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80", // Book 6
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80", // Book 7
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80", // Book 8
];

const bookTitles = [
  "Bắt trẻ đồng xanh",
  "Nhà giả kim",
  "1984",
  "Giết con chim nhại",
  "Kiêu hãnh và định kiến",
  "Trăm năm cô đơn",
  "Thái tử nhỏ",
  "Đại Gatsby",
  "Chúa tể những chiếc nhẫn",
  "Harry Potter",
  "Suối nguồn",
  "Tội ác và hình phạt",
  "Anh em nhà Karamazov",
  "Chiến tranh và hòa bình",
  "Ulysses",
  "Moby-Dick",
  "Don Quixote",
  "Hamlet",
  "Odyssey",
  "Thần khúc",
  "Những người khốn khổ",
  "Kafka bên bờ biển",
  "Rừng Na Uy",
  "Biên niên ký chim vặn dây cót",
  "Phía sau nghi can X",
  "Nỗi buồn chiến tranh",
  "Số đỏ",
  "Tắt đèn",
  "Chí Phèo",
  "Lão Hạc",
  "Vợ nhặt",
  "Đất rừng phương Nam",
  "Dế Mèn phiêu lưu ký",
  "Tuổi thơ dữ dội",
  "Kính vạn hoa",
  "Cho tôi xin một vé đi tuổi thơ",
  "Tôi thấy hoa vàng trên cỏ xanh",
  "Mắt biếc",
  "Bảy bước tới mùa hè",
  "Lá nằm trong lá",
  "Lập trình hướng đối tượng",
  "Cấu trúc dữ liệu và giải thuật",
  "Hệ điều hành",
  "Mạng máy tính",
  "Trí tuệ nhân tạo",
  "Học máy",
  "Kỹ thuật phần mềm",
  "Thiết kế hệ thống",
  "Cơ sở dữ liệu",
  "Phát triển ứng dụng di động",
  "Lập trình Web",
  "An toàn thông tin",
  "Điện toán đám mây",
  "Big Data",
  "Blockchain",
  "Internet of Things",
  "Lập trình Python",
  "Lập trình Java",
  "Lập trình C++",
  "Toán rời rạc",
  "Đại số tuyến tính",
  "Giải tích 1",
  "Giải tích 2",
  "Xác suất thống kê",
  "Lý thuyết đồ thị",
  "Tối ưu hóa",
  "Vật lý đại cương",
  "Hóa học đại cương",
  "Sinh học đại cương",
  "Tâm lý học giáo dục",
  "Giáo dục học đại cương",
  "Lịch sử giáo dục Việt Nam",
  "Triết học giáo dục",
  "Phương pháp nghiên cứu khoa học",
  "Quản lý giáo dục",
  "Đo lường và đánh giá",
  "Tham vấn học đường",
  "Kỹ năng sư phạm",
  "Ứng dụng CNTT trong dạy học",
  "Xây dựng chương trình học",
  "Lịch sử Việt Nam",
  "Lịch sử Thế giới",
  "Địa lý Việt Nam",
  "Địa lý Thế giới",
  "Kinh tế học đại cương",
  "Quản trị kinh doanh",
  "Marketing căn bản",
  "Tài chính doanh nghiệp",
  "Kế toán tài chính",
  "Luật dân sự",
  "Luật hình sự",
  "Tiếng Anh cơ bản",
  "Tiếng Anh giao tiếp",
  "IELTS Masterclass",
  "TOEIC Preparation",
  "Ngữ pháp tiếng Anh",
  "Từ vựng tiếng Anh",
  "Tiếng Việt thực hành",
  "Cơ sở văn hóa Việt Nam",
];

const authors = [
  "J.D. Salinger",
  "Paulo Coelho",
  "George Orwell",
  "Harper Lee",
  "Jane Austen",
  "Gabriel García Márquez",
  "Antoine de Saint-Exupéry",
  "F. Scott Fitzgerald",
  "J.R.R. Tolkien",
  "J.K. Rowling",
  "Ayn Rand",
  "Fyodor Dostoevsky",
  "Leo Tolstoy",
  "James Joyce",
  "Herman Melville",
  "Miguel de Cervantes",
  "William Shakespeare",
  "Homer",
  "Dante Alighieri",
  "Victor Hugo",
  "Haruki Murakami",
  "Keigo Higashino",
  "Bảo Ninh",
  "Vũ Trọng Phụng",
  "Ngô Tất Tố",
  "Nam Cao",
  "Kim Lân",
  "Đoàn Giỏi",
  "Tô Hoài",
  "Phùng Quán",
  "Nguyễn Nhật Ánh",
];

const clearAndSeedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB");

    // Clear all data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Book.deleteMany({});
    await Copy.deleteMany({});
    await Loan.deleteMany({});
    await Fine.deleteMany({});
    await Notification.deleteMany({});
    logger.info("Cleared all data from database");

    // 1. Seed Superadmin
    const superadmin = await User.create({
      email: "admin@example.com",
      password: "password123",
      role: "superadmin",
      profile: {
        firstName: "System",
        lastName: "Administrator",
      },
      isEmailVerified: true,
    });
    logger.info("Superadmin created");

    // 2. Seed 50 Users
    const users = [];
    for (let i = 1; i <= 50; i++) {
      const user = await User.create({
        email: `student${i}@example.com`,
        password: "password123",
        role: "student",
        profile: {
          firstName: `Sinh viên ${i}`,
          lastName: "Nguyễn Văn",
          studentId: `7051010${i.toString().padStart(2, "0")}`,
          department: "Khoa Công nghệ thông tin",
        },
        isEmailVerified: true,
      });
      users.push(user);
    }
    logger.info("50 users created");

    // 3. Seed Categories
    const categoriesData = [
      { name: "Giáo dục", description: "Tài liệu sư phạm" },
      { name: "Toán học", description: "Giáo trình toán" },
      { name: "CNTT", description: "Công nghệ thông tin" },
      { name: "Văn học", description: "Văn học Việt Nam & Thế giới" },
      { name: "Khoa học", description: "Khoa học tự nhiên & xã hội" },
    ];
    const categories = await Category.insertMany(categoriesData);
    logger.info("Categories seeded");

    // 4. Seed 100 Books
    const books = [];
    for (let i = 0; i < 100; i++) {
      const title =
        bookTitles[i % bookTitles.length] +
        (i >= bookTitles.length
          ? ` (Tập ${Math.floor(i / bookTitles.length) + 1})`
          : "");
      const author = authors[i % authors.length];
      const isbn = `978-${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`;
      const category = categories[i % categories.length];
      const image = bookImages[Math.floor(Math.random() * bookImages.length)];

      const book = await Book.create({
        title,
        author,
        isbn,
        category: category._id,
        description: `Mô tả cho cuốn sách ${title}. Đây là một cuốn sách rất hay và bổ ích cho sinh viên.`,
        coverImage: image,
        publishedYear: 2010 + Math.floor(Math.random() * 15),
      });
      books.push(book);

      // Create 3 copies per book
      for (let j = 1; j <= 3; j++) {
        await Copy.create({
          bookId: book._id,
          barcode: `BC-${isbn}-${j}`,
          status: "available",
          location: `Kệ ${String.fromCharCode(65 + (i % 5))}${j}`,
        });
      }
    }
    logger.info("100 books created with 3 copies each");

    // 5. Seed 200 Loans
    const allCopies = await Copy.find({});
    const statuses = ["returned", "active", "overdue", "pending"];
    const now = new Date();

    for (let i = 0; i < 200; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const copy = allCopies[i % allCopies.length];
      const status =
        i < 10
          ? "pending"
          : i < 50
            ? "active"
            : i < 70
              ? "overdue"
              : "returned";

      // Random date in the last 6 months
      const borrowDate = new Date();
      borrowDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
      borrowDate.setDate(Math.floor(Math.random() * 28) + 1);

      const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      let returnDate = undefined;
      if (status === "returned") {
        returnDate = new Date(
          borrowDate.getTime() +
            (Math.floor(Math.random() * 18) + 1) * 24 * 60 * 60 * 1000,
        );
      }

      await Loan.create({
        userId: user._id,
        copyId: copy._id,
        borrowDate,
        dueDate,
        returnDate,
        status,
        createdAt: borrowDate,
      });

      // Update copy status if active or overdue
      if (status === "active" || status === "overdue") {
        copy.status = "borrowed";
        await copy.save();
      } else if (status === "pending") {
        copy.status = "reserved";
        await copy.save();
      }
    }
    logger.info("200 loans seeded");

    logger.info("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding data:", error);
    process.exit(1);
  }
};

clearAndSeedData();

