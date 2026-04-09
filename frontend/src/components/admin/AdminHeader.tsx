import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { User } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-surface/30 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Placeholder for breadcrumbs or page title if needed */}
        <div className="h-8 w-1 bg-primary/50 rounded-full"></div>
        <span className="text-sm font-medium text-slate-400">Hệ thống quản lý thư viện số</span>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />
        
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none mb-1">{user?.profile?.firstName} {user?.profile?.lastName}</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
            <User className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
