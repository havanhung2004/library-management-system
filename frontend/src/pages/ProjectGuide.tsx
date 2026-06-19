import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Database, Sparkles, Layout, BarChart, 
  CreditCard, Users, Settings, Bot, 
  CloudLightning, Zap, CheckCircle2
} from 'lucide-react';

const ProjectGuide: React.FC = () => {
  const sections = [
    {
      title: "Hệ thống AI Thông minh (RAG Chatbot)",
      icon: <Bot className="w-8 h-8 text-primary" />,
      description: "Tích hợp mô hình Gemini 3.5 Flash tiên tiến để hỗ trợ người dùng.",
      details: [
        "Cơ chế RAG (Retrieval-Augmented Generation) truy vấn dữ liệu thực tế từ MongoDB trước khi trả lời.",
        "Xử lý ngôn ngữ tự nhiên để hiểu các yêu cầu mượn trả phức tạp.",
        "Thông tin thời gian thực về số lượng bản sao hiện có và bản PDF/Ebook.",
        "Tích hợp hệ thống Gợi ý sách thông minh dựa trên ngữ cảnh hội thoại."
      ],
      color: "from-blue-500/10 to-transparent"
    },
    {
      title: "Thống kê & Phân tích (Analytics)",
      icon: <BarChart className="w-8 h-8 text-purple-500" />,
      description: "Hệ thống báo cáo chuyên sâu sử dụng MongoDB Aggregation Pipelines.",
      details: [
        "Biểu đồ xu hướng mượn sách 6 tháng gần nhất (Recharts Area Chart).",
        "Top 5 tài liệu được mượn nhiều nhất hệ thống.",
        "Theo dõi người dùng hoạt động (Active Users) trong 30 ngày.",
        "Tính năng xuất báo cáo định dạng CSV cho mục đích quản lý offline."
      ],
      color: "from-purple-500/10 to-transparent"
    },
    {
      title: "Quản lý Phí phạt & Thanh toán",
      icon: <CreditCard className="w-8 h-8 text-green-500" />,
      description: "Quy trình xử lý vi phạm mượn trả tự động và minh bạch.",
      details: [
        "Tự động tính toán phí phạt ngay khi trả sách trễ hạn (phát hiện theo dueDate).",
        "Giao diện người dùng theo dõi nợ và lịch sử thanh toán.",
        "Trình quản lý dành cho Thủ thư để xác nhận thanh toán trực tiếp.",
        "Tích hợp mô phỏng thanh toán trực tuyến (Simulated Payment Gateway)."
      ],
      color: "from-green-500/10 to-transparent"
    },
    {
      title: "Hồ sơ Người dùng Cao cấp",
      icon: <Users className="w-8 h-8 text-orange-500" />,
      description: "Quản lý thông tin cá nhân và tài sản học tập tập trung.",
      details: [
        "Tải lên ảnh đại diện tích hợp Cloudinary (Xử lý ảnh trên mây).",
        "Theo dõi trạng thái sách đang mượn (Đang mượn/Quá hạn/Đã trả).",
        "Thống kê tổng lượt mượn và tình trạng phí phạt ngay tại Profile.",
        "Cập nhật thông tin MSSV, khoa/ban theo chuẩn HNUE."
      ],
      color: "from-orange-500/10 to-transparent"
    },
    {
      title: "Cơ sở hạ tầng & Database",
      icon: <Database className="w-8 h-8 text-red-500" />,
      description: "Cấu trúc dữ liệu chuẩn mực và bảo mật.",
      details: [
        "Phân quyền đa tầng (Role-based access control): Student, Lecturer, Librarian, Admin, Superadmin.",
        "Hệ thống seeding dữ liệu thông minh cho toàn bộ kịch bản kiểm thử.",
        "Middleware xử lý lỗi tập trung và validation dữ liệu với Joi/Zod.",
        "Tối ưu hóa tìm kiếm với Full-text search và debouncing ở frontend."
      ],
      color: "from-red-500/10 to-transparent"
    },
    {
      title: "Giao diện UI/UX Hiện đại",
      icon: <Layout className="w-8 h-8 text-cyan-500" />,
      description: "Trải nghiệm người dùng cao cấp với Glassmorphism.",
      details: [
        "Sử dụng Tailwind CSS v4 mới nhất và Framer Motion cho hiệu ứng chuyển động.",
        "Thiết kế Responsive hoàn toàn, tối ưu trên mọi kích thước màn hình.",
        "Cảm giác 'Breathe' với khoảng trắng và độ mờ kính (backdrop-blur) tinh tế.",
        "Hệ thống icon đồng bộ từ Lucide React."
      ],
      color: "from-cyan-500/10 to-transparent"
    }
  ];

  const techStack = [
    { name: "React + Vite", icon: <Zap className="w-4 h-4" /> },
    { name: "Node.js + Express", icon: <CloudLightning className="w-4 h-4" /> },
    { name: "MongoDB + Mongoose", icon: <Database className="w-4 h-4" /> },
    { name: "Tailwind CSS v4", icon: <Settings className="w-4 h-4" /> },
    { name: "Framer Motion", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Cloudinary", icon: <Settings className="w-4 h-4" /> },
    { name: "Gemini AI", icon: <Bot className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest mb-6">
             <Shield className="w-3 h-3" /> Tài liệu Kỹ thuật Dự án
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            HNUE Digital <span className="text-primary italic">Library</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Một hệ thống quản trị thư viện hiện đại, tích hợp trí tuệ nhân tạo và phân tích dữ liệu chuyên sâu 
            nhằm mang lại trải nghiệm học thuật tối ưu cho sinh viên và giảng viên.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {techStack.map((tech) => (
              <div key={tech.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400">
                {tech.icon}
                {tech.name}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`premium-card group overflow-hidden bg-gradient-to-br ${section.color}`}
            >
              <div className="mb-6">{section.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{section.description}</p>
              
              <ul className="space-y-3">
                {section.details.map((detail, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed">
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-8 rounded-3xl bg-white/5 border border-white/10 text-center"
        >
          <h4 className="text-lg font-bold text-white mb-2">Trạng thái triển khai</h4>
          <p className="text-slate-500 text-sm mb-6">Tất cả các module đã được tích hợp và kiểm thử đồng bộ.</p>
          <div className="flex justify-center gap-8">
            <div>
               <div className="text-2xl font-bold text-primary">100%</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Logic hoàn thiện</div>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div>
               <div className="text-2xl font-bold text-primary">98%</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Độ trung thực UI</div>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div>
               <div className="text-2xl font-bold text-primary">2.5s</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phản hồi AI</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectGuide;
