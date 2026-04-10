import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Search, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import Pagination from '../../components/ui/Pagination';

const AdminLoans: React.FC = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
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
      const response = await api.get('/loans', {
        params: {
          status: filterStatus !== 'Tất cả' ? filterStatus : undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 10,
        }
      });
      setLoans(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (!window.confirm('Xác nhận trả sách?')) return;
    try {
      await api.post(`/loans/return/${loanId}`);
      fetchLoans();
    } catch (err) {
      console.error('Error returning book:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1 tracking-tight">Quản lý Mượn/Trả</h1>
        <p className="text-slate-400">Theo dõi trạng thái các bản ghi mượn sách trong toàn hệ thống.</p>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 text-sm">
            {['Tất cả', 'Đang mượn', 'Quá hạn', 'Đã trả'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filterStatus === tab ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo người mượn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-white/5 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Người mượn</th>
                <th className="px-6 py-4">Sách</th>
                <th className="px-6 py-4">Ngày mượn</th>
                <th className="px-6 py-4">Hạn trả</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-6 w-32 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-48 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 ml-auto rounded"></div></td>
                  </tr>
                ))
              ) : (
                loans.map((loan) => {
                  const firstName = loan.userId?.profile?.firstName || 'Mượn bởi';
                  const lastName = loan.userId?.profile?.lastName || 'Người dùng';
                  const bookTitle = loan.copyId?.bookId?.title || 'Đầu sách không xác định';
                  const borrowDate = new Date(loan.createdAt).toLocaleDateString('vi-VN');
                  const dueDate = new Date(loan.dueDate).toLocaleDateString('vi-VN');
                  
                  return (
                  <tr key={loan._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          {firstName[0]}{lastName[0]}
                        </div>
                        <span className="font-medium text-white">{firstName} {lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <BookOpen className="w-4 h-4 text-primary opacity-50" />
                        <span className="text-sm line-clamp-1">{bookTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{borrowDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{dueDate}</td>
                    <td className="px-6 py-4 text-sm">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         loan.status === 'active' 
                           ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                           : loan.status === 'returned'
                           ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                           : 'bg-red-500/10 text-red-500 border border-red-500/20'
                       }`}>
                          <Clock className="w-3 h-3" />
                          {loan.status === 'active' ? 'Đang mượn' : loan.status === 'returned' ? 'Đã trả' : 'Quá hạn'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {loan.status === 'active' ? (
                         <button 
                           onClick={() => handleReturn(loan._id)}
                           className="px-4 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto"
                         >
                            <CheckCircle className="w-3 h-3" /> Xác nhận trả
                         </button>
                       ) : (
                         <span className="text-xs font-medium text-slate-500">
                           Đã hoàn thành
                         </span>
                       )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface/30 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <div className="text-sm text-slate-400">
          Hiển thị <span className="text-white font-medium">{loans.length}</span> trên <span className="text-white font-medium">{meta.totalResults}</span> bản ghi
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
