import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Tag, X } from "lucide-react";
import api from "../../lib/api";
import Pagination from "../../components/ui/Pagination";

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
      const response = await api.get("/categories", {
        params: {
          name: searchQuery || undefined,
          page: currentPage,
          limit: 10,
        },
      });
      setCategories(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
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
        await api.post("/categories", formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Đã có lỗi xảy ra khi lưu danh mục.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      console.error("Error deleting category:", err);
      alert(
        err.response?.data?.message ||
          "Không thể xóa danh mục này. Có thể có sách đang thuộc danh mục này.",
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-on-background">
            Quản lý danh mục
          </h1>
          <p className="text-on-surface/60">
            Phân loại tài liệu và sách theo chủ đề.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="premium-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Thêm danh mục
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-on-surface/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-on-surface/[0.01]">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface/[0.02] text-on-surface/50 text-[10px] font-black uppercase tracking-widest border-b border-on-surface/5">
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Mô tả chi tiết</th>
                <th className="px-6 py-4">Ngày khởi tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {loading
                ? [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-6 w-32 bg-on-surface/5 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-64 bg-on-surface/5 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-24 bg-on-surface/5 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-20 bg-on-surface/5 ml-auto rounded"></div>
                      </td>
                    </tr>
                  ))
                : categories.map((cat) => (
                    <tr
                      key={cat._id}
                      className="hover:bg-on-surface/[0.01] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-all">
                            <Tag className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-bold text-on-background group-hover:text-primary transition-colors">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-on-surface/60 line-clamp-1 italic font-medium">
                          {cat.description ||
                            "Chưa có mô tả chi tiết cho mục này"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-bold text-on-surface/40 uppercase tracking-tighter">
                        {new Date(cat.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface/40 hover:text-on-background"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-on-surface/40 hover:text-accent"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 rounded-xl border border-on-surface/10">
        <div className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">
          Hiển thị{" "}
          <span className="text-on-background">{categories.length}</span> /{" "}
          <span className="text-on-background">{meta.totalResults}</span> danh
          mục
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
              className="premium-card w-full max-w-lg relative p-0 overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-on-surface/10 bg-on-surface/[0.01]">
                <h2 className="text-xl font-bold text-on-background">
                  {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors text-on-surface/40 hover:text-on-background"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/20 transition-all text-on-surface font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                    Mô tả tóm tắt
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                  />
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-on-surface/10">
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
    </div>
  );
};

export default AdminCategories;

