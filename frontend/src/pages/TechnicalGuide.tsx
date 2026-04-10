import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Box, Terminal, Lock, FileCode, CheckCircle2,
  Code2, Share2, GitBranch, Bot, Globe, Book
} from 'lucide-react';

const TechnicalGuide: React.FC = () => {
  const apiRoutes = [
    { method: 'POST', path: '/auth/login', body: '{ email, password }', desc: 'Đăng nhập hệ thống, trả về JWT.', roles: 'Public' },
    { method: 'GET', path: '/books', query: '?page=1&limit=10&search=...', desc: 'Lấy danh sách sách có phân trang & lọc.', roles: 'All' },
    { method: 'POST', path: '/books', body: 'FormData { title, author, isbn... }', desc: 'Thêm sách mới (Librarian/Admin).', roles: 'Admin+' },
    { method: 'POST', path: '/loans', body: '{ copyId, userId }', desc: 'Tạo phiếu mượn sách.', roles: 'Authenticated' },
    { method: 'GET', path: '/dashboard', desc: 'Lấy số liệu thống kê tổng hợp.', roles: 'Admin+' },
    { method: 'POST', path: '/ai/chat', body: '{ prompt, history }', desc: 'Gửi prompt tới AI Assistant (RAG).', roles: 'Authenticated' },
  ];

  const sections = ['Setup', 'Structure', 'Database', 'BE-Logic', 'Utils', 'API', 'FE-Logic', 'Quality'];

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b border-white/5 pb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Code2 className="text-primary w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Technical Deep-Dive</h1>
              <p className="text-slate-500 mt-1 font-medium italic">"Tài liệu kỹ thuật chi tiết dành cho nhà phát triển hệ thống Thư viện Số HNUE."</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-8">
              <section>
                <h4 className="text-white font-bold mb-4 text-[10px] uppercase tracking-[0.2em] opacity-40">Hệ thống tài liệu</h4>
                <nav className="space-y-1">
                  {sections.map(item => (
                    <a key={item} href={`#${item.toLowerCase().replace('-', '')}`} className="block px-4 py-2 text-sm text-slate-400 hover:text-primary transition-all rounded-lg hover:bg-white/5 border-l-2 border-transparent hover:border-primary">
                      {item}
                    </a>
                  ))}
                </nav>
              </section>

              <section className="premium-card p-6 bg-primary/5 border-primary/10">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Build Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs text-white font-mono">v1.2.0-stable</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-32">
            
            {/* 1. Setup */}
            <section id="setup">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Terminal className="text-primary w-6 h-6" /> 1. Biến môi trường & Cấu hình
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="rounded-2xl bg-black/40 border border-white/5 overflow-hidden font-mono text-[11px]">
                  <div className="bg-white/5 px-6 py-2 border-b border-white/5 text-slate-500 flex justify-between">
                    <span>server/.env</span>
                    <span className="text-primary text-[9px] font-bold">REQUIRED</span>
                  </div>
                  <div className="p-6 text-slate-400 space-y-2">
                    <p><span className="text-primary">MONGODB_URI</span>=mongodb://127.0.0.1:27017/library</p>
                    <p><span className="text-primary">JWT_SECRET</span>=your_security_secret</p>
                    <p><span className="text-yellow-500">GEMINI_API_KEY</span>=AIzaSy...</p>
                    <p><span className="text-blue-400">CLOUDINARY_URL</span>=cloudinary://key:secret@cloud_name</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Structure */}
            <section id="structure">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Box className="text-primary w-6 h-6" /> 2. Cấu trúc mã nguồn chi tiết
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">Backend (src/)</h3>
                  <pre className="text-[10px] text-slate-500 leading-relaxed font-mono">
{`├── common/
│   ├── config/ (Roles, Database, Seeding)
│   ├── middlewares/ (Auth, Error, Upload)
│   └── utils/ (ApiError, Cloudinary, Token)
├── modules/
│   └── [feature]/ (Service, Controller, Model)
└── routes/v1/ (API Versioning)`}
                  </pre>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">Frontend (src/)</h3>
                  <pre className="text-[10px] text-slate-500 leading-relaxed font-mono">
{`├── components/ (Atomic/Admin UI components)
├── contexts/ (AuthContext, ThemeContext)
├── hooks/ (Custom logic: useAuth, useQuery)
├── lib/ (Axios Instance, Helpers)
└── pages/ (Route components: Admin, User)`}
                  </pre>
                </div>
              </div>
            </section>

            {/* 3. Database */}
            <section id="database">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="text-primary w-6 h-6" /> 3. Mô hình Dữ liệu (Schemas)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                {[
                  { name: 'Book', desc: 'isbn, title, author, documentUrl, coverImage, category (ref).' },
                  { name: 'Loan', desc: 'userId (ref), copyId (ref), dueDate, returnDate, status.' },
                  { name: 'User', desc: 'email, password (hashed), role, profile (lastName, firstName).' }
                ].map(model => (
                  <div key={model.name} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h5 className="text-primary text-[11px] font-bold mb-2 uppercase">{model.name}</h5>
                    <p className="text-[9px] text-slate-500 leading-relaxed">{model.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. BE-Logic */}
            <section id="belogic">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileCode className="text-primary w-6 h-6" /> 4. Backend Service Functions
              </h2>
              <div className="space-y-6">
                <div className="premium-card p-6 bg-white/[0.02] border-white/5 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                       <Lock className="w-3 h-3" /> Auth & Security
                    </h4>
                    <ul className="space-y-3 text-[11px] text-slate-400">
                      <li>
                        <code className="text-white">authService.createUser(body)</code>: 
                        <span className="ml-2">Validation {"->"} Bcrypt Hash {"->"} MongoDB Insert.</span>
                      </li>
                      <li>
                        <code className="text-white">authService.generateAuthTokens(user)</code>: 
                        <span className="ml-2">Ký JWT với secret và thời gian hết hạn (expiresIn).</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-green-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                       <Book className="w-3 h-3" /> Business Logic (Book/Loan)
                    </h4>
                    <ul className="space-y-3 text-[11px] text-slate-400">
                      <li>
                        <code className="text-white">bookService.deleteBookById(id)</code>: 
                        <span className="ml-2">Lấy tài liệu {"->"} Gọi Cloudinary API xóa Assets {"->"} Xóa DB record.</span>
                      </li>
                      <li>
                        <code className="text-white">loanService.borrowBook(userId, {"{ copyId, duration }"})</code>: 
                        <span className="ml-2">Atomic update Copy status {"->"} Lưu phiếu mượn {"->"} Notify Admin.</span>
                      </li>
                      <li>
                        <code className="text-white">loanService.returnBook(loanId)</code>: 
                        <span className="ml-2">Set status {"->"} Trình FineService tính phí trễ hạn nếu ngày hiện tại {">"} dueDate.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Utils */}
            <section id="utils">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Terminal className="text-primary w-6 h-6" /> 5. Middlewares & Utils Logic
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h5 className="text-[10px] font-bold text-slate-300 uppercase mb-4">Auth Middleware (Passport-less)</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Logic: Trích lọc Bearer token {"->"} Verify JWT {"->"} Kiểm tra <code>user.role</code> đối chiếu với danh sách quyền yêu cầu 
                      (Librarian/Admin). Nếu không khớp ném <code>403 Forbidden</code>.
                    </p>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h5 className="text-[10px] font-bold text-slate-300 uppercase mb-4">Cloudinary Uploader</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Hàm <code>uploadToCloudinary</code> chuyển đổi buffer từ Multer thành Readable stream đưa thẳng lên Cloudinary, 
                      tránh lãng phí tài nguyên đĩa cục bộ.
                    </p>
                 </div>
              </div>
            </section>

            {/* 6. API */}
            <section id="api">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="text-primary w-6 h-6" /> 6. API Reference (Core Endpoints)
              </h2>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Endpoint</th>
                      <th className="px-6 py-4">Payload/Query</th>
                      <th className="px-6 py-4 text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] divide-y divide-white/5 font-mono">
                    {apiRoutes.map((route, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${
                            route.method === 'GET' ? 'bg-green-500/10 text-green-500' :
                            route.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>{route.method}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{route.path}</td>
                        <td className="px-6 py-4 text-slate-500 text-[9px]">{route.body || route.query || '-'}</td>
                        <td className="px-6 py-4 text-slate-400 font-medium text-right">{route.roles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 7. FE-Logic */}
            <section id="felogic">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Share2 className="text-primary w-6 h-6" /> 7. Frontend Logic & Shared State
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="premium-card p-6 border-white/5">
                  <h4 className="text-[10px] font-bold text-primary mb-4 uppercase tracking-widest"># Auth & Session Management</h4>
                  <ul className="space-y-4 text-[10px] text-slate-400">
                    <li>
                       <code className="text-white">AuthContext.login(token, userData)</code>
                       <p className="mt-1">Lưu trữ nén (persist) thông tin phiên làm việc vào localStorage và cập nhật React state.</p>
                    </li>
                    <li>
                       <code className="text-white">api.ts Interceptors</code>
                       <p className="mt-1">Gắn token vào header <code>Authorization: Bearer</code> cho mọi request API tự động.</p>
                    </li>
                  </ul>
                </div>
                <div className="premium-card p-6 border-white/5">
                  <h4 className="text-[10px] font-bold text-green-400 mb-4 uppercase tracking-widest"># Admin Analytics Logic</h4>
                  <ul className="space-y-4 text-[10px] text-slate-400">
                    <li>
                       <code className="text-white">Data Transformation</code>
                       <p className="mt-1">Xử lý mảng trả về từ MongoDB Aggregation thành format Recharts để render Dashboard.</p>
                    </li>
                    <li>
                       <code className="text-white">CSV Export</code>
                       <p className="mt-1">Sử dụng <code>Blob</code> và <code>createObjectURL</code> để tải dữ liệu báo cáo dạng bảng.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 8. Quality */}
            <section id="quality" className="border-t border-white/5 pt-24 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                 <CheckCircle2 className="w-4 h-4" /> Final Production Quality
              </div>
              <div className="max-w-2xl mx-auto space-y-4">
                 <h3 className="text-3xl font-black text-white">Security & Code Standard</h3>
                 <p className="text-slate-500 text-sm leading-relaxed">
                   Toàn bộ hạ tầng tuân thủ chuẩn <strong>Monorepo-lite</strong>, đảm bảo tách biệt module, 
                   xử lý lỗi nhất quán và giao diện Glassmorphism cao cấp.
                 </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalGuide;
