import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Book,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Shield,
  Briefcase,
  Mail,
  Camera,
  X,
  Loader2,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AnimatePresence } from "framer-motion";

interface Loan {
  _id: string;
  loanType?: "physical" | "ebook";

  bookId?: {
    _id: string;
    title: string;
    author: string;
    coverImage?: string;
    documentUrl?: string;
  };

  copyId?: {
    _id: string;
    bookId: {
      _id: string;
      title: string;
      author: string;
      coverImage?: string;
      documentUrl?: string;
    };
  };

  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullUser, setFullUser] = useState<any>(null);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    department: "",
  });

  const fetchData = async () => {
    try {
      const [meRes, loansRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/loans/my-loans"),
      ]);
      setFullUser(meRes.data.data);
      setLoans(loansRes.data.data);

      // Initialize form data
      setFormData({
        firstName: meRes.data.data.profile.firstName || "",
        lastName: meRes.data.data.profile.lastName || "",
        studentId: meRes.data.data.profile.studentId || "",
        department: meRes.data.data.profile.department || "",
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeLoans = loans.filter(
    (l) => l.status === "active" || l.status === "overdue",
  );
  const totalTurns = loans.filter(
    (l) => l.status !== "rejected" && l.status !== "pending",
  ).length;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch("/users/me", formData);
      setFullUser(res.data.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("avatar", file);

    setIsUploading(true);
    try {
      const res = await api.post("/users/me/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFullUser(res.data.data);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReturnEbook = async (loanId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn trả Ebook này không? Sau khi trả, bạn sẽ không thể tiếp tục đọc tài liệu.",
      )
    )
      return;

    try {
      await api.post(`/loans/return/${loanId}`);
      alert("Đã trả Ebook thành công!");
      fetchData(); // Refresh loans list
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi trả Ebook.");
    }
  };

  const getStatusBadge = (loan: Loan) => {
    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    if (loan.status === "returned") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" /> Đã trả
        </span>
      );
    }
    if (now > dueDate) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
          <AlertCircle className="w-3 h-3" /> Quá hạn
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" /> Đang mượn
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    student: "Sinh viên",
    lecturer: "Giảng viên",
    librarian: "Thủ thư",
    admin: "Quản trị viên",
    superadmin: "Quản trị cấp cao",
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Info */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card p-8 text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-6 group/avatar">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary/20 overflow-hidden relative">
                {fullUser?.profile?.avatar ? (
                  <img
                    src={fullUser.profile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {fullUser?.profile?.firstName?.charAt(0)}
                    {fullUser?.profile?.lastName?.charAt(0)}
                  </span>
                )}

                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-surface border border-on-surface/10 rounded-xl shadow-lg z-10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1">
              {fullUser?.profile?.firstName} {fullUser?.profile?.lastName}
            </h2>
            <p className="text-primary font-medium text-sm mb-6">
              {roleLabels[fullUser?.role || "student"]}
            </p>

            <div className="space-y-4 text-left border-t border-on-surface/5 pt-6">
              <div className="flex items-center gap-3 text-on-surface/40">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{fullUser?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface/40">
                <Bookmark className="w-4 h-4" />
                <span className="text-sm">
                  MSSV: {fullUser?.profile?.studentId || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-on-surface/40">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">
                  Khoa: {fullUser?.profile?.department || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-on-surface/40">
                <Calendar className="w-4 h-4" />
                <span className="text-sm text-xs italic">
                  Thành viên từ:{" "}
                  {format(new Date(fullUser?.createdAt), "MMMM yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full mt-8 py-3 bg-on-surface/5 hover:bg-on-surface/10 border border-on-surface/10 rounded-xl text-sm font-bold transition-all"
            >
              Chỉnh sửa hồ sơ
            </button>

            <button
              onClick={() => navigate("/fines")}
              className="w-full mt-3 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" /> Xem phí phạt
            </button>
          </motion.div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="premium-card p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {activeLoans.length}
              </div>
              <div className="text-[10px] font-bold text-on-surface/50 uppercase tracking-widest">
                Đang mượn
              </div>
            </div>
            <div className="premium-card p-6 text-center">
              <div className="text-2xl font-bold text-on-background mb-1">
                {totalTurns}
              </div>
              <div className="text-[10px] font-bold text-on-surface/50 uppercase tracking-widest">
                Tổng lượt
              </div>
            </div>
            <div className="premium-card p-6 text-center lg:col-span-2">
              <button
                onClick={() => navigate("/fines")}
                className="w-full h-full flex flex-col items-center justify-center gap-1 group"
              >
                <div className="text-2xl font-bold text-red-500 group-hover:scale-110 transition-transform flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Phí phạt
                </div>
                <div className="text-[10px] font-bold text-on-surface/50 uppercase tracking-widest">
                  Kiểm tra & Thanh toán
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Loan Sections */}
        <div className="lg:col-span-2 space-y-12">
          {/* Active Loans */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Book className="w-6 h-6 text-primary" /> Sách Đang mượn
              </h3>
              <span className="text-slate-500 text-sm">
                {activeLoans.length} cuốn
              </span>
            </div>

            {activeLoans.length === 0 ? (
              <div className="premium-card p-12 text-center text-slate-500 border-dashed border-white/10">
                Bạn hiện không mượn tài liệu nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeLoans.map((loan, i) => {
                  const book =
                    loan.loanType === "ebook"
                      ? loan.bookId
                      : loan.copyId?.bookId;

                  return (
                    <motion.div
                      key={loan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={`/books/${book?._id}`}
                        className="premium-card p-6 flex gap-6 group hover:border-primary/50 transition-all"
                      >
                        <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 shadow-lg">
                          <img
                            src={
                              book?.coverImage ||
                              "https://images.unsplash.com/photo-1543003968-240974628864?auto=format&fit=crop&q=80&w=200"
                            }
                            alt={book?.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">{getStatusBadge(loan)}</div>
                          <h4 className="font-bold text-on-background mb-1 truncate group-hover:text-primary transition-colors">
                            {book?.title || "Tài liệu không xác định"}
                          </h4>
                          <p className="text-on-surface/60 text-xs mb-4">
                            {book?.author}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Hết hạn:{" "}
                              {format(new Date(loan.dueDate), "dd/MM/yyyy")}
                            </span>
                          </div>

                          {loan.loanType === "ebook" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleReturnEbook(loan._id);
                              }}
                              className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                              Trả Ebook ngay
                            </button>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Loan History */}
          <section>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-slate-400" /> Lịch sử Mượn trả
            </h3>
            <div className="premium-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-on-surface/5 border-b border-on-surface/10 uppercase text-[10px] font-bold tracking-widest text-on-surface/50">
                      <th className="px-6 py-4">Tài liệu</th>
                      <th className="px-6 py-4 text-center">Ngày mượn</th>
                      <th className="px-6 py-4 text-center">Hạn trả</th>
                      <th className="px-6 py-4 text-center">Ngày trả thực</th>
                      <th className="px-6 py-4 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-on-surface/5">
                    {loans.map((loan) => {
                      const book =
                        loan.loanType === "ebook"
                          ? loan.bookId
                          : loan.copyId?.bookId;

                      return (
                        <tr
                          key={loan._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/books/${book?._id}`}
                              className="group/row"
                            >
                              <div className="font-bold text-sm text-on-background group-hover/row:text-primary transition-colors line-clamp-1">
                                {book?.title || "N/A"}
                              </div>
                              <div className="text-[10px] text-on-surface/50">
                                {book?.author}
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-center text-xs text-slate-400">
                            {format(new Date(loan.borrowDate), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 text-center text-xs text-slate-400 font-medium">
                            {format(new Date(loan.dueDate), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 text-center text-xs text-slate-400">
                            {loan.returnDate
                              ? format(new Date(loan.returnDate), "dd/MM/yyyy")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {getStatusBadge(loan)}
                          </td>
                        </tr>
                      );
                    })}
                    {loans.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-slate-500 italic"
                        >
                          Chưa có lịch sử giao dịch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface border border-on-surface/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-on-surface/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Chỉnh sửa hồ sơ</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-on-surface/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                      Họ
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="premium-input w-full"
                      placeholder="Nguyễn"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                      Tên
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="premium-input w-full"
                      placeholder="Văn A"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Mã sinh viên (MSSV)
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="premium-input w-full"
                    placeholder="7xxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Khoa / Bộ môn
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="premium-input w-full"
                    placeholder="Khoa Công nghệ thông tin"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 bg-on-surface/5 hover:bg-on-surface/10 border border-on-surface/10 rounded-2xl font-bold transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
