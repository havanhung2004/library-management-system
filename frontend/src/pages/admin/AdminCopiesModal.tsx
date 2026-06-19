import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Hash,
  MapPin,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import api from "../../lib/api";

interface AdminCopiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  book: {
    _id: string;
    title: string;
  } | null;
}

const AdminCopiesModal: React.FC<AdminCopiesModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  book,
}) => {
  const [copies, setCopies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    barcode: "",
    location: "",
    status: "available",
  });

  useEffect(() => {
    if (isOpen && book) {
      fetchCopies();
    }
  }, [isOpen, book]);

  const fetchCopies = async () => {
    if (!book) return;
    setLoading(true);
    try {
      const response = await api.get(`/books/${book._id}/copies`);
      setCopies(response.data.data);
    } catch (err) {
      console.error("Error fetching copies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setAdding(true);
    try {
      await api.post(`/books/${book._id}/copies`, formData);
      setFormData({ barcode: "", location: "", status: "available" });
      fetchCopies();
    } catch (err: any) {
      console.error("Error adding copy:", err);
      alert(err.response?.data?.message || "Không thể thêm bản sao.");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStatus = async (copyId: string, status: string) => {
    if (!book) return;

    try {
      await api.patch(`/books/${book._id}/copies/${copyId}`, { status });

      await fetchCopies();
    } catch (err: any) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái.");
    }
  };
  const handleDeleteCopy = async (copyId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bản sao này?")) return;
    try {
      await api.delete(`/books/copies/${copyId}`);
      fetchCopies();
    } catch (err) {
      console.error("Error deleting copy:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Sẵn có
          </span>
        );
      case "borrowed":
        return (
          <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Đang mượn
          </span>
        );
      case "lost":
        return (
          <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Mất
          </span>
        );
      case "damaged":
        return (
          <span className="text-[10px] font-bold text-orange-500 uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Hỏng
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="premium-card w-full max-w-4xl relative p-0 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-on-surface/10 flex justify-between items-center bg-on-surface/[0.02]">
              <div>
                <h2 className="text-xl font-bold">Quản lý bản sao</h2>
                <p className="text-xs text-on-surface/50 mt-1 uppercase tracking-widest font-black">
                  {book?.title}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRefresh?.();
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Form Side */}
              <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-on-surface/10 bg-on-surface/[0.02]">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Thêm bản sao mới
                </h3>
                <form onSubmit={handleAddCopy} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface/50 uppercase block mb-1.5">
                      Mã vạch (Barcode) *
                    </label>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface/50 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="VD: SP00123"
                        value={formData.barcode}
                        onChange={(e) =>
                          setFormData({ ...formData, barcode: e.target.value })
                        }
                        className="w-full bg-background border border-on-surface/15 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface/50 uppercase block mb-1.5">
                      Vị trí (Location)
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface/50 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="VD: Kệ A1, Tầng 2"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full bg-background border border-on-surface/15 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface/50 uppercase block mb-1.5">
                      Trạng thái ban đầu
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full bg-background border border-on-surface/15 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary/50 appearance-none"
                    >
                      <option value="available">Sẵn có (Available)</option>
                      <option value="lost">Đã mất (Lost)</option>
                      <option value="damaged">Bị hỏng (Damaged)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full premium-button py-2.5 mt-2 flex items-center justify-center gap-2"
                  >
                    {adding ? (
                      <div className="w-4 h-4 border-2 border-on-surface/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Lưu bản sao</span>
                  </button>
                </form>
              </div>

              {/* List Side */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-on-surface/5 rounded-xl animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : copies.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-2">
                    <Trash2 className="w-12 h-12" />
                    <p>Chưa có bản sao nào được đăng ký.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {copies.map((copy) => (
                      <div
                        key={copy._id}
                        className="p-4 rounded-xl bg-on-surface/[0.02] border border-on-surface/10 flex items-center justify-between group hover:border-on-surface/15 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-on-surface/10">
                            <Hash className="w-5 h-5 text-on-surface/50" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-on-background line-clamp-1">
                                {copy.barcode}
                              </p>
                              {getStatusBadge(copy.status)}
                            </div>
                            <p className="text-[10px] text-on-surface/50 flex items-center gap-1 uppercase tracking-widest">
                              <MapPin className="w-2.5 h-2.5" />{" "}
                              {copy.location || "Chưa xác định"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {copy.status === "borrowed" ? (
                            <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Đang mượn
                            </span>
                          ) : (
                            <select
                              value={copy.status}
                              onChange={(e) =>
                                handleUpdateStatus(copy._id, e.target.value)
                              }
                              className="bg-transparent text-[10px] font-bold border-none focus:ring-0 uppercase cursor-pointer hover:text-on-background transition-colors"
                            >
                              <option value="available">Sẵn có</option>
                              <option value="lost">Đã mất</option>
                              <option value="damaged">Bị hỏng</option>
                            </select>
                          )}
                          <div className="h-8 w-px bg-on-surface/5 mx-2"></div>

                          <button
                            onClick={() => handleDeleteCopy(copy._id)}
                            className="p-2 rounded-lg hover:bg-accent/10 text-on-surface/50 hover:text-accent transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminCopiesModal;
