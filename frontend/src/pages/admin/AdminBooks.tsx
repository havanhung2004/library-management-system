import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  X,
  Upload,
  CheckCircle,
  Boxes,
} from "lucide-react";
import api from "../../lib/api";
import AdminCopiesModal from "./AdminCopiesModal";
import Pagination from "../../components/ui/Pagination";
import Select from "react-select";
const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCopiesModal, setShowCopiesModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [editingBook, setEditingBook] = useState<any>(null);
  const [selectedBookForCopies, setSelectedBookForCopies] = useState<any>(null);
  const [targetBookId, setTargetBookId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formatFilter, setFormatFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, formatFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        api.get("/books", {
          params: {
            page: currentPage,
            limit: 10,
            title: searchQuery || undefined,
            format: formatFilter || undefined,
          },
        }),
        api.get("/categories", {
          params: {
            page: 1,
            limit: 999,
          },
        }),
      ]);
      setBooks(booksRes.data.data);
      setMeta(booksRes.data.meta);
      setCategories(catsRes.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book: any = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category?._id || "",
        description: book.description || "",
      });
      setCoverPreview(book.coverImage || null);
    } else {
      setEditingBook(null);
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: categories[0]?._id || "",
        description: "",
      });
      setCoverPreview(null);
    }
    setCoverFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let bookId = editingBook?._id;

      if (editingBook) {
        await api.patch(`/books/${editingBook._id}`, formData);
      } else {
        const res = await api.post("/books", formData);
        bookId = res.data.data._id;
      }

      // Upload cover if selected
      if (coverFile && bookId) {
        const coverFormData = new FormData();
        coverFormData.append("coverImage", coverFile);
        await api.post(`/books/${bookId}/cover`, coverFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Error saving book:", err);
      alert("Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sách này?")) return;
    try {
      await api.delete(`/books/${id}`);
      fetchData();
    } catch (err: any) {
      console.error("Error deleting book:", err);
      alert(err.response?.data?.message || "Không thể xóa sách này.");
    }
  };

  const handleOpenUpload = (bookId: string) => {
    setTargetBookId(bookId);
    setUploadSuccess(false);
    setShowUploadModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetBookId) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("document", file);

    try {
      await api.post(`/books/${targetBookId}/upload`, uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadSuccess(true);
      fetchData();
      setTimeout(() => setShowUploadModal(false), 2000);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCopies = (book: any) => {
    setSelectedBookForCopies(book);
    setShowCopiesModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-on-background">
            Quản lý kho sách
          </h1>
          <p className="text-on-surface/60">
            Danh sách toàn bộ đầu sách và tài liệu trong hệ thống.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="premium-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Thêm sách mới
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-on-surface/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-on-surface/[0.01]">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface"
              />
            </div>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface font-medium cursor-pointer"
            >
              <option value="">Tất cả loại sách</option>
              <option value="ebook">Ebook</option>
              <option value="physical">Sách vật lý</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface/[0.02] text-on-surface/50 text-[10px] font-black uppercase tracking-widest border-b border-on-surface/5">
                <th className="px-6 py-4">Sách</th>
                <th className="px-6 py-4">ISBN</th>
                <th className="px-6 py-4 min-w-[120px]">Danh mục</th>
                <th className="px-6 py-4 text-center w-[100px] whitespace-nowrap">
                  Bản sao
                </th>
                <th className="px-6 py-4">Định dạng</th>
                <th className="px-6 py-4">Tài liệu số</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-10 w-48 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4 min-w-[150px]">
                      <div className="h-6 w-20 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-12 bg-on-surface/5 rounded "></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-on-surface/5 ml-auto rounded"></div>
                    </td>
                  </tr>
                ))
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20 text-on-surface">
                      <BookOpen className="w-12 h-12" />
                      <p className="italic">Không tìm thấy sách phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book._id}
                    className="hover:bg-on-surface/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-surface-hover rounded flex items-center justify-center overflow-hidden border border-on-surface/5 group-hover:border-primary/20 transition-all">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-on-surface/20 group-hover:text-primary/40 transition-colors" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-on-background group-hover:text-primary transition-colors">
                            {book.title}
                          </div>
                          <div className="text-xs text-on-surface/50 font-medium">
                            {book.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-on-surface/60 font-semibold">
                      {book.isbn}
                    </td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <span className="text-[11px] font-bold px-2 py-1 bg-on-surface/5 rounded text-on-surface/70 border border-on-surface/10 uppercase tracking-tight">
                        {book.category?.name || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col">
                        <span
                          className={`font-bold ${
                            book.availableCopies === 0
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {book.documentUrl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded uppercase tracking-tighter">
                            Ebook
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded uppercase tracking-tighter">
                          Vật lý
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {book.documentUrl ? (
                        <a
                          href={book.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> XEM PDF
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-on-surface/5 text-on-surface/30 italic uppercase tracking-widest">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-1 justify-items-center w-fit ml-auto">
                        <button
                          onClick={() => handleOpenCopies(book)}
                          className="p-2 hover:bg-secondary/10 rounded-lg transition-colors text-on-surface/40 hover:text-secondary"
                          title="Quản lý bản sao (Copies)"
                        >
                          <Boxes className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenUpload(book._id)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-on-surface/40 hover:text-primary"
                          title="Tải lên tài liệu"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(book)}
                          className="p-2 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface/40 hover:text-on-background"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-on-surface/40 hover:text-accent"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 rounded-xl border border-on-surface/10">
        <div className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">
          Hiển thị <span className="text-on-background">{books.length}</span> /{" "}
          <span className="text-on-background">{meta.totalResults}</span> sách
        </div>
        <Pagination
          page={currentPage}
          totalPages={meta.totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Book Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-2xl relative p-0 overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-on-surface/10 bg-on-surface/[0.01]">
                <h2 className="text-xl font-bold text-on-background">
                  {editingBook ? "Cập nhật thông tin sách" : "Thêm sách mới"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors text-on-surface/40 hover:text-on-background"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Cover Upload Area */}
                  <div className="w-full md:w-44 flex-shrink-0">
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block text-center">
                      Ảnh bìa
                    </label>
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full aspect-[3/4] bg-on-surface/[0.03] border-2 border-dashed border-on-surface/15 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center group relative shadow-inner"
                    >
                      {coverPreview ? (
                        <>
                          <img
                            src={coverPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-on-surface/30 group-hover:text-primary transition-colors">
                          <div className="p-3 bg-on-surface/5 rounded-full">
                            <Plus className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-black tracking-widest uppercase">
                            Tải lên bìa
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  {/* Info Fields */}
                  <div className="flex-1 grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                        Tiêu đề sách
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-on-surface font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                        Tác giả
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) =>
                          setFormData({ ...formData, author: e.target.value })
                        }
                        className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-on-surface font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                        ISBN / Code
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.isbn}
                        onChange={(e) =>
                          setFormData({ ...formData, isbn: e.target.value })
                        }
                        className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-on-surface font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                        Danh mục chuyên ngành
                      </label>
                      <Select
                        options={categories.map((cat) => ({
                          value: cat._id,
                          label: cat.name,
                        }))}
                        value={categories
                          .map((cat) => ({
                            value: cat._id,
                            label: cat.name,
                          }))
                          .find((c) => c.value === formData.category)}
                        onChange={(option) =>
                          setFormData({
                            ...formData,
                            category: option?.value || "",
                          })
                        }
                        placeholder="Chọn danh mục..."
                        maxMenuHeight={250}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                        Mô tả tóm tắt
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-on-surface text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end gap-3 border-t border-on-surface/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 rounded-lg font-bold text-on-surface/60 hover:bg-on-surface/5 transition-all"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="premium-button">
                    Lưu cấu hình
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="premium-card w-full max-w-md relative p-10 text-center shadow-2xl"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-on-surface/5 rounded-lg transition-colors text-on-surface/40"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  {uploadSuccess ? (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  ) : (
                    <Upload className="w-10 h-10 text-primary" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-on-background">
                  {uploadSuccess ? "Tải lên hoàn tất!" : "Tải lên File PDF"}
                </h2>
                <p className="text-on-surface/60 text-sm mt-2 leading-relaxed">
                  {uploadSuccess
                    ? "Tài liệu đã được lưu trữ an toàn trên mạng lưới tri thức."
                    : "Định dạng được hỗ trợ: PDF, EPUB, DOCX. Dung lượng tối đa 50MB."}
                </p>
              </div>

              {!uploadSuccess && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.epub,.docx"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-6 border-2 border-dashed border-on-surface/15 rounded-2xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all flex flex-col items-center gap-3 group"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-primary">
                          Đang đồng bộ Cloudinary...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-on-surface/5 rounded-full group-hover:bg-primary/10 transition-all">
                          <Plus className="w-8 h-8 text-on-surface/40 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-on-surface/60 group-hover:text-on-background">
                          CHỌN TỆP TỪ THIẾT BỊ
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="w-full py-2.5 text-xs font-black tracking-widest text-on-surface/40 hover:text-accent transition-all uppercase"
                  >
                    Hủy bỏ
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminCopiesModal
        isOpen={showCopiesModal}
        onClose={() => setShowCopiesModal(false)}
        onRefresh={fetchData}
        book={selectedBookForCopies}
      />
    </div>
  );
};

export default AdminBooks;
