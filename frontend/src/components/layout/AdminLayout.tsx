import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookPlus, ClipboardList, Users, Settings, LogOut, ChevronRight, Tag, FileText, DollarSign, BarChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/admin/books', label: 'Quản lý Sách', icon: BookPlus },
  { path: '/admin/categories', label: 'Quản lý danh mục', icon: Tag },
  { path: '/admin/documents', label: 'Quản lý tài liệu', icon: FileText },
  { path: '/admin/loans', label: 'Quản lý mượn/trả', icon: ClipboardList },
  { path: '/admin/fines', label: 'Quản lý phí phạt', icon: DollarSign },
  { path: '/admin/users', label: 'Người dùng', icon: Users },
  { path: '/admin/reports', label: 'Thống kê & Báo cáo', icon: BarChart },
  { path: '/admin/settings', label: 'Cấu hình', icon: Settings },
];

import AdminHeader from '../admin/AdminHeader';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background text-slate-200">
      {/* Sidebar */}
      <aside className="w-72 bg-surface/50 backdrop-blur-3xl border-r border-white/5 flex flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="bg-primary p-2 rounded-lg">
               <span className="font-bold text-white text-xl">H</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Admin <span className="text-primary italic">Panel</span></span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {location.pathname === item.path && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Top Header */}
        <AdminHeader />

        {/* Dynamic Content */}
        <main className="p-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
