import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Filter, SlidersHorizontal, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import Pagination from '../components/ui/Pagination';

const LIMIT = 9;

const CATEGORIES = ['Tất cả', 'Giáo dục', 'Toán học', 'Lịch sử', 'CNTT', 'Văn học', 'Khoa học tự nhiên', 'Ngoại ngữ', 'Triết học'];

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Derive state from URL params
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page') || '1');

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setSearchParams(next);
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', {
        params: {
          title: query || undefined,
          category: category || undefined,
          page,
          limit: LIMIT,
        },
      });
      setBooks(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, page]);

  useEffect(() => {
    fetchBooks();
    // Fetch categories for sidebar
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, [fetchBooks]);

  const getAiInsight = async () => {
    if (!query.trim()) return;
    setAiLoading(true);
    try {
      const resp = await api.post('/ai/recommendations', { context: query });
      setAiInsight(resp.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query, page: '1' });
  };

  const handleCategoryChange = (cat: string) => {
    updateParams({ category: cat === 'Tất cả' ? '' : cat, page: '1' });
    if (window.innerWidth < 768) setShowFilters(false);
  };

  const handlePageChange = (p: number) => {
    updateParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allCats = [{ _id: '', name: 'Tất cả' }, ...categories];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-300 mb-6"
        >
          <Filter className="w-4 h-4" /> {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>

        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0 space-y-8`}>
          <div>
            <h3 className="hidden md:flex text-lg font-bold mb-6 items-center gap-2">
              <Filter className="w-5 h-5 text-primary" /> Bộ lọc
            </h3>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Danh mục</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-1.5">
              {allCats.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    (cat.name === 'Tất cả' && !category) || cat._id === category || cat.name === category
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-slate-400 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI Insight box */}
          <div className="premium-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Sợi chỉ đỏ
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Để AI gợi ý lộ trình nghiên cứu cho bạn dựa trên từ khóa tìm kiếm.
            </p>
            <button
              onClick={getAiInsight}
              disabled={aiLoading || !query}
              className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {aiLoading ? 'Đang phân tích...' : 'Gợi ý thông minh'}
            </button>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <form
            onSubmit={handleSearch}
            className="mb-10 relative group"
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => updateParams({ q: e.target.value, page: '1' })}
              placeholder="Tiêu đề, tác giả, ISBN..."
              className="w-full bg-surface/30 backdrop-blur-md border border-white/5 rounded-xl py-4 pl-12 pr-32 text-white focus:outline-none focus:border-primary/50 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-primary/20 hover:bg-primary/30 text-primary px-6 rounded-lg font-bold text-sm transition-all"
            >
              Tìm
            </button>
          </form>

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold tracking-tight">
              {loading ? 'Đang tìm...' : (
                <>
                  <span className="text-white">{meta.totalResults}</span>
                  <span className="text-slate-400 font-normal text-base"> kết quả tìm thấy</span>
                </>
              )}
            </h2>
            <span className="text-slate-500 text-sm">
              Trang {meta.page}/{meta.totalPages}
            </span>
          </div>

          {/* AI Insight banner */}
          <AnimatePresence>
            {aiInsight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-5 bg-primary/10 border border-primary/20 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary text-xs uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-sm italic">{aiInsight}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="premium-card h-72 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Không tìm thấy sách phù hợp</p>
              <p className="text-sm mt-1">Thử từ khóa khác hoặc chọn danh mục khác</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {books.map((book, i) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="premium-card group hover:-translate-y-1"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-slate-800 relative">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 italic">
                            <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                            <span className="text-xs">Chưa có ảnh bìa</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="bg-background/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-white border border-white/5">
                            {book.category?.name || 'Chung'}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold mb-1 text-white group-hover:text-primary transition-colors line-clamp-1">{book.title}</h3>
                      <p className="text-slate-400 text-sm mb-4">{book.author}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-green-500/10 text-green-500">
                          Sẵn có
                        </span>
                        <Link
                          to={`/books/${book._id}`}
                          className="p-1.5 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
