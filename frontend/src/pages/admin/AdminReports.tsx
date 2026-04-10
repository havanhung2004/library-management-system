import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Book, DollarSign, DownloadCloud } from 'lucide-react';
import api from '../../lib/api';

const AdminReports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    // Basic CSV export logic
    const headers = ['Month', 'Monthly Loans'];
    const rows = data?.loansOverTime?.map((d: any) => [d.name, d.loans]) || [];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "library_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#eab308'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Thống kê & Báo cáo</h1>
          <p className="text-slate-400 text-sm">Phân tích chuyên sâu về dữ liệu mượn trả và tương tác người dùng.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="premium-button flex items-center gap-2"
        >
          <DownloadCloud className="w-4 h-4" /> Xuất Báo cáo CSV
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4 text-primary bg-primary/10 w-fit p-3 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Người dùng tích cực</h4>
          <p className="text-3xl font-bold text-white">{data?.activeUserCount || 0}</p>
          <p className="text-[10px] text-green-500 mt-2">Trong 30 ngày qua</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4 text-yellow-500 bg-yellow-500/10 w-fit p-3 rounded-2xl">
            <Book className="w-6 h-6" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Tổng lượt mượn</h4>
          <p className="text-3xl font-bold text-white">{(data?.loansOverTime?.reduce((acc: number, curr: any) => acc + curr.loans, 0)) || 0}</p>
          <p className="text-[10px] text-slate-500 mt-2">Dữ liệu 6 tháng</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4 text-green-500 bg-green-500/10 w-fit p-3 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Phí đã thu</h4>
          <p className="text-3xl font-bold text-white">{(data?.fineStats?.paid || 0).toLocaleString()}đ</p>
          <p className="text-[10px] text-green-500 mt-2">Hoàn tất thanh toán</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4 text-red-400 bg-red-400/10 w-fit p-3 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Phí chờ đóng</h4>
          <p className="text-3xl font-bold text-white">{(data?.fineStats?.pending || 0).toLocaleString()}đ</p>
          <p className="text-[10px] text-red-500 mt-2">Cần xử lý</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Trends */}
        <div className="premium-card p-8">
          <h3 className="text-xl font-bold mb-8">Xu hướng Mượn sách (6 Tháng)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.loansOverTime || []}>
                <defs>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '13px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="loans" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLoans)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Books */}
        <div className="premium-card p-8">
          <h3 className="text-xl font-bold mb-8">Top 5 Sách mượn nhiều nhất</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data?.topBooks || []}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {data?.topBooks?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple alert circle substitute if needed
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default AdminReports;
