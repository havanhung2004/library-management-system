import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Star, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredBooks = [
  { id: '1', title: 'Giáo trình Tâm lý học Sư phạm', author: 'Nhiều tác giả', category: 'Giáo dục', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300' },
  { id: '2', title: 'Đại số Tuyến tính', author: 'Trần Văn B', category: 'Toán học', image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=300' },
  { id: '3', title: 'Lịch sử Việt Nam hiện đại', author: 'Lê Văn C', category: 'Lịch sử', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300' },
  { id: '4', title: 'Trí tuệ Nhân tạo cơ bản', author: 'Phạm Thị D', category: 'CNTT', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300' },
];

const Home: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-light text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Thư viện số thế hệ mới cho HNUE</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Khám phá Kho tàng Tri thức <br />
              <span className="text-gradient">Thông minh & Kết nối</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
              Truy cập hàng ngàn giáo trình, tài liệu số và nghiên cứu khoa học. 
              Tích hợp AI hỗ trợ tra cứu và đề xuất tài liệu cá nhân hóa cho từng sinh viên.
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm sách, tài liệu, tác giả..."
                className="w-full bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl py-4 md:py-5 pl-14 pr-32 text-sm md:text-base text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl"
              />
              <button className="absolute right-2 top-2 bottom-2 premium-button px-4 md:px-8 text-xs md:text-sm">
                Tìm kiếm
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tài liệu số', value: '50,000+', icon: BookOpen },
            { label: 'Sinh viên', value: '15,000+', icon: User },
            { label: 'Lượt mượn', value: '120,000+', icon: TrendingUp },
            { label: 'Truy cập 24/7', value: 'Online', icon: Clock },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="premium-card text-center flex flex-col items-center justify-center py-8"
            >
              <div className="bg-primary/10 p-3 rounded-xl mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="container mx-auto px-6 mb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Tài liệu Nổi bật</h2>
            <p className="text-slate-400">Những giáo trình và tài liệu được mượn nhiều nhất tuần qua</p>
          </div>
          <Link to="/search" className="text-primary hover:text-primary-light font-semibold flex items-center gap-2 transition-colors">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredBooks.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-xl shadow-black/40">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    {book.category}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{book.title}</h3>
              <p className="text-slate-500 text-sm mb-4">{book.author}</p>
              <div className="flex items-center gap-4 text-slate-400 text-xs">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> 24 bản</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-primary p-12 text-center md:text-left md:flex items-center justify-between">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 -z-0"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6">Bắt đầu học tập ngay hôm nay</h2>
            <p className="text-white/80 text-lg mb-8">
              Tham gia cùng hàng ngàn sinh viên HNUE đang sử dụng thư viện số mỗi ngày. 
              Hoàn toàn miễn phí cho cán bộ và sinh viên trường.
            </p>
            <Link to="/register" className="inline-block bg-white text-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-black/20">
              Đăng ký tài khoản
            </Link>
          </div>
          <div className="relative z-10 hidden lg:block transform mt-12 md:mt-0">
             <div className="w-64 h-80 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl rotate-12 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-white/50" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default Home;
