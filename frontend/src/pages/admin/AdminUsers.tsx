import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Edit2,
  Trash2,
  Shield,
  User,
  Mail,
  X,
  Check,
} from "lucide-react";
import api from "../../lib/api";
import Pagination from "../../components/ui/Pagination";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalResults: 0 });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    role: "",
    profile: {
      firstName: "",
      lastName: "",
      studentId: "",
      department: "",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users", {
        params: {
          role: roleFilter || undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 10,
        },
      });
      setUsers(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role,
      profile: {
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        studentId: user.profile?.studentId || "",
        department: user.profile?.department || "",
      },
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${selectedUser._id}`, editFormData);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Đã có lỗi xảy ra khi cập nhật người dùng.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.",
      )
    )
      return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Không thể xóa người dùng này.");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "librarian":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "lecturer":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-on-surface/10 text-on-surface/60 border-on-surface/20";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-on-background">
            Quản lý Người dùng
          </h1>
          <p className="text-on-surface/60 text-sm">
            Quản lý tài khoản, phân quyền và hồ sơ sinh viên/giảng viên.
          </p>
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-on-surface/10 flex flex-col lg:flex-row gap-4 justify-between items-center bg-on-surface/[0.01]">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            {["", "student", "lecturer", "librarian", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === role
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-on-surface/5 text-on-surface/60 hover:bg-on-surface/10"
                }`}
              >
                {role === "" ? "Tất cả" : role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface/[0.02] text-on-surface/50 text-[10px] font-black uppercase tracking-widest border-b border-on-surface/5">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Mã số / Đơn vị</th>
                <th className="px-6 py-4">Xác thực</th>
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
                      <div className="h-6 w-20 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-32 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-20 bg-on-surface/5 ml-auto rounded"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Users className="w-12 h-12 text-on-surface" />
                      <p className="italic text-on-surface">
                        Không tìm thấy người dùng nào.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-on-surface/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center border border-on-surface/10 group-hover:border-primary/20 transition-all">
                          <User className="w-5 h-5 text-on-surface/60 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-on-background mb-0.5">
                            {user.profile?.firstName
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : "Chưa định danh"}
                          </p>
                          <p className="text-xs text-on-surface/50 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-on-surface/80 font-medium">
                          {user.profile?.studentId || "N/A"}
                        </p>
                        <p className="text-xs text-on-surface/50">
                          {user.profile?.department || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isEmailVerified ? (
                        <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" /> CHECKED
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-on-surface/40 text-xs font-medium">
                          <X className="w-3.5 h-3.5" /> PENDING
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-on-surface/40 hover:text-primary"
                        title="Sửa quyền hạn"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-on-surface/40 hover:text-accent"
                        title="Xóa tài khoản"
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

      <div className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 rounded-xl border border-on-surface/10">
        <div className="text-xs font-medium text-on-surface/50 uppercase tracking-wider">
          Hiển thị <span className="text-on-background">{users.length}</span> /{" "}
          <span className="text-on-background">{meta.totalResults}</span> người
          dùng
        </div>
        <Pagination
          page={currentPage}
          totalPages={meta.totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-2xl relative p-0 overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-on-surface/10 bg-on-surface/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-on-background">
                    Chỉnh sửa Người dùng
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors text-on-surface/40 hover:text-on-background"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                      Họ
                    </label>
                    <input
                      type="text"
                      value={editFormData.profile.firstName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          profile: {
                            ...editFormData.profile,
                            firstName: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                      Tên
                    </label>
                    <input
                      type="text"
                      value={editFormData.profile.lastName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          profile: {
                            ...editFormData.profile,
                            lastName: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                      Phân quyền (Role)
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value,
                        })
                      }
                      className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm appearance-none cursor-pointer text-on-surface"
                    >
                      <option value="student">STUDENT</option>
                      <option value="lecturer">LECTURER</option>
                      <option value="librarian">LIBRARIAN</option>
                      <option value="admin">ADMIN</option>
                      <option value="superadmin">SUPER ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                      Mã số Sinh viên / CB
                    </label>
                    <input
                      type="text"
                      value={editFormData.profile.studentId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          profile: {
                            ...editFormData.profile,
                            studentId: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest mb-2 block">
                    Phòng ban / Đơn vị
                  </label>
                  <input
                    type="text"
                    value={editFormData.profile.department}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        profile: {
                          ...editFormData.profile,
                          department: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                  />
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-on-surface/10">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 rounded-lg font-bold text-on-surface/60 hover:bg-on-surface/5 transition-all"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="premium-button">
                    Cập nhật tài khoản
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

export default AdminUsers;

