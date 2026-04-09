import React, { useState, useEffect, useRef } from "react";
import { Bell, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications");
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-white/5"
      >
        <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-96 premium-card p-0 overflow-hidden shadow-2xl z-50 border-white/10 bg-slate-900/95 backdrop-blur-2xl"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
              <div>
                <h3 className="font-bold text-white">Thông báo</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">
                  Bạn có {unreadCount} tin nhắn mới
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-primary hover:text-primary-light flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 opacity-10" />
                  <p className="text-sm italic">Không có thông báo nào.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`p-4 border-b border-white/5 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.isRead ? "bg-primary/5" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                        n.type === "LOAN_REQUEST"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm leading-snug mb-1 ${!n.isRead ? "text-white font-bold" : "text-slate-400"}`}
                      >
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white/2 border-t border-white/5 text-center">
              <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                Xem tất cả thông báo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

