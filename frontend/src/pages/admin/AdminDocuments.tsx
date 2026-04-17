import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  FileText,
  ExternalLink,
  RefreshCcw,
  HardDrive,
} from "lucide-react";
import api from "../../lib/api";

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [meta, setMeta] = useState<any>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async (nextCursor?: string) => {
    setLoading(true);
    try {
      const response = await api.get("/documents", {
        params: { next_cursor: nextCursor },
      });
      if (nextCursor) {
        setDocuments((prev) => [...prev, ...response.data.data]);
      } else {
        setDocuments(response.data.data);
      }
      setMeta(response.data.meta);
    } catch (err) {
      console.error("Error fetching documents from Cloudinary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (
      !window.confirm(
        "CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn tệp trên Cloudinary. Bạn có chắc chắn?",
      )
    )
      return;
    try {
      await api.delete(`/documents/${encodeURIComponent(publicId)}`);
      fetchDocuments();
    } catch (err) {
      console.error("Error deleting document from Cloudinary:", err);
      alert(
        "Không thể xóa tài liệu này. Vui lòng kiểm tra quyền hạn Cloudinary.",
      );
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.fileUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.publicId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-on-background">
            Lưu trữ Đám mây
          </h1>
          <p className="text-on-surface/60">
            Quản lý tệp tin trực tiếp từ Cloudinary Storage.
          </p>
        </div>
        <button
          onClick={() => fetchDocuments()}
          className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-on-surface/60 hover:text-primary flex items-center gap-2 border border-transparent hover:border-primary/20"
          title="Làm mới"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          <span className="text-xs font-bold uppercase tracking-widest">
            Đồng bộ
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center gap-4 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <HardDrive className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-on-background">
              {meta.totalResults || 0}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface/40">
              Tổng tài nguyên
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-on-surface/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-on-surface/[0.01]">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo ID hoặc liên kết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-on-surface/10 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-on-surface/[0.02] text-on-surface/50 text-[10px] font-black uppercase tracking-widest border-b border-on-surface/5">
                <th className="px-6 py-4">Tài liệu (Public ID)</th>
                <th className="px-6 py-4">Định dạng</th>
                <th className="px-6 py-4">Dung lượng</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {loading && documents.length === 0 ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-6 w-48 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 bg-on-surface/5 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-on-surface/5 ml-auto rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20 text-on-surface">
                      <FileText className="w-12 h-12" />
                      <p className="italic font-medium">
                        Không tìm thấy tài liệu nào.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.publicId}
                    className="hover:bg-on-surface/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileTypeIcon type={doc.fileType} />
                        <span
                          className="font-bold text-on-background truncate max-w-[300px] text-xs"
                          title={doc.publicId}
                        >
                          {doc.publicId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50 px-2 py-0.5 bg-on-surface/5 rounded border border-on-surface/5">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-on-surface/60">
                      {formatSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-on-surface/40 uppercase">
                      {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-2 hover:bg-primary/10 rounded-lg transition-colors text-on-surface/40 hover:text-primary"
                        title="Xem tệp"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.publicId)}
                        className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-on-surface/40 hover:text-accent"
                        title="Xóa vĩnh viễn"
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
          <div className="p-6 border-t border-on-surface/10 flex justify-center bg-on-surface/[0.01]">
            <button
              onClick={() => fetchDocuments(meta.nextCursor)}
              disabled={loading}
              className="px-8 py-2.5 bg-on-surface/5 hover:bg-primary text-on-surface/80 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
              Tải thêm dữ liệu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FileTypeIcon = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    pdf: "text-red-500 bg-red-500/10 border-red-500/10",
    epub: "text-green-500 bg-green-500/10 border-green-500/10",
    mobi: "text-blue-500 bg-blue-500/10 border-blue-500/10",
    default: "text-on-surface/40 bg-on-surface/5 border-on-surface/10",
  };
  const colorClass = colors[type?.toLowerCase()] || colors.default;

  return (
    <div className={`p-2 rounded-lg border ${colorClass} transition-all`}>
      <FileType strokeWidth={2.5} className="w-4 h-4" />
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

