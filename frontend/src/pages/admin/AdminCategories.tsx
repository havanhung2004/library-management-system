import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Tag, X } from 'lucide-react';
import api from '../../lib/api';
import Pagination from '../../components/ui/Pagination';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCategories();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories', {
        params: {
          name: searchQuery || undefined,
          page: currentPage,
          limit: 10,
        }
      });
      setCategories(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Đã có lỗi xảy ra khi lưu danh mục.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Không thể xóa danh mục này. Có thể có sách đang thuộc danh mục này.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Quản lý danh mục</h1>
          <p className="text-slate-400">Phân loại tài liệu và sách theo chủ đề.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="premium-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Thêm danh mục
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
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
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-6 w-32 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-64 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 ml-auto rounded"></div></td>
                  </tr>
                ))
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <Tag className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400 line-clamp-1">{cat.description || 'Không có mô tả'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button 
                         onClick={() => handleOpenModal(cat)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" 
                         title="Sửa"
                       >
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(cat._id)}
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
          Hiển thị <span className="text-white font-medium">{categories.length}</span> trên <span className="text-white font-medium">{meta.totalResults}</span> danh mục
        </div>
        <Pagination 
          page={currentPage} 
          totalPages={meta.totalPages} 
          onPageChange={(p) => setCurrentPage(p)} 
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="premium-card w-full max-w-lg relative p-0"
             >
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                   <h2 className="text-xl font-bold">{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tên danh mục</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mô tả</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50"
                      />
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
    </div>
  );
};

export default AdminCategories;
