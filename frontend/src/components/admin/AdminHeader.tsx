import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "../ui/ThemeToggle";
import { User } from "lucide-react";

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-surface/40 backdrop-blur-xl border-b border-on-surface/10 flex items-center justify-between px-12 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Decorative element */}
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full opacity-50"></div>
        <span className="text-sm font-medium text-on-surface/70">
          Hệ thống quản lý thư viện số
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="pr-4 border-r border-on-surface/10">
          <ThemeToggle />
        </div>
        <NotificationBell />

        <div className="flex items-center gap-3 pl-6 border-l border-on-surface/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-background leading-none mb-1">
              {user?.profile?.firstName} {user?.profile?.lastName}
            </p>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">
              {user?.role}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center border border-on-surface/10 group cursor-pointer hover:border-primary/30 transition-all">
            <User className="w-5 h-5 text-on-surface/60 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

