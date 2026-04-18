import React, { useState, useEffect, useCallback } from "react";
import {
  Search as SearchIcon,
  Filter,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import Pagination from "../components/ui/Pagination";

const LIMIT = 9;

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  // Derive state from URL params
  const query = searchParams.get("q") || searchParams.get("title") || "";
  const categoryId = searchParams.get("category") || "";
  const format = searchParams.get("format") || "";
  const page = Number(searchParams.get("page") || "1");

  const [showFilters, setShowFilters] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setSearchParams(next);
  };

  // Sync internal input value with URL param (e.g. from homepage or back/forward buttons)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Handle debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== query) {
        updateParams({ q: inputValue, page: "1" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, query]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/books", {
        params: {
          q: query || undefined,
          category: categoryId || undefined,
          format: format || undefined,
          page,
          limit: LIMIT,
        },
      });
      setBooks(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  }, [query, categoryId, format, page]);

  useEffect(() => {
    fetchBooks();
    // Fetch categories for sidebar
    api
      .get("/categories")
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
  }, [fetchBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query, page: "1" });
  };

  const handleCategoryChange = (catId: string) => {
    updateParams({ category: catId, page: "1" });
    if (window.innerWidth < 768) setShowFilters(false);
  };

  const handlePageChange = (p: number) => {
    updateParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allCats = [{ _id: "", name: "Tất cả" }, ...categories];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full py-3 bg-surface/50 border border-on-surface/10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-on-surface mb-6"
        >
          <Filter className="w-4 h-4" />{" "}
          {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </button>

        {/* Sidebar */}
        <aside
          className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0 space-y-8`}
        >
          <div>
            <h3 className="hidden md:flex text-lg font-bold mb-6 items-center gap-2">
              <Filter className="w-5 h-5 text-primary" /> Bộ lọc
            </h3>
            <label className="text-xs font-bold text-on-surface/50 uppercase tracking-wider mb-3 block">
              Danh mục
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-1.5">
              {allCats.map((cat) => (
                <button
                  key={cat._id || "all"}
                  onClick={() => handleCategoryChange(cat._id)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    cat._id === categoryId
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-on-surface/60 hover:bg-surface-hover border border-transparent"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface/50 uppercase tracking-wider mb-3 block">
              Loại tài liệu
            </label>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "", name: "Tất cả" },
                { id: "physical", name: "Sách vật lý" },
                { id: "ebook", name: "Ebook" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateParams({ format: f.id, page: "1" })}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    f.id === format
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-on-surface/60 hover:bg-surface-hover border border-transparent"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <form onSubmit={handleSearch} className="mb-10 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface/40 group-focus-within:text-primary transition-colors">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tiêu đề, tác giả, ISBN..."
              className="w-full bg-surface/30 backdrop-blur-md border border-on-surface/10 rounded-xl py-4 pl-12 pr-32 text-on-surface focus:outline-none focus:border-primary/50 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-primary/20 hover:bg-primary/30 text-primary px-6 rounded-lg font-bold text-sm transition-all"
            >
              Tìm
            </button>
          </form>

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold tracking-tight text-on-background">
              {loading ? (
                "Đang tìm..."
              ) : (
                <>
                  <span className="text-primary">{meta.totalResults}</span>
                  <span className="text-on-surface/60 font-normal text-base">
                    {" "}
                    kết quả tìm thấy
                  </span>
                </>
              )}
            </h2>
            <span className="text-on-surface/50 text-sm">
              Trang {meta.page}/{meta.totalPages}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div
                  key={i}
                  className="premium-card h-72 animate-pulse bg-surface-hover"
                />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 text-on-surface/50">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Không tìm thấy sách phù hợp</p>
              <p className="text-sm mt-1">
                Thử từ khóa khác hoặc chọn danh mục khác
              </p>
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
                      <Link to={`/books/${book._id}`} className="block">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-surface-hover relative">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface/40 italic">
                              <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                              <span className="text-xs">Chưa có ảnh bìa</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 scale-90 origin-top-right">
                            <span className="bg-primary/90 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-white border border-white/10 shadow-lg">
                              {book.category?.name || "Chung"}
                            </span>
                            {book.documentUrl && (
                              <span className="bg-purple-500/90 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-white border border-white/10 shadow-lg">
                                Ebook
                              </span>
                            )}
                            <span className="bg-blue-500/90 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-white border border-white/10 shadow-lg">
                              Sách vật lý
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold mb-1 text-on-background group-hover:text-primary transition-colors line-clamp-1">
                          {book.title}
                        </h3>
                        <p className="text-on-surface/60 text-sm mb-4">
                          {book.author}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-on-surface/5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            book.availableCopies > 0 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-accent/10 text-accent"
                          }`}>
                            {book.availableCopies > 0 ? `${book.availableCopies} BẢN` : "HẾT SÁCH"}
                          </span>
                          <div className="p-1.5 bg-surface-hover rounded-full hover:bg-primary hover:text-white transition-all text-on-surface/60">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;

