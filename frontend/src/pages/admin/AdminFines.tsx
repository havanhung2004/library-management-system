import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Book,
} from "lucide-react";
import api from "../../lib/api";
import { format } from "date-fns";

interface Fine {
  _id: string;
  amount: number;
  reason: string;
  overdueDays: number;
  status: "pending" | "paid";
  createdAt: string;
  paymentDate?: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  loanId: {
    _id: string;
    copyId: {
      _id: string;
      bookId: {
        _id: string;
        title: string;
      };
    };
  };
}

const AdminFines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [meta, setMeta] = useState<any>({});
  const [page] = useState(1);

  const fetchFines = async () => {
    try {
      const res = await api.get("/fines", {
        params: {
          page,
          limit: 10,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      setFines(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error("Error fetching admin fines:", error);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [page, statusFilter]);

  const handleConfirmPayment = async (fineId: string) => {
    if (!window.confirm("Xác nhận người dùng đã nộp tiền phạt này?")) return;
    try {
      await api.post(`/fines/pay/${fineId}`, { paymentMethod: "cash" });
      fetchFines();
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  const filteredFines = fines.filter(
    (f) =>
      `${f.userId?.profile?.firstName} ${f.userId?.profile?.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      f.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.loanId?.copyId?.bookId?.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-background">
            Quản lý Phí phạt
          </h1>
          <p className="text-on-surface/60 text-sm">
            Theo dõi và xử lý các khoản đóng phạt trong hệ thống.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 border-l-4 border-l-red-500/50 bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-on-background tracking-tighter">
                {meta.totalResults || 0}
              </div>
              <div className="text-[10px] text-on-surface/40 font-black uppercase tracking-widest">
                Tổng phiếu phạt
              </div>
            </div>
          </div>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/10">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-on-background tracking-tighter">
                {fines.filter((f) => f.status === "pending").length}
              </div>
              <div className="text-[10px] text-on-surface/40 font-black uppercase tracking-widest">
                Khoản đang chờ
              </div>
            </div>
          </div>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/10">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-on-background tracking-tighter">
                {fines.filter((f) => f.status === "paid").length}
              </div>
              <div className="text-[10px] text-on-surface/40 font-black uppercase tracking-widest">
                Đã giải quyết
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center bg-on-surface/[0.01]">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm theo sinh viên, tên sách..."
            className="w-full bg-background border border-on-surface/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
            <select
              className="w-full bg-background border border-on-surface/10 rounded-xl py-2.5 pl-11 pr-8 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary/50 transition-all text-on-surface appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">TẤT CẢ TRẠNG THÁI</option>
              <option value="pending">CHỜ THANH TOÁN</option>
              <option value="paid">ĐÃ THANH TOÁN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface/[0.02] text-on-surface/50 text-[10px] font-black uppercase tracking-widest border-b border-on-surface/5">
                <th className="px-6 py-4">Thành viên / Tài liệu</th>
                <th className="px-6 py-4">Lý do & Thời gian</th>
                <th className="px-6 py-4 text-center">Giá trị</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {filteredFines.map((fine) => (
                <tr
                  key={fine._id}
                  className="hover:bg-on-surface/[0.01] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center text-primary text-[10px] font-black border border-on-surface/5 group-hover:border-primary/30 transition-all">
                        {fine.userId?.profile?.firstName?.charAt(0)}
                        {fine.userId?.profile?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-on-background group-hover:text-primary transition-colors">
                          {fine.userId?.profile?.firstName}{" "}
                          {fine.userId?.profile?.lastName}
                        </div>
                        <div className="text-[10px] text-on-surface/40 font-bold flex items-center gap-1 mt-0.5">
                          <Book className="w-3 h-3 text-primary/40" />{" "}
                          {fine.loanId?.copyId?.bookId?.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-on-surface/70">
                      {fine.reason}
                    </div>
                    <div className="text-[10px] text-on-surface/30 font-bold flex items-center gap-1 mt-1 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />{" "}
                      {format(new Date(fine.createdAt), "dd/MM/yyyy")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-black text-on-background tracking-tighter">
                      {fine.amount.toLocaleString("vi-VN")} Đ
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {fine.status === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2.5 py-1 rounded border border-green-500/10">
                        <CheckCircle className="w-3 h-3" /> ĐÃ THU
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded border border-yellow-500/10">
                        <Clock className="w-3 h-3" /> CHỜ THU
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    {fine.status === "pending" ? (
                      <button
                        onClick={() => handleConfirmPayment(fine._id)}
                        className="p-2 hover:bg-green-500/10 text-on-surface/40 hover:text-green-500 rounded-lg transition-all"
                        title="Xác nhận thanh toán tiền mặt"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-on-surface/20 uppercase tracking-widest px-2">
                        VOID
                      </span>
                    )}
                    <button className="p-2 hover:bg-on-surface/5 text-on-surface/40 hover:text-on-background rounded-lg transition-all">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFines.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-15 text-on-surface">
                      <DollarSign className="w-12 h-12" />
                      <p className="italic font-bold uppercase tracking-widest text-xs">
                        Không có dữ liệu đóng phạt
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFines;

