import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Star,
  TrendingUp,
  ArrowRight,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
const Home: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, statsRes] = await Promise.all([
          api.get("/books", { params: { limit: 4, sortBy: "createdAt:desc" } }),
          api.get("/dashboard/public-stats"),
        ]);
        setBooks(booksRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Khám phá Kho tàng Tri thức <br />
              <span className="text-gradient hover:opacity-80 transition-opacity">
                Số & Kết nối
              </span>
            </h1>
            <p className="text-on-surface/70 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
              Truy cập hàng ngàn giáo trình, tài liệu số và nghiên cứu khoa học
              phục vụ học tập và nghiên cứu cho giảng viên và sinh viên HNUE.
            </p>

            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface/40 group-focus-within:text-primary transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sách, tài liệu, tác giả..."
                className="w-full bg-surface/50 backdrop-blur-xl border border-on-surface/10 rounded-2xl py-4 md:py-5 pl-14 pr-32 text-sm md:text-base text-on-surface focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 premium-button px-4 md:px-8 text-xs md:text-sm"
              >
                Tìm kiếm
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Tài liệu số",
              value: (stats?.totalBooks || 0).toLocaleString(),
              icon: BookOpen,
            },
            {
              label: "Sinh viên",
              value: (stats?.totalStudents || 0).toLocaleString(),
              icon: User,
            },
            {
              label: "Lượt mượn",
              value: (stats?.totalLoans || 0).toLocaleString(),
              icon: TrendingUp,
            },
            { label: "Truy cập 24/7", value: "Online", icon: Clock },
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
              <div className="text-3xl font-bold text-on-background mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-on-surface/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 mb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Tài liệu Mới nhất
            </h2>
            <p className="text-on-surface/60">
              Những giáo trình và tài liệu vừa được cập nhật vào thư viện
            </p>
          </div>
          <Link
            to="/search"
            className="text-primary hover:text-primary-light font-semibold flex items-center gap-2 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-surface-hover rounded-2xl mb-6"></div>
                  <div className="h-6 bg-surface-hover rounded-lg w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-hover rounded-lg w-1/2"></div>
                </div>
              ))
            : books.map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <Link to={`/books/${book._id}`} className="block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-xl shadow-on-background/10">
                    <img
                      src={
                        book.coverImage ||
                        "https://images.unsplash.com/photo-1543003968-240974628864?auto=format&fit=crop&q=80&w=300"
                      }
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 flex flex-col gap-2 scale-90 origin-top-left">
                      <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                        {book.category?.name || "Chung"}
                      </span>
                      {book.documentUrl && (
                        <span className="bg-purple-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                          Ebook
                        </span>
                      )}
                      <span className="bg-blue-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                        Sách vật lý
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-on-surface/60 text-sm mb-4">
                    {book.author}
                  </p>
                  <div className="flex items-center gap-4 text-on-surface/60 text-xs">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {book.availableCopies}{" "}
                      bản
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{" "}
                      4.8
                    </span>
                  </div>
                </Link>
              </motion.div>
              ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-primary p-12 text-center md:text-left md:flex items-center justify-between">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 -z-0"></div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl font-bold text-white mb-6">
                Bắt đầu học tập ngay hôm nay
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Tham gia cùng hàng ngàn sinh viên HNUE đang sử dụng thư viện số
                mỗi ngày. Hoàn toàn miễn phí cho cán bộ và sinh viên trường.
              </p>
              <Link
                to="/register"
                className="inline-block bg-white text-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-black/20"
              >
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
      )}
    </div>
  );
};

export default Home;

