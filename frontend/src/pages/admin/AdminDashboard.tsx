import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Tổng số sách",
      value: data?.totalBooks?.toLocaleString() || "0",
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Người dùng",
      value: data?.totalUsers?.toLocaleString() || "0",
      icon: Users,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Đang mượn",
      value: data?.activeLoans?.toLocaleString() || "0",
      icon: ClipboardList,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Hoạt động 30 ngày",
      value: data?.activeUserCount?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-on-background">
            Chào buổi sáng, Admin
          </h1>
          <p className="text-on-surface/60">
            Đây là tóm tắt hoạt động của thư viện trong hôm nay.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm text-on-surface/50 mb-1 flex items-center justify-end gap-2">
            <Clock className="w-4 h-4" /> Cập nhật lần cuối:
          </div>
          <div className="text-on-background font-medium">
            {new Date().toLocaleString("vi-VN")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface/40 mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-on-background tracking-tight">
                {stat.value}
              </h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Summary */}
      <div className="premium-card p-0 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent">
        <div className="p-8 border-b border-on-surface/5 flex justify-between items-center bg-on-surface/[0.01]">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-on-background">
              <BarChart3 className="w-5 h-5 text-primary" /> Xu hướng Mượn sách
            </h3>
            <p className="text-on-surface/50 text-xs mt-1">
              Hoạt động trong 6 tháng gần nhất
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/reports")}
            className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
          >
            Báo cáo chi tiết
          </button>
        </div>
        <div className="p-8">
          <div className="h-[300px] w-full relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.loansOverTime || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="dashboardLoans"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(var(--on-surface-rgb), 0.15)"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--on-surface)",
                    fontSize: 11,
                    fontWeight: 800,
                    opacity: 0.8,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--on-surface)",
                    fontSize: 11,
                    fontWeight: 800,
                    opacity: 0.8,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(var(--surface-rgb), 0.95)",
                    borderColor: "rgba(var(--on-surface-rgb), 0.1)",
                    borderRadius: "16px",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "none",
                  }}
                  itemStyle={{
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "var(--on-surface)",
                    marginBottom: "4px",
                    fontWeight: 800,
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                  cursor={{
                    stroke: "var(--primary)",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <Area
                  type="monotone"
                  dataKey="loans"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#dashboardLoans)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-on-background">
              Yêu cầu mượn gần đây
            </h3>
            <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">
              Xem tất cả
            </button>
          </div>

          <div className="space-y-4">
            {data?.recentLoans?.length === 0 ? (
              <div className="p-12 text-center text-on-surface/30 italic font-medium bg-on-surface/[0.02] rounded-2xl border border-dashed border-on-surface/10">
                Chưa có yêu cầu mượn sách nào.
              </div>
            ) : (
              data?.recentLoans?.map((loan: any) => (
                <div
                  key={loan._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-on-surface/[0.01] border border-on-surface/5 hover:bg-on-surface/[0.03] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center font-black text-primary text-sm border border-on-surface/10 group-hover:border-primary/20 transition-all">
                      {loan.userId?.profile?.firstName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-bold text-on-background group-hover:text-primary transition-colors">
                        {loan.userId?.profile?.firstName}{" "}
                        {loan.userId?.profile?.lastName}
                      </div>
                      <div className="text-[11px] text-on-surface/50 font-medium opacity-80">
                        {loan.copyId?.bookId?.title}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest inline-block border ${
                        loan.status === "active"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : loan.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-on-surface/5 text-on-surface/40 border-on-surface/10"
                      }`}
                    >
                      {loan.status === "active"
                        ? "Đang mượn"
                        : loan.status === "pending"
                          ? "Chờ duyệt"
                          : loan.status}
                    </div>
                    <div className="text-[9px] text-on-surface/30 mt-1 font-bold">
                      {new Date(loan.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

