import React, { useState, useEffect } from 'react';
import { Search, Trash2, FileText, ExternalLink, HardDrive, Calendar, RefreshCcw } from 'lucide-react';
import api from '../../lib/api';

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState<any>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async (nextCursor?: string) => {
    setLoading(true);
    try {
      const response = await api.get('/documents', {
        params: { next_cursor: nextCursor }
      });
      if (nextCursor) {
        setDocuments(prev => [...prev, ...response.data.data]);
      } else {
        setDocuments(response.data.data);
      }
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Error fetching documents from Cloudinary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!window.confirm('CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn tệp trên Cloudinary. Bạn có chắc chắn?')) return;
    try {
      // We send the publicId as the documentId param
      await api.delete(`/documents/${encodeURIComponent(publicId)}`);
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document from Cloudinary:', err);
      alert('Không thể xóa tài liệu này. Vui lòng kiểm tra quyền hạn Cloudinary.');
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => 
    doc.fileUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.publicId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Cloudinary Storage Manager</h1>
          <p className="text-slate-400">Trình quản lý tệp tin trực tiếp từ Cloudinary API.</p>
        </div>
        <button 
          onClick={() => fetchDocuments()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white flex items-center gap-2"
          title="Làm mới"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="premium-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
               <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
               <div className="text-2xl font-bold">{meta.totalResults || 0}</div>
               <div className="text-sm text-slate-500">Tệp trên Cloudinary</div>
            </div>
         </div>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo Public ID hoặc liên kết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-white/5 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Tài liệu (Public ID)</th>
                <th className="px-6 py-4">Định dạng</th>
                <th className="px-6 py-4">Dung lượng</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && documents.length === 0 ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-6 w-48 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 ml-auto rounded"></div></td>
                  </tr>
                ))
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Không tìm thấy tài liệu trên Cloudinary.</td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.publicId} className="hover:bg-white/2 transition-colors text-xs">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon type={doc.fileType} />
                        <span className="font-medium text-white truncate max-w-[250px]" title={doc.publicId}>
                          {doc.publicId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase font-bold text-slate-500">{doc.fileType}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatSize(doc.fileSize)}</td>
                    <td className="px-6 py-4 text-slate-400">
                       {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 text-sm">
                       <a 
                         href={doc.fileUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="inline-flex p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-primary" 
                         title="Xem tệp"
                       >
                          <ExternalLink className="w-4 h-4" />
                       </a>
                       <button 
                         onClick={() => handleDelete(doc.publicId)}
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-accent" 
                         title="Xóa vĩnh viễn trên Cloudinary"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {meta.nextCursor && (
          <div className="p-6 border-t border-white/5 flex justify-center">
            <button
              onClick={() => fetchDocuments(meta.nextCursor)}
              disabled={loading}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
              Tải thêm tài liệu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FileTypeIcon = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    pdf: 'text-red-400 bg-red-400/10',
    epub: 'text-green-400 bg-green-400/10',
    mobi: 'text-blue-400 bg-blue-400/10',
    default: 'text-slate-400 bg-slate-400/10'
  };
  const colorClass = colors[type?.toLowerCase()] || colors.default;
  
  return (
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <FileType strokeWidth={2.5} className="w-3.5 h-3.5" />
    </div>
  );
};

const FileType = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default AdminDocuments;
