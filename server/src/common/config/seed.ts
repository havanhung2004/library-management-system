import User from '../../modules/user/user.model';
import Category from '../../modules/book/category.model';
import Book from '../../modules/book/book.model';
import Copy from '../../modules/book/copy.model';
import Loan from '../../modules/loan/loan.model';
import Fine from '../../modules/fine/fine.model';
import { logger } from '../utils/logger';

export const seedAdmin = async () => {
  // 1. Seed Superadmin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hnue.edu.vn';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
      },
      isEmailVerified: true,
    });
    logger.info(`Superadmin created: ${adminEmail}`);
  } else {
    adminExists.password = adminPassword;
    await adminExists.save();
    logger.info('Superadmin credentials synced');
  }

  // 2. Seed Categories
  const categories = [
    { name: 'Giáo dục', description: 'Các tài liệu về phương pháp giảng dạy và tâm lý học đường.' },
    { name: 'Toán học', description: 'Giáo trình đại số, giải tích và hình học.' },
    { name: 'Lịch sử', description: 'Tài liệu lịch sử Việt Nam và thế giới.' },
    { name: 'CNTT', description: 'Công nghệ thông tin, lập trình và trí tuệ nhân tạo.' },
    { name: 'Văn học', description: 'Các tác phẩm văn học kinh điển và phê bình.' },
    { name: 'Khoa học tự nhiên', description: 'Vật lý, hóa học, sinh học và các khoa học tự nhiên khác.' },
    { name: 'Ngoại ngữ', description: 'Giáo trình và tài liệu học tiếng Anh, tiếng Pháp, tiếng Trung.' },
    { name: 'Triết học', description: 'Triết học Mác-Lênin, triết học phương Đông và phương Tây.' },
  ];

  for (const cat of categories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
    }
  }
  logger.info('Categories seeded');

  // 3. Seed Books (20 books across different categories)
  const categoryDocs = await Category.find();
  if (categoryDocs.length > 0) {
    const getCatId = (name: string) => categoryDocs.find((c) => c.name === name)?._id;

    const books = [
      // --- Giáo dục (3 books) ---
      {
        title: 'Giáo trình Tâm lý học Sư phạm',
        author: 'Nguyễn Thị Hoa',
        isbn: '978-1234567890',
        category: getCatId('Giáo dục'),
        description: 'Tài liệu phục vụ giảng dạy ngành sư phạm, bao gồm tâm lý học lứa tuổi và phương pháp dạy học hiện đại.',
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2023,
      },
      {
        title: 'Phương pháp dạy học tích cực',
        author: 'Trần Văn Minh',
        isbn: '978-1234567891',
        category: getCatId('Giáo dục'),
        description: 'Hướng dẫn áp dụng các phương pháp dạy học lấy học sinh làm trung tâm trong giáo dục phổ thông.',
        coverImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2022,
      },
      {
        title: 'Quản lý lớp học hiệu quả',
        author: 'Phạm Thị Lan',
        isbn: '978-1234567892',
        category: getCatId('Giáo dục'),
        description: 'Các kỹ năng và chiến lược giúp giáo viên quản lý lớp học, tạo môi trường học tập tích cực.',
        coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2021,
      },
      // --- Toán học (3 books) ---
      {
        title: 'Đại số Tuyến tính nâng cao',
        author: 'Nguyễn Văn Toán',
        isbn: '978-0987654321',
        category: getCatId('Toán học'),
        description: 'Kiến thức chuyên sâu về không gian vectơ, ma trận và ứng dụng trong kỹ thuật.',
        coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2022,
      },
      {
        title: 'Giải tích Toán học',
        author: 'Lê Đình Hải',
        isbn: '978-0987654322',
        category: getCatId('Toán học'),
        description: 'Giáo trình giải tích toán học dành cho sinh viên đại học, bao gồm giới hạn, đạo hàm và tích phân.',
        coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2021,
      },
      {
        title: 'Xác suất và Thống kê',
        author: 'Vũ Thị Bình',
        isbn: '978-0987654323',
        category: getCatId('Toán học'),
        description: 'Lý thuyết xác suất, phân phối xác suất và các phương pháp thống kê ứng dụng.',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2023,
      },
      // --- Lịch sử (2 books) ---
      {
        title: 'Lịch sử Đảng Cộng sản Việt Nam',
        author: 'Lê Chính Trị',
        isbn: '978-5556667778',
        category: getCatId('Lịch sử'),
        description: 'Tài liệu nghiên cứu lịch sử chính trị Việt Nam từ khi thành lập Đảng đến nay.',
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2021,
      },
      {
        title: 'Lịch sử thế giới cận đại',
        author: 'Hoàng Quốc Việt',
        isbn: '978-5556667779',
        category: getCatId('Lịch sử'),
        description: 'Tổng quan lịch sử thế giới từ thế kỷ 18 đến đầu thế kỷ 20, tập trung vào các cuộc cách mạng lớn.',
        coverImage: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2020,
      },
      // --- CNTT (3 books) ---
      {
        title: 'Nhập môn Lập trình Python',
        author: 'Ngô Văn Kỳ',
        isbn: '978-3334445556',
        category: getCatId('CNTT'),
        description: 'Giáo trình lập trình Python từ cơ bản đến nâng cao, có bài tập thực hành.',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2023,
      },
      {
        title: 'Trí tuệ nhân tạo và Machine Learning',
        author: 'Đinh Thành Long',
        isbn: '978-3334445557',
        category: getCatId('CNTT'),
        description: 'Giới thiệu các thuật toán học máy cơ bản và ứng dụng trong xử lý ngôn ngữ tự nhiên, thị giác máy tính.',
        coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2024,
      },
      {
        title: 'Cơ sở dữ liệu và SQL',
        author: 'Trương Quang Hùng',
        isbn: '978-3334445558',
        category: getCatId('CNTT'),
        description: 'Thiết kế cơ sở dữ liệu quan hệ, ngôn ngữ SQL và tối ưu hóa truy vấn.',
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda7e4310d0b?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2022,
      },
      // --- Văn học (2 books) ---
      {
        title: 'Văn học Việt Nam hiện đại',
        author: 'Nguyễn Xuân Kính',
        isbn: '978-7778889990',
        category: getCatId('Văn học'),
        description: 'Phân tích và bình luận các tác phẩm văn học Việt Nam từ 1945 đến nay.',
        coverImage: 'https://images.unsplash.com/photo-1491841651911-c44b890b7b7e?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2021,
      },
      {
        title: 'Truyện Kiều - Bình chú và giải thích',
        author: 'Nguyễn Du (chú giải: Đào Duy Anh)',
        isbn: '978-7778889991',
        category: getCatId('Văn học'),
        description: 'Truyện Kiều với bình chú chi tiết giúp người đọc hiểu sâu tác phẩm kiệt tác của Nguyễn Du.',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2019,
      },
      // --- Khoa học tự nhiên (3 books) ---
      {
        title: 'Vật lý đại cương',
        author: 'Lương Duyên Bình',
        isbn: '978-1112223334',
        category: getCatId('Khoa học tự nhiên'),
        description: 'Giáo trình vật lý đại cương cho sinh viên các ngành kỹ thuật và khoa học tự nhiên.',
        coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2022,
      },
      {
        title: 'Hóa học hữu cơ',
        author: 'Ngô Thị Thuận',
        isbn: '978-1112223335',
        category: getCatId('Khoa học tự nhiên'),
        description: 'Lý thuyết và bài tập hóa học hữu cơ, phản ứng và cơ chế phản ứng.',
        coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2021,
      },
      {
        title: 'Sinh học phân tử',
        author: 'Trần Thị Thanh',
        isbn: '978-1112223336',
        category: getCatId('Khoa học tự nhiên'),
        description: 'Cơ sở sinh học phân tử: ADN, ARN, protein và ứng dụng công nghệ gen.',
        coverImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2023,
      },
      // --- Ngoại ngữ (2 books) ---
      {
        title: 'Tiếng Anh học thuật cho sinh viên',
        author: 'Nguyễn Phương Thảo',
        isbn: '978-4445556667',
        category: getCatId('Ngoại ngữ'),
        description: 'Kỹ năng đọc hiểu, viết luận và thuyết trình bằng tiếng Anh học thuật cho bậc đại học.',
        coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2023,
      },
      {
        title: 'Giáo trình tiếng Trung thương mại',
        author: 'Vương Minh',
        isbn: '978-4445556668',
        category: getCatId('Ngoại ngữ'),
        description: 'Tiếng Trung Quốc trong các lĩnh vực kinh doanh và thương mại quốc tế.',
        coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2022,
      },
      // --- Triết học (2 books) ---
      {
        title: 'Triết học Mác-Lênin',
        author: 'Hội đồng Lý luận Trung ương',
        isbn: '978-9990001112',
        category: getCatId('Triết học'),
        description: 'Giáo trình triết học Mác-Lênin dành cho bậc đại học, bao gồm chủ nghĩa duy vật biện chứng và lịch sử.',
        coverImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2022,
      },
      {
        title: 'Triết học phương Tây hiện đại',
        author: 'Bùi Văn Nam Sơn',
        isbn: '978-9990001113',
        category: getCatId('Triết học'),
        description: 'Khảo sát các trào lưu triết học phương Tây từ Kant đến thế kỷ 20: hiện tượng học, hiện sinh, phân tích.',
        coverImage: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=300',
        publishedYear: 2020,
      },
    ];

    let booksCreated = 0;
    for (const book of books) {
      const exists = await Book.findOne({ isbn: book.isbn });
      if (!exists) {
        const newBook = await Book.create(book);

        // Create 2 copies per book
        const barcodeBase = book.isbn.replace('978-', '').replace(/-/g, '');
        await Copy.create([
          {
            bookId: newBook._id,
            barcode: `BC-${barcodeBase}-01`,
            status: 'available',
            location: 'Kệ A1',
          },
          {
            bookId: newBook._id,
            barcode: `BC-${barcodeBase}-02`,
            status: 'available',
            location: 'Kệ A2',
          },
        ]);
        booksCreated++;
      }
    }

    if (booksCreated > 0) {
      logger.info(`Books seeded: ${booksCreated} books with 2 copies each`);
    } else {
      logger.info('Books seeded');
    }
  }

  // 4. Seed Fines for testing
  await seedFines();
};

const seedFines = async () => {
  const admin = await User.findOne({ role: 'superadmin' });
  if (!admin) return;

  // Seed for Admin
  await seedUserFines(admin, 'Admin');

  // Seed for Phạm Văn Điệp
  let diep = await User.findOne({ email: 'diep.pv@hnue.edu.vn' });
  if (!diep) {
    diep = await User.create({
      email: 'diep.pv@hnue.edu.vn',
      password: 'User@123',
      role: 'student',
      profile: {
        firstName: 'Điệp',
        lastName: 'Phạm Văn',
        studentId: '705101001',
        department: 'Khoa Công nghệ thông tin',
      },
      isEmailVerified: true,
    });
    logger.info('User Phạm Văn Điệp created');
  }
  await seedUserFines(diep, 'Phạm Văn Điệp');
  await seedLoansForTrends();

  logger.info('Library test data seeded successfully');
};

const seedLoansForTrends = async () => {
  const existingLoansCount = await Loan.countDocuments();
  if (existingLoansCount > 10) return; // Only seed if empty-ish

  const admin = await User.findOne({ role: 'superadmin' });
  const books = await Book.find().limit(10);
  if (!admin || books.length === 0) return;

  const now = new Date();
  const months = 6;
  const loansPerMonth = 8;

  logger.info('Seeding historical loans for trends...');

  for (let m = 0; m < months; m++) {
    const monthDate = new Date(now);
    monthDate.setMonth(now.getMonth() - m);

    for (let l = 0; l < loansPerMonth; l++) {
      const bookIndex = Math.floor(Math.random() * books.length);
      const copies = await Copy.find({ bookId: books[bookIndex]._id });
      if (copies.length === 0) continue;

      const loanDate = new Date(monthDate);
      loanDate.setDate(Math.floor(Math.random() * 28) + 1);

      await Loan.create({
        userId: admin._id,
        copyId: copies[0]._id,
        borrowDate: loanDate,
        dueDate: new Date(loanDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'returned',
        createdAt: loanDate, // Override for grouping
      });
    }
  }
  logger.info('Historical loans seeded successfully');
};

const seedUserFines = async (user: any, label: string) => {
  const existingFines = await Fine.countDocuments({ userId: user._id });
  if (existingFines > 0) {
    logger.info(`Fines for ${label} already seeded, skipping...`);
    return;
  }

  // Find some copies
  const copies = await Copy.find({ status: 'available' }).limit(3);
  if (copies.length < 3) return;

  const now = new Date();
  
  // 1. Overdue returned
  const dueDate1 = new Date(now);
  dueDate1.setDate(now.getDate() - 15);
  const returnDate1 = new Date(now);
  returnDate1.setDate(now.getDate() - 5);

  const loan1 = await Loan.create({
    userId: user._id,
    copyId: copies[0]._id,
    borrowDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
    dueDate: dueDate1,
    returnDate: returnDate1,
    status: 'returned',
  });

  await Fine.create({
    userId: user._id,
    loanId: loan1._id,
    amount: 10 * 5000,
    overdueDays: 10,
    reason: `Phạt trễ hạn 10 ngày (${label})`,
    status: 'pending',
  });

  // 2. Currently Overdue
  const dueDate2 = new Date(now);
  dueDate2.setDate(now.getDate() - 7);

  const loan2 = await Loan.create({
    userId: user._id,
    copyId: copies[1]._id,
    borrowDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    dueDate: dueDate2,
    status: 'overdue',
  });

  await Fine.create({
    userId: user._id,
    loanId: loan2._id,
    amount: 7 * 5000,
    overdueDays: 7,
    reason: `Quá hạn hiện tại 7 ngày (${label})`,
    status: 'pending',
  });
};
