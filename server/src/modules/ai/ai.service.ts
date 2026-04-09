import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../../common/utils/ApiError";
import Book from "../book/book.model";
import Copy from "../book/copy.model";

const SYSTEM_PROMPT = `Bạn là AI Assistant của Thư viện Số Trường Đại học Sư phạm Hà Nội (HNUE Digital Library).

**Nhiệm vụ chính:**
- Hỗ trợ sinh viên và giảng viên tìm kiếm sách/tài liệu học tập.
- Giải đáp quy định mượn/trả sách (mỗi lần mượn **14 ngày**, có thể gia hạn thêm 7 ngày, tối đa mượn 3 cuốn cùng lúc).
- Gợi ý tài liệu phù hợp với ngành học và nhu cầu nghiên cứu.
- Hướng dẫn sử dụng hệ thống thư viện số.

**Quy tắc trả lời:**
- Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.
- Sử dụng markdown (**in đậm**, danh sách, v.v.) khi cần.
- Nếu được cung cấp danh sách sách từ kho dữ liệu, hãy ưu tiên dùng thông tin đó để trả lời.
- Nếu không có sách phù hợp trong kho dữ liệu, hãy thông báo và gợi ý tìm kiếm trực tiếp trên hệ thống.`;

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  /**
   * Search relevant books from DB based on user query (RAG retrieval step)
   */
  private async retrieveRelevantBooks(query: string): Promise<string> {
    try {
      // Simple keyword-based retrieval from MongoDB
      const keywords = query
        .toLowerCase()
        .replace(/[?!.,]/g, "")
        .split(" ")
        .filter(
          (w) =>
            w.length > 2 &&
            ![
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
            ].includes(w),
        );

      if (keywords.length === 0) return "";

      const regexes = keywords.map((k) => new RegExp(k, "i"));
      const orConditions = regexes.map((r) => ({
        $or: [{ title: r }, { author: r }, { description: r }],
      }));

      const books = await Book.find({ $or: orConditions })
        .populate("category", "name")
        .limit(5)
        .lean();

      if (books.length === 0) return "";

      // For each book, get available copy count
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
            `- **${b.title}** (Tác giả: ${b.author}, Mã ISBN: ${b.isbn}, Danh mục: ${b.category?.name || "N/A"}, Bản sao còn trống: ${b.availableCopies}/${b.totalCopies})${b.description ? ` — ${b.description.slice(0, 100)}...` : ""}`,
        )
        .join("\n");

      return `\n\n**Kết quả tìm kiếm trong kho sách HNUE liên quan đến câu hỏi của bạn:**\n${bookContext}\n`;
    } catch (error) {
      console.error("RAG retrieval error:", error);
      return "";
    }
  }

  /**
   * Chat with AI Assistant (with RAG context injection)
   */
  async chat(prompt: string, history: any[] = []): Promise<string> {
    try {
      // RAG step: retrieve relevant books
      const bookContext = await this.retrieveRelevantBooks(prompt);

      // Augment the prompt with retrieved context
      const augmentedPrompt = bookContext
        ? `${prompt}\n${bookContext}\n(Hãy sử dụng thông tin trên để trả lời chính xác hơn nếu liên quan.)`
        : prompt;

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
      throw new ApiError(500, "Lỗi khi kết nối với AI Assistant");
    }
  }

  /**
   * Get book recommendations based on context
   */
  async getRecommendations(context: string): Promise<string> {
    const bookContext = await this.retrieveRelevantBooks(context);
    const prompt = `Sinh viên/giảng viên yêu cầu: "${context}".
${bookContext}
Dựa trên kho sách HNUE ở trên (nếu có), hãy gợi ý tài liệu phù hợp. Nếu không có sách phù hợp trong kho, hãy gợi ý danh mục/chủ đề để tham khảo. Trả lời ngắn gọn, súc tích bằng tiếng Việt.`;

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

