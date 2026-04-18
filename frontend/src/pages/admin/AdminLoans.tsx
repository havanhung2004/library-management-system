import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Search, BookOpen } from "lucide-react";
import api from "../../lib/api";
import Pagination from "../../components/ui/Pagination";

const AdminLoans: React.FC = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });

  useEffect(() => {
    fetchLoans();
  }, [filterStatus, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchLoans();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get("/loans", {
        params: {
          status: filterStatus !== "Tất cả" ? filterStatus : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 10,
        },
      });
      setLoans(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (!window.confirm("Xác nhận trả sách?")) return;
    try {
      await api.post(`/loans/return/${loanId}`);
      fetchLoans();
    } catch (err) {
      console.error("Error returning book:", err);
    }
  };

  const handleApprove = async (loanId: string) => {
    if (!window.confirm("Phê duyệt yêu cầu mượn sách này?")) return;
    try {
      await api.post(`/loans/approve/${loanId}`);
      fetchLoans();
    } catch (err) {
      console.error("Error approving loan:", err);
    }
  };

  const handleReject = async (loanId: string) => {
    if (!window.confirm("Từ chối yêu cầu mượn sách này?")) return;
    try {
      await api.post(`/loans/reject/${loanId}`);
      fetchLoans();
    } catch (err) {
      console.error("Error rejecting loan:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1 tracking-tight text-on-background">
          Quản lý Mượn/Trả
        </h1>
        <p className="text-on-surface/60">
          Theo dõi trạng thái các bản ghi mượn sách trong toàn hệ thống.
        </p>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-on-surface/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-on-surface/[0.01]">
          <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {[
              "Tất cả",
              "Chờ duyệt",
              "Đang mượn",
              "Quá hạn",
              "Đã trả",
              "Từ chối",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                  filterStatus === tab
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-on-surface/5 hover:bg-on-surface/10 text-on-surface/60"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, tiêu đề sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface/[0.02] text-on-surface/50 text-[10px] font-black uppercase tracking-widest border-b border-on-surface/5">
                <th className="px-6 py-4">Thành viên</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Tài liệu mượn</th>
                <th className="px-6 py-4">Thời gian mượn</th>
                <th className="px-6 py-4">Thời hạn mượn</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-10 w-40 bg-on-surface/5 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-56 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-24 bg-on-surface/5 ml-auto rounded"></div>
                    </td>
                  </tr>
                ))
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20 text-on-surface">
                      <Clock className="w-12 h-12" />
                      <p className="italic font-medium">
                        Chưa có bản ghi mượn sách nào.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const firstName = loan.userId?.profile?.firstName || "User";
                  const lastName = loan.userId?.profile?.lastName || "";
                  const bookTitle =
                    loan.copyId?.bookId?.title || "Tài liệu không xác định";
                  const borrowDate = new Date(
                    loan.createdAt,
                  ).toLocaleDateString("vi-VN");
                  const dueDate = new Date(loan.dueDate).toLocaleDateString(
                    "vi-VN",
                  );

                  return (
                    <tr
                      key={loan._id}
                      className="hover:bg-on-surface/[0.01] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center text-xs font-black text-primary border border-on-surface/5 group-hover:border-primary/30 transition-all">
                            {firstName[0]}
                            {lastName[0] || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-on-background group-hover:text-primary transition-colors">
                              {firstName} {lastName}
                            </p>
                            <p className="text-[10px] text-on-surface/40 font-bold uppercase tracking-tight">
                              {loan.userId?.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-on-surface/60 font-medium">
                          {loan.userId?.email || "---"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface/80 group-hover:text-on-background transition-colors">
                          <BookOpen className="w-4 h-4 text-primary/40 group-hover:text-primary" />
                          <span className="text-sm font-medium line-clamp-1">
                            {bookTitle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-bold text-on-surface/50">
                        {borrowDate}
                      </td>
                      <td className="px-6 py-4 text-[11px] font-bold text-on-surface/50">
                        {dueDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                            loan.status === "active"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : loan.status === "returned"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : loan.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  : loan.status === "rejected"
                                    ? "bg-accent/10 text-accent border-accent/20"
                                    : "bg-accent/10 text-accent border-accent/20"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              loan.status === "active"
                                ? "bg-blue-500"
                                : loan.status === "returned"
                                  ? "bg-green-500"
                                  : loan.status === "pending"
                                    ? "bg-yellow-500"
                                    : "bg-accent"
                            } ${loan.status === "pending" || loan.status === "active" ? "animate-pulse" : ""}`}
                          ></div>
                          {loan.status === "active"
                            ? "ĐANG MƯỢN"
                            : loan.status === "returned"
                              ? "ĐÃ TRẢ"
                              : loan.status === "pending"
                                ? "CHỜ DUYỆT"
                                : loan.status === "rejected"
                                  ? "ĐÃ TỪ CHỐI"
                                  : "QUÁ HẠN"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          {loan.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(loan._id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg text-[10px] font-black transition-all"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> DUYỆT
                              </button>
                              <button
                                onClick={() => handleReject(loan._id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg text-[10px] font-black transition-all"
                              >
                                <Clock className="w-3.5 h-3.5" /> TỪ CHỐI
                              </button>
                            </>
                          )}
                          {loan.status === "active" && (
                            <button
                              onClick={() => handleReturn(loan._id)}
                              className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg text-xs font-black transition-all shadow-sm shadow-green-500/10"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> XÁC NHẬN
                              TRẢ
                            </button>
                          )}
                          {(loan.status === "returned" ||
                            loan.status === "rejected") && (
                            <span className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest">
                              {loan.status === "returned"
                                ? "COMPLETED"
                                : "REJECTED"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 rounded-xl border border-on-surface/10">
        <div className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">
          Phân trang <span className="text-on-background">{meta.page}</span> /{" "}
          <span className="text-on-background">{meta.totalPages}</span>
        </div>
        <Pagination
          page={currentPage}
          totalPages={meta.totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
};

export default AdminLoans;

