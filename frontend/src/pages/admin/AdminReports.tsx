import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Book,
  DollarSign,
  DownloadCloud,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import api from "../../lib/api";
import * as XLSX from "xlsx";
const AdminReports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1 - Xu hướng mượn
    const loansSheet = XLSX.utils.aoa_to_sheet([
      ["BÁO CÁO XU HƯỚNG MƯỢN SÁCH"],
      [],
      ["Tháng", "Lượt mượn"],
      ...data.loansOverTime.map((item: any) => [item.name, item.loans]),
    ]);

    XLSX.utils.book_append_sheet(workbook, loansSheet, "Xu hướng mượn");

    // Sheet 2 - Top sách
    const topBooksData =
      data?.topBooks?.map((item: any) => ({
        "Tên sách": item.name,
        "Lượt mượn": item.count,
      })) || [];

    const topBooksSheet = XLSX.utils.json_to_sheet(topBooksData);

    XLSX.utils.book_append_sheet(workbook, topBooksSheet, "Top sách");

    // Sheet 3 - Phí phạt
    const fineData = [
      {
        "Loại phí": "Đã thanh toán",
        "Số tiền": data?.fineStats?.paid || 0,
      },
      {
        "Loại phí": "Chưa thanh toán",
        "Số tiền": data?.fineStats?.pending || 0,
      },
    ];

    const fineSheet = XLSX.utils.json_to_sheet(fineData);

    XLSX.utils.book_append_sheet(workbook, fineSheet, "Phí phạt");

    // Xuất file
    XLSX.writeFile(
      workbook,
      `BaoCaoThuVien_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f97316", "#eab308"];

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-on-background">
            Trung tâm Phân tích
          </h1>
          <p className="text-on-surface/60 text-sm">
            Báo cáo hiệu suất và chỉ số tương tác thời gian thực.
          </p>
        </div>
        <button
          onClick={exportExcel}
          className="premium-button flex items-center gap-2 group shadow-lg shadow-primary/10"
        >
          <DownloadCloud className="w-4 h-4 group-hover:animate-bounce" />
          <span className="text-xs font-black uppercase tracking-widest">
            Xuất Báo cáo
          </span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-4 mb-5 text-primary bg-primary/10 w-fit p-3.5 rounded-2xl border border-primary/10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h4 className="text-on-surface/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Active Users
          </h4>
          <p className="text-3xl font-bold text-on-background tracking-tighter">
            {data?.activeUserCount || 0}
          </p>
          <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-tighter">
            ↑ 12% so với tháng trước
          </p>
        </div>

        <div className="premium-card p-6 bg-gradient-to-br from-secondary/5 to-transparent border-secondary/10">
          <div className="flex items-center gap-4 mb-5 text-secondary bg-secondary/10 w-fit p-3.5 rounded-2xl border border-secondary/10">
            <Book className="w-6 h-6" />
          </div>
          <h4 className="text-on-surface/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Total Loans
          </h4>
          <p className="text-3xl font-bold text-on-background tracking-tighter">
            {data?.loansOverTime?.reduce(
              (acc: number, curr: any) => acc + curr.loans,
              0,
            ) || 0}
          </p>
          <p className="text-[10px] font-bold text-on-surface/40 mt-2 uppercase tracking-tighter">
            Dữ liệu 180 ngày
          </p>
        </div>

        <div className="premium-card p-6 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/10">
          <div className="flex items-center gap-4 mb-5 text-green-500 bg-green-500/10 w-fit p-3.5 rounded-2xl border border-green-500/10">
            <DollarSign className="w-6 h-6" />
          </div>
          <h4 className="text-on-surface/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Revenue Collected
          </h4>
          <p className="text-3xl font-bold text-on-background tracking-tighter">
            {(data?.fineStats?.paid || 0).toLocaleString()}Đ
          </p>
          <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-tighter">
            Giao dịch thành công
          </p>
        </div>

        <div className="premium-card p-6 bg-gradient-to-br from-accent/5 to-transparent border-accent/10">
          <div className="flex items-center gap-4 mb-5 text-accent bg-accent/10 w-fit p-3.5 rounded-2xl border border-accent/10">
            <AlertCircle className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-on-surface/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Pending Fines
          </h4>
          <p className="text-3xl font-bold text-on-background tracking-tighter">
            {(data?.fineStats?.pending || 0).toLocaleString()}Đ
          </p>
          <p className="text-[10px] font-bold text-accent mt-2 uppercase tracking-tighter">
            Cần xử lý thu hồi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Trends */}
        <div className="premium-card p-0 overflow-hidden">
          <div className="p-8 border-b border-on-surface/5 bg-on-surface/[0.01] flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-background flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Xu hướng mượn sách
            </h3>
            <span className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest">
              6 months span
            </span>
          </div>
          <div className="p-8 h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <AreaChart
                data={data?.loansOverTime || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
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
                  dy={15}
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
                    backgroundColor: "rgba(var(--surface-rgb), 0.9)",
                    borderColor: "rgba(var(--on-surface-rgb), 0.1)",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "var(--primary)", fontWeight: 800 }}
                  labelStyle={{
                    color: "var(--on-surface)",
                    marginBottom: "4px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    fontSize: "10px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="loans"
                  stroke="#6366f1"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorLoans)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Books */}
        <div className="premium-card p-0 overflow-hidden">
          <div className="p-8 border-b border-on-surface/5 bg-on-surface/[0.01] flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-background flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" /> Phân tích thị
              hiếu
            </h3>
            <span className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest">
              Top 5 titles
            </span>
          </div>
          <div className="p-8 h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart
                layout="vertical"
                data={data?.topBooks || []}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  horizontal={false}
                  stroke="rgba(var(--on-surface-rgb), 0.1)"
                  opacity={0.5}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={140}
                  tick={{
                    fill: "var(--on-surface)",
                    fontSize: 10,
                    fontWeight: 800,
                    opacity: 0.9,
                    width: 140,
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(var(--on-surface-rgb), 0.08)" }}
                  contentStyle={{
                    backgroundColor: "rgba(var(--surface-rgb), 0.95)",
                    borderColor: "rgba(var(--on-surface-rgb), 0.1)",
                    borderRadius: "16px",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "none",
                  }}
                  itemStyle={{
                    fontWeight: 800,
                    color: "var(--primary)",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "var(--on-surface)",
                    fontWeight: 900,
                    fontSize: "10px",
                    marginBottom: "4px",
                  }}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={32}>
                  {data?.topBooks?.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.8}
                    />
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

export default AdminReports;
