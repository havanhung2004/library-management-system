import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, Calendar, Hash, FileText, Download, CheckCircle, AlertCircle, ArrowLeft, Bookmark } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const BookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [message, setMessage] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${bookId}`);
        setBook(response.data.data);
      } catch (err) {
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBorrowing(true);
    setMessage('');
    try {
      const response = await api.post('/loans/borrow', { 
        bookId: bookId,
        durationDays: 14 // Default duration
      });
      setMessage('Yêu cầu mượn đã được thực hiện thành công!');
      // Optional: Refresh book status if needed
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện mượn sách.');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) return <div className="p-12 text-center text-white">Không tìm thấy sách.</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <Link to="/search" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12">
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
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             ) : (
                <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                  <BookOpen className="w-32 h-32 text-slate-700 opacity-20" />
                </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
             <div className="absolute bottom-6 left-6 right-6">
                <span className="premium-button w-full block text-center bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 group">
                   <Bookmark className="w-4 h-4 inline-block mr-2 group-hover:fill-current" /> Lưu vào danh sách
                </span>
             </div>
          </div>

          <div className="premium-card space-y-4">
             <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
               <span className="text-slate-500 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sẵn có</span>
               <span className="font-bold">12 bản</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
               <span className="text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" /> Loại</span>
               <span className="font-bold">Giáo trình</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 flex items-center gap-2"><Hash className="w-4 h-4 text-secondary" /> ISBN</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">{book.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <span className="flex items-center gap-2 text-primary-light font-medium"><User className="w-5 h-5" /> {book.author}</span>
              <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> {book.publishedYear || '2024'}</span>
              <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{book.category?.name || 'Khác'}</span>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Mô tả</h3>
              <p className="text-slate-300 leading-relaxed text-lg italic opacity-90">
                {book.description || 'Chưa có mô tả cho cuốn sách này. Đây là một tài liệu quan trọng trong chương trình đào tạo của Đại học Sư phạm Hà Nội, cung cấp các kiến thức nền tảng và nâng cao cho sinh viên.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="premium-card bg-surface/20 group hover:border-primary/50 transition-all">
                <FileText className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Tài liệu số (PDF)</h4>
                <p className="text-slate-400 text-sm mb-6">Đọc trực tuyến hoặc tải về cho mục đích học tập cá nhân.</p>
                <button className="premium-button w-full flex items-center justify-center gap-2">
                   <Download className="w-4 h-4" /> Tải về máy
                </button>
              </div>

              <div className="premium-card bg-surface/20 group hover:border-secondary/50 transition-all">
                <BookOpen className="w-8 h-8 text-secondary mb-4" />
                <h4 className="font-bold text-lg mb-2">Sách vật lý</h4>
                <p className="text-slate-400 text-sm mb-6">Mượn sách trực tiếp tại quầy thư viện khu A1.</p>
                <button 
                  onClick={handleBorrow}
                  disabled={borrowing}
                  className="premium-button bg-secondary hover:bg-secondary/80 w-full flex items-center justify-center gap-2 shadow-secondary/20"
                >
                   {borrowing ? 'Đang xử lý...' : 'Mượn sách'}
                </button>
              </div>
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 flex items-center gap-4"
              >
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium text-lg">{message}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetails;
