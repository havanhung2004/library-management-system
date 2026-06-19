import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  Calendar,
  Hash,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const BookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ── [SỬA] Tách state cho eBook và sách vật lý ──────────────
  const [ebookLoan, setEbookLoan] = useState<any>(null);
  const [physicalLoan, setPhysicalLoan] = useState<any>(null);
  const [borrowingEbook, setBorrowingEbook] = useState(false);
  const [borrowingPhysical, setBorrowingPhysical] = useState(false);
  const [ebookMessage, setEbookMessage] = useState("");
  const [physicalMessage, setPhysicalMessage] = useState("");
  // ────────────────────────────────────────────────────────────

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${bookId}`);
        setBook(response.data.data);
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };

    // ── [SỬA] fetchUserLoan tách riêng ebookLoan và physicalLoan ──
    const fetchUserLoan = async () => {
      if (!user) return;
      try {
        const response = await api.get("/loans/my-loans");
        const loans = response.data.data;

        // eBook loan: loanType === "ebook" và bookId khớp trực tiếp
        const ebook = loans.find(
          (l: any) =>
            l.loanType === "ebook" &&
            l.bookId?._id?.toString() === bookId &&
            ["active", "pending", "overdue"].includes(l.status),
        );

        // Physical loan: loanType !== "ebook", tìm qua copyId
        const physical = loans.find(
          (l: any) =>
            l.loanType !== "ebook" &&
            l.copyId?.bookId?._id === bookId &&
            ["active", "pending", "overdue"].includes(l.status),
        );

        setEbookLoan(ebook);
        setPhysicalLoan(physical);
      } catch (err) {
        console.error("Error fetching user loans:", err);
      }
    };
    // ─────────────────────────────────────────────────────────────

    fetchBook();
    fetchUserLoan();
  }, [bookId, user]);

  // ── [SỬA] Handler riêng cho eBook ──────────────────────────
  const handleBorrowEbook = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setBorrowingEbook(true);
    setEbookMessage("");
    try {
      await api.post("/loans/borrow", {
        bookId,
        loanType: "ebook",
        durationDays: 14,
      });
      setEbookMessage(
        "Yêu cầu đọc eBook đã được gửi, vui lòng chờ Admin phê duyệt.",
      );
      setEbookLoan({ status: "pending", loanType: "ebook", bookId });
    } catch (err: any) {
      setEbookMessage(
        err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu.",
      );
    } finally {
      setBorrowingEbook(false);
    }
  };

  // ── [SỬA] Handler riêng cho sách vật lý ────────────────────
  const handleBorrowPhysical = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setBorrowingPhysical(true);
    setPhysicalMessage("");
    try {
      await api.post("/loans/borrow", {
        bookId,
        loanType: "physical",
        durationDays: 14,
      });
      setPhysicalMessage(
        "Yêu cầu mượn đã được gửi, vui lòng chờ Admin phê duyệt.",
      );
      setPhysicalLoan({
        status: "pending",
        copyId: { bookId: { _id: bookId } },
      });
    } catch (err: any) {
      setPhysicalMessage(
        err.response?.data?.message || "Có lỗi xảy ra khi thực hiện mượn sách.",
      );
    } finally {
      setBorrowingPhysical(false);
    }
  };
  // ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book)
    return (
      <div className="p-12 text-center text-on-surface">
        Không tìm thấy sách.
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-12">
      <Link
        to="/search"
        className="inline-flex items-center gap-2 text-on-surface/50 hover:text-primary transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại tìm kiếm
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Image and Quick Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 mb-8 relative group">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                <BookOpen className="w-32 h-32 text-slate-700 opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
          </div>

          <div className="premium-card space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-on-surface/5 pb-3">
              <span className="text-on-surface/50 flex items-center gap-2">
                <CheckCircle
                  className={`w-4 h-4 ${book.availableCopies > 0 ? "text-green-500" : "text-on-surface/20"}`}
                />{" "}
                Sẵn có
              </span>
              <span
                className={`font-bold ${book.availableCopies === 0 ? "text-accent" : ""}`}
              >
                {book.availableCopies ?? 0} bản
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-on-surface/5 pb-3">
              <span className="text-on-surface/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Tổng số
              </span>
              <span className="font-bold">{book.totalCopies ?? 0} bản</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface/50 flex items-center gap-2">
                <Hash className="w-4 h-4 text-secondary" /> ISBN
              </span>
              <span className="font-mono text-xs">{book.isbn}</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Detailed Info and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
              {book.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-on-surface/50">
              <span className="flex items-center gap-2 text-primary-light font-medium">
                <User className="w-5 h-5" /> {book.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> {book.publishedYear || "2024"}
              </span>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                {book.category?.name || "Khác"}
              </span>
              <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                Sách vật lý
              </span>
              {book.documentUrl && (
                <span className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-500/20">
                  Ebook
                </span>
              )}
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">
                Mô tả
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg italic opacity-90">
                {book.description ||
                  "Chưa có mô tả cho cuốn sách này. Đây là một tài liệu quan trọng trong chương trình đào tạo của Đại học Sư phạm Hà Nội, cung cấp các kiến thức nền tảng và nâng cao cho sinh viên."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ── [SỬA] Card eBook — dùng ebookLoan, gọi handleBorrowEbook ── */}
              {book.documentUrl && (
                <div className="premium-card bg-surface/40 group hover:border-primary/50 transition-all flex flex-col">
                  <FileText className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold text-lg mb-2">Tài liệu số (PDF)</h4>
                  <p className="text-on-surface/50 text-sm mb-6">
                    {ebookLoan?.status === "active" ||
                    ebookLoan?.status === "overdue"
                      ? "Bạn có thể đọc tài liệu số trực tuyến với tính năng bảo mật cao."
                      : "Trình xem trực tuyến sẽ khả dụng sau khi yêu cầu mượn được phê duyệt."}
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate(`/reader/${bookId}?full=true`)}
                      className="premium-button w-full flex items-center justify-center gap-2 mb-3 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    >
                      <BookOpen className="w-4 h-4" />
                      Xem trước
                    </button>
                    {ebookLoan?.status === "active" ||
                    ebookLoan?.status === "overdue" ? (
                      <button
                        onClick={() => navigate(`/reader/${bookId}?full=true`)}
                        className="premium-button w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80"
                      >
                        <BookOpen className="w-4 h-4" />
                        Đọc toàn bộ tài liệu
                      </button>
                    ) : ebookLoan?.status === "pending" ? (
                      <button
                        disabled
                        className="premium-button w-full flex items-center justify-center gap-2 bg-on-surface/10 text-on-surface/40 border-on-surface/5 cursor-not-allowed"
                      >
                        <BookOpen className="w-4 h-4" /> YÊU CẦU ĐANG CHỜ DUYỆT
                      </button>
                    ) : (
                      <button
                        onClick={handleBorrowEbook}
                        disabled={borrowingEbook}
                        className="premium-button w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80"
                      >
                        <BookOpen className="w-4 h-4" />
                        {borrowingEbook
                          ? "Đang xử lý..."
                          : "Đăng ký đọc tài liệu số"}
                      </button>
                    )}
                  </div>
                  {ebookMessage && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-sm text-green-400"
                    >
                      {ebookMessage}
                    </motion.p>
                  )}
                </div>
              )}

              {/* ── [SỬA] Card sách vật lý — dùng physicalLoan, gọi handleBorrowPhysical ── */}
              <div className="premium-card bg-surface/40 group hover:border-secondary/50 transition-all flex flex-col">
                <BookOpen className="w-8 h-8 text-secondary mb-4" />
                <h4 className="font-bold text-lg mb-2">Sách vật lý</h4>
                <p className="text-on-surface/50 text-sm mb-6">
                  Mượn sách trực tiếp tại quầy thư viện khu A1.
                </p>
                <div className="mt-auto">
                  <button
                    onClick={handleBorrowPhysical}
                    disabled={
                      borrowingPhysical ||
                      !!physicalLoan ||
                      book.availableCopies === 0
                    }
                    className={`premium-button w-full flex items-center justify-center gap-3 shadow-secondary/20 ${
                      physicalLoan || book.availableCopies === 0
                        ? "bg-on-surface/10 text-on-surface/50 border-on-surface/5 cursor-not-allowed"
                        : "bg-secondary hover:bg-secondary/80 text-white"
                    }`}
                  >
                    {borrowingPhysical
                      ? "Đang xử lý..."
                      : physicalLoan?.status === "pending"
                        ? "YÊU CẦU ĐANG CHỜ DUYỆT"
                        : physicalLoan
                          ? "BẠN ĐANG MƯỢN SÁCH NÀY"
                          : book.availableCopies === 0
                            ? "HẾT SÁCH SẴN CÓ"
                            : "Mượn sách"}
                  </button>
                </div>
                {physicalMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-sm text-green-400"
                  >
                    {physicalMessage}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetails;
