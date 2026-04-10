import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Clock, History, X, Loader2, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';

interface Fine {
  _id: string;
  amount: number;
  reason: string;
  overdueDays: number;
  status: 'pending' | 'paid';
  createdAt: string;
  paymentDate?: string;
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

const Fines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const fetchFines = async () => {
    try {
      const res = await api.get('/fines/my-fines');
      setFines(res.data.data);
    } catch (error) {
      console.error('Error fetching fines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePayFine = async () => {
    if (!selectedFine) return;
    setIsPaying(true);
    try {
      await api.post(`/fines/pay/${selectedFine._id}`, { paymentMethod: 'online' });
      // Refresh
      await fetchFines();
      setIsPaymentModalOpen(false);
      setSelectedFine(null);
    } catch (error) {
      console.error('Error paying fine:', error);
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalPendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Phí phạt & Thanh toán</h1>
        <p className="text-slate-400">Quản lý và thanh toán các khoản phí phát sinh trong quá trình mượn sách.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card p-6"
          >
            <div className={`p-4 rounded-2xl mb-6 ${totalPendingAmount > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Tổng nợ cần trả</div>
              <div className={`text-3xl font-bold ${totalPendingAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {totalPendingAmount.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Số khoản phạt chưa đóng</span>
                <span className="font-bold text-white">{pendingFines.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Đã thanh toán</span>
                <span className="font-bold text-white">{fines.length - pendingFines.length}</span>
              </div>
            </div>
            
            {totalPendingAmount > 0 && (
              <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 text-xs leading-relaxed text-slate-400">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                Vui lòng thanh toán các khoản phạt trễ để tiếp tục sử dụng dịch vụ mượn sách của thư viện.
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Fines */}
          <section>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-red-500">
              <DollarSign className="w-5 h-5" /> Các khoản phí cần đóng
            </h3>
            
            <div className="space-y-4">
              {pendingFines.length === 0 ? (
                <div className="premium-card p-8 text-center text-slate-500 border-dashed border-white/10">
                  Tuyệt vời! Bạn không có khoản phí phạt nào tốn tại.
                </div>
              ) : (
                pendingFines.map((fine, i) => (
                  <motion.div
                    key={fine._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="premium-card p-6 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Quá hạn {fine.overdueDays} ngày
                      </div>
                      <h4 className="font-bold text-white">
                        {fine.loanId?.copyId?.bookId?.title || 'Tài liệu không xác định'}
                      </h4>
                      <p className="text-xs text-slate-400">{fine.reason}</p>
                      <div className="text-[10px] text-slate-500 pt-1">Phát sinh từ: {format(new Date(fine.createdAt), 'dd/MM/yyyy')}</div>
                    </div>
                    
                    <div className="text-right space-y-3">
                      <div className="text-xl font-bold text-white font-mono">
                        {fine.amount.toLocaleString('vi-VN')} đ
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedFine(fine);
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20"
                      >
                        Thanh toán
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Payment History */}
          <section>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-400">
              <History className="w-5 h-5" /> Lịch sử thanh toán
            </h3>
            <div className="premium-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 uppercase text-[10px] font-bold tracking-widest text-slate-500">
                      <th className="px-6 py-4">Chi tiết</th>
                      <th className="px-6 py-4 text-center text-xs">Phí</th>
                      <th className="px-6 py-4 text-center">Ngày thanh toán</th>
                      <th className="px-6 py-4 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fines.filter(f => f.status === 'paid').map((fine) => (
                      <tr key={fine._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-xs text-white line-clamp-1">{fine.loanId?.copyId?.bookId?.title || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400">{fine.reason}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-white font-bold font-mono">
                          {fine.amount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-6 py-4 text-center text-[10px] text-slate-400">
                          {fine.paymentDate ? format(new Date(fine.paymentDate), 'dd/MM/yyyy HH:mm') : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Thành công</span>
                        </td>
                      </tr>
                    ))}
                    {fines.filter(f => f.status === 'paid').length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic text-xs">
                          Chưa có lịch sử thanh toán.
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

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedFine && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Thanh toán phí</h3>
                </div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <div className="text-4xl font-mono font-bold text-white">
                    {selectedFine.amount.toLocaleString('vi-VN')} VNĐ
                  </div>
                  <div className="text-sm text-slate-400">
                    Nội dung: {selectedFine.reason}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phương thức thanh toán</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-primary/40 hover:bg-white/10 transition-all text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-primary">💳</div>
                        <div>
                          <div className="text-sm font-bold">Thanh toán trực tuyến</div>
                          <div className="text-[10px] text-slate-500">Giả lập cổng thanh toán online</div>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button
                    onClick={handlePayFine}
                    disabled={isPaying}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isPaying && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isPaying ? 'Đang giao dịch...' : 'Xác nhận Thanh toán'}
                  </button>
                  <p className="text-[10px] text-center text-slate-500">
                    Bằng việc nhấn thanh toán, bạn đồng ý với các quy định về mượn trả và bồi thường của thư viện HNUE.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fines;
