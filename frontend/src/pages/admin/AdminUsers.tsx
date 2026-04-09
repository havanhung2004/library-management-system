import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Edit2, Trash2, Shield, User, Mail, X, Check } from 'lucide-react';
import api from '../../lib/api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    role: '',
    profile: {
      firstName: '',
      lastName: '',
      studentId: '',
      department: '',
    }
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: {
          role: roleFilter || undefined,
        }
      });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      role: user.role,
      profile: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        studentId: user.profile?.studentId || '',
        department: user.profile?.department || '',
      }
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
      console.error('Error updating user:', err);
      alert('Đã có lỗi xảy ra khi cập nhật người dùng.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Không thể xóa người dùng này.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'librarian': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'lecturer': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Quản lý Người dùng</h1>
          <p className="text-slate-400 text-sm">Quản lý tài khoản, phân quyền và hồ sơ sinh viên/giảng viên.</p>
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full bg-background border border-white/5 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            {['', 'student', 'lecturer', 'librarian', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === role 
                    ? 'bg-primary text-white' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {role === '' ? 'Tất cả' : role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Mã số / Đơn vị</th>
                <th className="px-6 py-4">Xác thực</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-48 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-32 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-white/5 ml-auto rounded"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Users className="w-12 h-12" />
                      <p className="italic">Không tìm thấy người dùng nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.filter(user => {
                  const query = searchQuery.toLowerCase();
                  const firstName = user.profile?.firstName || '';
                  const lastName = user.profile?.lastName || '';
                  const fullName = `${firstName} ${lastName}`.toLowerCase();
                  const email = (user.email || '').toLowerCase();
                  return fullName.includes(query) || email.includes(query);
                }).map((user) => (
                  <tr key={user._id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/5">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white mb-0.5">
                            {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Chưa định danh'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-300 font-medium">{user.profile?.studentId || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{user.profile?.department || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isEmailVerified ? (
                        <div className="flex items-center gap-1.5 text-green-500 text-xs">
                          <Check className="w-3.5 h-3.5" /> Checked
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <X className="w-3.5 h-3.5" /> Pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                       <button 
                         onClick={() => handleOpenEditModal(user)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" 
                         title="Sửa quyền hạn"
                       >
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDeleteUser(user._id)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-accent" 
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

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="premium-card w-full max-w-2xl relative p-0"
             >
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                         <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Chỉnh sửa Người dùng</h2>
                   </div>
                   <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Họ</label>
                         <input
                           type="text"
                           value={editFormData.profile.firstName}
                           onChange={(e) => setEditFormData({...editFormData, profile: {...editFormData.profile, firstName: e.target.value}})}
                           className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50 text-sm"
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tên</label>
                         <input
                           type="text"
                           value={editFormData.profile.lastName}
                           onChange={(e) => setEditFormData({...editFormData, profile: {...editFormData.profile, lastName: e.target.value}})}
                           className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50 text-sm"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Phân quyền (Role)</label>
                         <select
                           value={editFormData.role}
                           onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                           className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50 text-sm appearance-none"
                         >
                            <option value="student">STUDENT</option>
                            <option value="lecturer">LECTURER</option>
                            <option value="librarian">LIBRARIAN</option>
                            <option value="admin">ADMIN</option>
                            <option value="superadmin">SUPER ADMIN</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mã số Sinh viên / CB</label>
                         <input
                           type="text"
                           value={editFormData.profile.studentId}
                           onChange={(e) => setEditFormData({...editFormData, profile: {...editFormData.profile, studentId: e.target.value}})}
                           className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50 text-sm"
                         />
                      </div>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Phòng ban / Đơn vị</label>
                      <input
                        type="text"
                        value={editFormData.profile.department}
                        onChange={(e) => setEditFormData({...editFormData, profile: {...editFormData.profile, department: e.target.value}})}
                        className="w-full bg-background border border-white/10 rounded-lg py-2 px-4 focus:outline-none focus:border-primary/50 text-sm"
                      />
                   </div>
                   
                   <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                      <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors">Hủy</button>
                      <button type="submit" className="premium-button">Cập nhật tài khoản</button>
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
