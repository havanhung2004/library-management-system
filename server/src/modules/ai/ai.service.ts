import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../../common/utils/ApiError";
import Book from "../book/book.model";
import Copy from "../book/copy.model";
import Loan from "../loan/loan.model";
import User from "../user/user.model";
import Fine from "../fine/fine.model";
const SYSTEM_PROMPT = `Bạn là AI Assistant của Thư viện Số Trường Đại học Sư phạm Hà Nội (HNUE Digital Library).

**Nhiệm vụ chính:**
- Khi người dùng đã đăng nhập, bạn có thể sử dụng dữ liệu lịch sử mượn sách, sở thích và thông tin tài khoản được hệ thống cung cấp để hỗ trợ và gợi ý cá nhân hóa.
- Giải đáp quy định mượn/trả sách (mỗi lần mượn **14 ngày**, có thể gia hạn thêm 7 ngày, tối đa mượn 3 cuốn cùng lúc).
- Gợi ý tài liệu phù hợp với ngành học và nhu cầu nghiên cứu.
- Hướng dẫn sử dụng hệ thống thư viện số.
- Khi người dùng hỏi về phí phạt, hãy sử dụng dữ liệu phí phạt được hệ thống cung cấp.
- Khi người dùng hỏi về hạn trả sách, hãy thông báo các sách sắp đến hạn hoặc đã quá hạn.
- Nếu người dùng không có phí phạt hoặc không có sách sắp đến hạn, hãy trả lời rõ ràng điều đó.

**Quy tắc trả lời:**
- Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.
- Sử dụng markdown (**in đậm**, danh sách, v.v.) khi cần.
- Nếu hệ thống cung cấp dữ liệu lịch sử người dùng, hãy sử dụng dữ liệu đó để đưa ra gợi ý phù hợp.
- Không nói rằng bạn "không có quyền truy cập dữ liệu người dùng" nếu dữ liệu đã được hệ thống cung cấp.
- Nếu không có sách phù hợp trong kho dữ liệu, hãy thông báo và gợi ý tìm kiếm trực tiếp trên hệ thống.`;

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  private async retrieveRelevantBooks(query: string): Promise<string> {
    try {
      const stopWords = [
        "bạn",
        "mình",
        "tôi",
        "của",
        "và",
        "các",
        "có",
        "không",
        "gì",
        "nào",
        "cho",
        "với",
        "về",
        "được",
        "trong",
        "là",
        "cái",
        "chiếc",
        "cuốn",
        "quyển",
        "tờ",
        "mình",
        "này",
        "kia",
        "đó",
        "đâu",
        "thế",
        "nào",
        "như",
        "nếu",
        "thì",
        "mà",
        "lại",
        "cũng",
        "vẫn",
        "còn",
        "đến",
        "đi",
        "ra",
        "vào",
        "lên",
        "xuống",
        "tìm",
        "sách",
        "tài liệu",
      ];

      const keywords = query
        .toLowerCase()
        .replace(/[?!.,]/g, "")
        .split(" ")
        .filter((w) => w.length > 1 && !stopWords.includes(w));

      if (keywords.length === 0) return "";

      const regexes = keywords.map((k) => new RegExp(k, "i"));
      const orConditions =
        keywords.length > 0
          ? [
              { title: { $in: regexes } },
              { author: { $in: regexes } },
              { description: { $in: regexes } },
            ]
          : [];

      const books = await Book.find(
        keywords.length > 0 ? { $or: orConditions } : {},
      )
        .populate("category", "name")
        .limit(8)
        .lean();

      if (books.length === 0) return "";

      const booksWithAvailability = await Promise.all(
        books.map(async (book) => {
          const availableCopies = await Copy.countDocuments({
            bookId: book._id,
            status: "available",
          });
          const totalCopies = await Copy.countDocuments({ bookId: book._id });
          return { ...book, availableCopies, totalCopies };
        }),
      );

      const bookContext = booksWithAvailability
        .map(
          (b: any) =>
            `- **${b.title}**\n  * Tác giả: ${b.author}\n  * ISBN: ${b.isbn}\n  * Danh mục: ${b.category?.name || "N/A"}\n  * Trạng thái: ${b.availableCopies > 0 ? `Còn ${b.availableCopies}/${b.totalCopies} cuốn` : "Hết sách vật lý (đã cho mượn hết)"}${b.documentUrl ? " [Có bản PDF/Ebook]" : ""}\n  * Mô tả: ${b.description ? b.description.slice(0, 150) + "..." : "Không có mô tả."}`,
        )
        .join("\n\n");

      return `\n\n### DANH SÁCH SÁCH TRONG THƯ VIỆN LIÊN QUAN:\n${bookContext}\n`;
    } catch (error) {
      console.error("RAG retrieval error:", error);
      return "";
    }
  }

  async chat(
    prompt: string,
    history: any[] = [],
    userId?: string,
  ): Promise<string> {
    try {
      const bookContext = await this.retrieveRelevantBooks(prompt);
      let userContext = "";
      if (userId) {
        const user = await User.findById(userId).lean();
        const fullName =
          `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim();

        if (
          user?.role === "admin" ||
          user?.role === "librarian" ||
          user?.role === "superadmin"
        ) {
          const totalBooks = await Book.countDocuments();
          const totalCopies = await Copy.countDocuments();
          const borrowedCopies = await Copy.countDocuments({
            status: "borrowed",
          });

          const latestLoans = await Loan.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "profile")
            .populate({
              path: "copyId",
              populate: {
                path: "bookId",
                model: "Book",
              },
            });
          const latestBorrowedBooks = latestLoans.map((loan: any) => {
            const name =
              `${loan.userId?.profile?.firstName || ""} ${loan.userId?.profile?.lastName || ""}`.trim();

            return `- ${loan.copyId?.bookId?.title || "N/A"} — ${name}`;
          });
          const finedUsers = await Fine.distinct("userId");
          const pendingFines = await Fine.find({
            status: "pending",
          });
          const latestPendingFines = await Fine.find({
            status: "pending",
          })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "profile")
            .populate("loanId");

          const latestPendingFineText = latestPendingFines
            .map((fine: any) => {
              const name =
                `${fine.userId?.profile?.firstName || ""} ${fine.userId?.profile?.lastName || ""}`.trim();

              return `
              - ${name}
                • Số tiền: ${fine.amount} VNĐ
                • Lý do: ${fine.reason}
                • Quá hạn: ${fine.overdueDays} ngày
              `;
            })
            .join("\n");
          const totalPendingFineAmount = pendingFines.reduce(
            (sum: number, fine: any) => sum + fine.amount,
            0,
          );

          userContext = `
            ### THÔNG TIN QUẢN TRỊ

            Tên người dùng:
            ${fullName}

            Vai trò:
            ${user.role}

            Tổng số sách:
            ${totalBooks}

            Tổng số bản sao:
            ${totalCopies}

            Sách đang được mượn:
            ${borrowedCopies}

            Người dùng mượn gần nhất:
            ${latestBorrowedBooks.join("\n")}

            Số người bị phạt:
            ${finedUsers.length}
            ### PHÍ PHẠT GẦN NHẤT CHƯA DUYỆT

            ${latestPendingFineText || "Không có"}
            Số phiếu phạt chưa duyệt:
            ${pendingFines.length}

            Tổng tiền phạt chưa duyệt:
            ${totalPendingFineAmount} VNĐ

            Khi người dùng hỏi về quản lý thư viện,
            hãy ưu tiên sử dụng các dữ liệu trên để trả lời.
            `;
        } else {
          const loans = await Loan.find({ userId }).populate({
            path: "copyId",
            populate: {
              path: "bookId",
              model: "Book",
              populate: {
                path: "category",
                model: "Category",
              },
            },
          });
          const fines = await Fine.find({
            userId,
            status: "pending",
          });

          const totalFine = fines.reduce((sum, fine) => sum + fine.amount, 0);
          const borrowedBooks = loans
            .map((loan: any) => loan?.copyId?.bookId?.title)
            .filter(Boolean);

          const categories = loans
            .map((loan: any) => loan?.copyId?.bookId?.category?.name)
            .filter(Boolean);
          const now = new Date();

          const upcomingLoans = loans.filter((loan: any) => {
            if (loan.status !== "active" || !loan.dueDate) {
              return false;
            }

            const diffDays = Math.ceil(
              (new Date(loan.dueDate).getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            return diffDays >= 0 && diffDays <= 3;
          });
          const overdueLoans = loans.filter((loan: any) => {
            return loan.status === "overdue";
          });
          userContext = `
### THÔNG TIN NGƯỜI DÙNG

Tên:
${fullName}

Người dùng đã từng mượn:
${borrowedBooks.join(", ") || "Chưa có"}

Thể loại yêu thích:
${categories.join(", ") || "Chưa có"}

Số phiếu phạt chưa thanh toán:
${fines.length}

Tổng tiền phạt:
${totalFine} VNĐ

Sách sắp đến hạn trả:
${
  upcomingLoans.length > 0
    ? upcomingLoans
        .map(
          (loan: any) =>
            `- ${loan.copyId?.bookId?.title} (Hạn trả: ${new Date(
              loan.dueDate,
            ).toLocaleDateString("vi-VN")})`,
        )
        .join("\n")
    : "Không có"
}

        Sách quá hạn:
        ${
          overdueLoans.length > 0
            ? overdueLoans
                .map((loan: any) => `- ${loan.copyId?.bookId?.title}`)
                .join("\n")
            : "Không có"
        }

        Hãy sử dụng dữ liệu này để hỗ trợ người dùng.
        `;
        }
      }
      const augmentedPrompt = `
        ${userContext}

        CÂU HỎI NGƯỜI DÙNG:
        ${prompt}

        ${bookContext}

        Hãy trả lời thân thiện, ngắn gọn và hữu ích.
        `;
      const systemHistory = [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Xin chào! Tôi là AI Assistant của HNUE Digital Library. Tôi có thể giúp bạn tìm sách, giải đáp quy định mượn/trả, hoặc gợi ý tài liệu học tập. Bạn cần hỗ trợ gì?",
            },
          ],
        },
        ...history,
      ];

      const chatSession = this.model.startChat({
        history: systemHistory,
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.7,
        },
      });

      const result = await chatSession.sendMessage(augmentedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      if ((error as any)?.status === 503) {
        throw new ApiError(503, "AI đã hết quota miễn phí hoặc đang quá tải.");
      }
      throw new ApiError(500, "Lỗi khi kết nối với AI Assistant");
    }
  }

  async getRecommendations(userId: string): Promise<string> {
    const loans = await Loan.find({ userId }).populate({
      path: "copyId",
      populate: {
        path: "bookId",
        model: "Book",
        populate: {
          path: "category",
          model: "Category",
        },
      },
    });
    const favoriteBooks: string[] = [];
    const categories: string[] = [];

    loans.forEach((loan: any) => {
      const book = loan?.copyId?.bookId;

      if (!book || typeof book !== "object") {
        return;
      }

      if (book.title) {
        favoriteBooks.push(book.title);
      }

      if (
        book.category &&
        typeof book.category === "object" &&
        "name" in book.category
      ) {
        categories.push(book.category.name);
      }
    });

    const relatedBooks = await Book.find({
      title: {
        $nin: favoriteBooks,
      },
    })
      .populate("category", "name")
      .limit(10)
      .lean();

    const relatedContext = relatedBooks
      .map((b: any) => `- ${b.title} (${b.category?.name || "N/A"})`)
      .join("\n");

    if (favoriteBooks.length === 0) {
      const popularBooks = await Book.find().limit(5).lean();

      return `
Bạn chưa có lịch sử mượn sách.

Một số sách nổi bật:
${popularBooks.map((b: any) => `- ${b.title}`).join("\n")}
`;
    }
    const prompt = ` Bạn là AI Assistant của thư viện HNUE.

Người dùng thường đọc:
${favoriteBooks.join(", ")}

Thể loại yêu thích:
${categories.join(", ")}

Danh sách sách hiện có:
${relatedContext}

Hãy gợi ý 5 sách phù hợp nhất cho người dùng.

Yêu cầu:
- Trả lời bằng tiếng Việt
- Ngắn gọn
- Giải thích ngắn vì sao phù hợp
`;

    try {
      const result = await this.model.generateContent(prompt);

      const response = await result.response;

      return response.text();
    } catch (error) {
      throw new ApiError(500, "Lỗi khi lấy gợi ý từ AI");
    }
  }
}

export default new AIService();
