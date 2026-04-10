import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, BookOpen, X, Upload, CheckCircle, Boxes } from 'lucide-react';
import api from '../../lib/api';
import AdminCopiesModal from './AdminCopiesModal';
import Pagination from '../../components/ui/Pagination';

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
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
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        api.get('/books', {
          params: {
            page: currentPage,
            limit: 10,
            title: searchQuery || undefined,
          }
        }),
        api.get('/categories')
      ]);
      setBooks(booksRes.data.data);
      setMeta(booksRes.data.meta);
      setCategories(catsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
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
        category: book.category?._id || '',
        description: book.description || '',
      });
      setCoverPreview(book.coverImage || null);
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: categories[0]?._id || '',
        description: '',
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
        const res = await api.post('/books', formData);
        bookId = res.data.data._id;
      }

      // Upload cover if selected
      if (coverFile && bookId) {
        const coverFormData = new FormData();
        coverFormData.append('coverImage', coverFile);
        await api.post(`/books/${bookId}/cover`, coverFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving book:', err);
      alert('Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sách này?')) return;
    try {
      await api.delete(`/books/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Không thể xóa sách này.');
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
    uploadFormData.append('document', file);

    try {
      await api.post(`/books/${targetBookId}/upload`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess(true);
      fetchData();
      setTimeout(() => setShowUploadModal(false), 2000);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Tải lên thất bại. Vui lòng thử lại.');
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
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Quản lý kho sách</h1>
          <p className="text-slate-400">Danh sách toàn bộ đầu sách và tài liệu trong hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="premium-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Thêm sách mới
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
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
                <th className="px-6 py-4">Sách</th>
                <th className="px-6 py-4">ISBN</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Tài liệu số</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-48 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 ml-auto rounded"></div></td>
                  </tr>
                ))
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Không tìm thấy sách phù hợp.</td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-slate-800 rounded flex items-center justify-center overflow-hidden">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{book.title}</div>
                          <div className="text-xs text-slate-500">{book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{book.isbn}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm px-2 py-1 bg-white/5 rounded-md border border-white/5">
                        {book.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {book.documentUrl ? (
                        <a 
                          href={book.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <BookOpen className="w-3 h-3" /> Xem tài liệu
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-500/10 text-slate-500 italic">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button 
                         onClick={() => handleOpenCopies(book)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-secondary" 
                         title="Quản lý bản sao (Copies)"
                       >
                          <Boxes className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleOpenUpload(book._id)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-primary" 
                         title="Tải lên tài liệu Cloudinary"
                       >
                          <Upload className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleOpenModal(book)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" 
                         title="Sửa"
                       >
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(book._id)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-accent" 
                         title="Xóa"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface/30 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <div className="text-sm text-slate-400">
          Hiển thị <span className="text-white font-medium">{books.length}</span> trên <span className="text-white font-medium">{meta.totalResults}</span> cuốn sách
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
               className="premium-card w-full max-w-xl relative p-0"
             >
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                   <h2 className="text-xl font-bold">{editingBook ? 'Cập nhật thông tin sách' : 'Thêm sách mới'}</h2>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                   <div className="flex flex-col md:flex-row gap-6">
                      {/* Cover Upload Area */}
                      <div className="w-full md:w-40 flex-shrink-0">
                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block text-center">Ảnh bìa</label>
                         <div 
                           onClick={() => coverInputRef.current?.click()}
                           className="w-full aspect-[3/4] bg-white/5 border-2 border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center group relative"
                         >
                            {coverPreview ? (
                               <>
                                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <Upload className="w-6 h-6 text-white" />
                                  </div>
                               </>
                            ) : (
                               <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-primary transition-colors">
                                  <Plus className="w-6 h-6" />
                                  <span className="text-[10px] font-bold">TẢI ẢNH</span>
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
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tiêu đề</label>
                           <input
                             type="text"
                             required
                             value={formData.title}
                             onChange={(e) => setFormData({...formData, title: e.target.value})}
                             className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tác giả</label>
                           <input
                             type="text"
                             required
                             value={formData.author}
                             onChange={(e) => setFormData({...formData, author: e.target.value})}
                             className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">ISBN</label>
                           <input
                             type="text"
                             required
                             value={formData.isbn}
                             onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                             className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50"
                           />
                        </div>
                        <div className="col-span-2">
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Danh mục</label>
                           <select
                             required
                             value={formData.category}
                             onChange={(e) => setFormData({...formData, category: e.target.value})}
                             className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50 appearance-none"
                           >
                              <option value="" disabled>Chọn danh mục...</option>
                              {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                              ))}
                           </select>
                        </div>
                        <div className="col-span-2">
                           <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mô tả ngắn</label>
                           <textarea
                             rows={3}
                             value={formData.description}
                             onChange={(e) => setFormData({...formData, description: e.target.value})}
                             className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50"
                           />
                        </div>
                     </div>
                   </div>
                   
                   <div className="pt-6 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors">Hủy</button>
                      <button type="submit" className="premium-button">Lưu lại</button>
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
               className="premium-card w-full max-w-md relative p-8 text-center"
             >
                <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {uploadSuccess ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Upload className="w-8 h-8 text-primary" />}
                  </div>
                  <h2 className="text-xl font-bold">{uploadSuccess ? 'Tải lên thành công!' : 'Tải lên tài liệu số'}</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {uploadSuccess ? 'Tài liệu đã được lưu trữ an toàn trên Cloudinary.' : 'Hỗ trợ định dạng PDF, EPUB, MOBI (Max 50MB)'}
                  </p>
                </div>

                {!uploadSuccess && (
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept=".pdf,.epub,.mobi"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 group"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                           <span className="text-sm font-medium">Đang tải lên Cloudinary...</span>
                        </div>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">Chọn tệp từ máy tính</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setShowUploadModal(false)}
                      className="w-full py-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
                    >
                      Bỏ qua
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
        book={selectedBookForCopies}
      />
    </div>
  );
};

export default AdminBooks;
