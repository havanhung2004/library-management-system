import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Tổng số sách', value: '1,240', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Người dùng', value: '850', icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Đang mượn', value: '156', icon: ClipboardList, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Quá hạn', value: '12', icon: AlertCircle, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Chào buổi sáng, Admin</h1>
        <p className="text-slate-400">Đây là tóm tắt hoạt động của thư viện trong hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold">Yêu cầu mượn gần đây</h3>
             <button className="text-primary text-sm font-bold hover:underline">Xem tất cả</button>
          </div>
          
          <div className="space-y-4">
             {[1, 2, 3].map((_, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-sm">NM</div>
                     <div>
                        <div className="font-bold text-white">Nguyễn Văn A</div>
                        <div className="text-xs text-slate-500">Mượn: Giáo trình Tâm lý học</div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><CheckCircle className="w-4 h-4" /></button>
                     <button className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20"><AlertCircle className="w-4 h-4" /></button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="premium-card bg-gradient-to-br from-primary/10 to-transparent">
           <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Hoạt động AI</h3>
           </div>
           <div className="space-y-6">
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                 <p className="text-sm text-slate-400 mb-2">Hôm qua, AI đã giúp:</p>
                 <div className="text-2xl font-bold text-white mb-1">142</div>
                 <p className="text-xs text-slate-500">lượt tìm kiếm thành công thông qua NLP</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                 <p className="text-sm text-slate-400 mb-2">Đề xuất cá nhân hóa:</p>
                 <div className="text-2xl font-bold text-white mb-1">85%</div>
                 <p className="text-xs text-slate-500">tỉ lệ sinh viên hài lòng với đề xuất AI</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
