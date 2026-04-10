import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, CheckCircle, Clock, FileText, Calendar, Book } from 'lucide-react';
import api from '../../lib/api';
import { format } from 'date-fns';

interface Fine {
  _id: string;
  amount: number;
  reason: string;
  overdueDays: number;
  status: 'pending' | 'paid';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [meta, setMeta] = useState<any>({});
  const [page] = useState(1);

  const fetchFines = async () => {
    try {
      const res = await api.get('/fines', {
        params: {
          page,
          limit: 10,
          status: statusFilter === 'all' ? undefined : statusFilter,
          // search filter would need backend support for nested fields, 
          // keeping it simple for now or filtering in frontend
        }
      });
      setFines(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error('Error fetching admin fines:', error);
    } finally {
      // Done loading
    }
  };

  useEffect(() => {
    fetchFines();
  }, [page, statusFilter]);

  const handleConfirmPayment = async (fineId: string) => {
    if (!window.confirm('Xác nhận người dùng đã nộp tiền phạt này?')) return;
    try {
      await api.post(`/fines/pay/${fineId}`, { paymentMethod: 'cash' });
      fetchFines();
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const filteredFines = fines.filter(f => 
    `${f.userId?.profile?.firstName} ${f.userId?.profile?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.loanId?.copyId?.bookId?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Phí phạt</h1>
          <p className="text-slate-400 mt-1">Theo dõi và xử lý các khoản đóng phạt của sinh viên.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 border-l-4 border-l-red-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{meta.totalResults || 0}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tổng số phiếu phạt</div>
            </div>
          </div>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {fines.filter(f => f.status === 'pending').length}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Khoản đang chờ</div>
            </div>
          </div>
        </div>
        <div className="premium-card p-6 border-l-4 border-l-green-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {fines.filter(f => f.status === 'paid').length}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Đã thanh toán</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên, tên sách..."
            className="premium-input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              className="premium-input w-full pl-10 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 uppercase text-[10px] font-bold tracking-widest text-slate-500">
                <th className="px-6 py-4">Sinh viên / Tài liệu</th>
                <th className="px-6 py-4">Lý do / Ngày quá hạn</th>
                <th className="px-6 py-4 text-center">Số tiền</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFines.map((fine) => (
                <tr key={fine._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                        {fine.userId?.profile?.firstName?.charAt(0)}{fine.userId?.profile?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {fine.userId?.profile?.firstName} {fine.userId?.profile?.lastName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Book className="w-3 h-3" /> {fine.loanId?.copyId?.bookId?.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">{fine.reason}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> Ngày tạo: {format(new Date(fine.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-white font-mono">
                      {fine.amount.toLocaleString('vi-VN')} đ
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {fine.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                        Đã đóng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full">
                        Chờ đóng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {fine.status === 'pending' && (
                      <button 
                        onClick={() => handleConfirmPayment(fine._id)}
                        className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors title='Xác nhận đã nộp tiền'"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-white/10 text-slate-400 rounded-lg transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFines.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    Không tìm thấy khoản phí phạt nào.
                  </td>
                </tr>
              ) }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFines;
