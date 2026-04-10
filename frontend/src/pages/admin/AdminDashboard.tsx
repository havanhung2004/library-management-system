import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Tổng số sách', value: data?.totalBooks?.toLocaleString() || '0', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Người dùng', value: data?.totalUsers?.toLocaleString() || '0', icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Đang mượn', value: data?.activeLoans?.toLocaleString() || '0', icon: ClipboardList, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Hoạt động 30 ngày', value: data?.activeUserCount?.toLocaleString() || '0', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[400px]">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
     );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Chào buổi sáng, Admin</h1>
          <p className="text-slate-400">Đây là tóm tắt hoạt động của thư viện trong hôm nay.</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-sm text-slate-500 mb-1 flex items-center justify-end gap-2">
              <Clock className="w-4 h-4" /> Cập nhật lần cuối:
           </div>
           <div className="text-white font-medium">{new Date().toLocaleString('vi-VN')}</div>
        </div>
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

      {/* Analytics Summary */}
      <div className="premium-card p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Xu hướng Mượn sách
            </h3>
            <p className="text-slate-500 text-xs mt-1">Lượt mượn sách trong 6 tháng gần nhất</p>
          </div>
          <button 
            onClick={() => navigate('/admin/reports')}
            className="text-primary text-sm font-bold hover:underline"
          >
            Báo cáo chi tiết
          </button>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.loansOverTime || []}>
              <defs>
                <linearGradient id="dashboardLoans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="loans" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#dashboardLoans)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold">Yêu cầu mượn gần đây</h3>
             <button className="text-primary text-sm font-bold hover:underline">Xem tất cả</button>
          </div>
          
          <div className="space-y-4">
             {data?.recentLoans?.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">Chưa có yêu cầu mượn sách nào.</div>
             ) : (
                data?.recentLoans?.map((loan: any) => (
                  <div key={loan._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary text-sm">
                           {loan.userId?.profile?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <div className="font-bold text-white">
                              {loan.userId?.profile?.firstName} {loan.userId?.profile?.lastName}
                           </div>
                           <div className="text-xs text-slate-500">
                              Mượn: {loan.copyId?.bookId?.title}
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                           loan.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                           {loan.status === 'active' ? 'Đang mượn' : loan.status}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">
                           {new Date(loan.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="premium-card bg-gradient-to-br from-primary/10 to-transparent">
           <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Hoạt động AI</h3>
           </div>
           <div className="space-y-6">
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                 <p className="text-sm text-slate-400 mb-2">Hệ thống ghi nhận:</p>
                 <div className="text-2xl font-bold text-white mb-1">{data?.aiStats?.successfulSearches || 0}</div>
                 <p className="text-xs text-slate-500">lượt giải đáp thành công thông qua LLM</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                 <p className="text-sm text-slate-400 mb-2">Độ chính xác RAG:</p>
                 <div className="text-2xl font-bold text-white mb-1">{data?.aiStats?.satisfactionRate || 85}%</div>
                 <p className="text-xs text-slate-500">tỉ lệ truy xuất dữ liệu sách khớp 100%</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
