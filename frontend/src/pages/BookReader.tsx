import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "../lib/api";

// Set worker source to a version matching react-pdf's internal pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BookReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let blobUrl = "";
    const fetchDoc = async () => {
      setLoading(true);
      try {
        // Fetch as blob via our backend proxy to avoid CORS and hide source URL
        const response = await api.get(`/books/${bookId}/document`, {
          responseType: "blob",
        });
        blobUrl = URL.createObjectURL(response.data);
        setDocumentUrl(blobUrl);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Không thể tải tài liệu hoặc bạn không có quyền truy cập.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();

    // Protection: Disable right click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // Protection: Disable print/save shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) {
        e.preventDefault();
        alert("Tính năng tải về và in ấn bị tắt để bảo vệ bản quyền tài liệu số.");
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      // Clean up the blob URL to free memory
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [bookId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center text-white z-[9999]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
        <p className="text-xl font-bold tracking-tight">Đang chuẩn bị tài liệu bảo mật...</p>
        <p className="text-slate-400 mt-2 text-sm">Vui lòng không tắt trình duyệt</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center text-white z-[9999] p-6 text-center">
        <div className="bg-red-500/10 p-6 rounded-3xl mb-8">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Lỗi truy cập tài liệu</h2>
        <p className="text-slate-400 mb-10 max-w-md leading-relaxed">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          Quay lại trang chính
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col z-[9999] select-none text-white overflow-hidden">
      {/* Immersive Header */}
      <div className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-bold">Thoát</span>
          </button>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary block mb-0.5">Digital Library</span>
            <span className="text-sm font-bold text-slate-200">Chế độ đọc bảo mật</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Pagination */}
          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 font-mono">
                <span className="text-primary font-bold">{pageNumber}</span>
                <span className="opacity-30">/</span>
                <span className="opacity-60">{numPages}</span>
            </div>
            <button 
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="p-2 hover:bg-white/10 rounded-xl disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))} 
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold w-12 text-center text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(s => Math.min(2.5, s + 0.2))} 
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                Tài liệu được bảo vệ
            </div>
        </div>
      </div>

      {/* Main Content Viewer */}
      <div className="flex-1 overflow-auto p-12 flex justify-center scroll-smooth bg-[#020617]">
        <div className="relative">
            {/* Background glowing effects for premium feel */}
            <div className="absolute inset-0 bg-primary/20 blur-[150px] -z-10 rounded-full scale-150 opacity-20"></div>
            
            <div className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden bg-slate-800">
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="w-[600px] h-[800px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-sm font-bold opacity-40">Đang tải trang...</span>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  loading={
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                  }
                />
              </Document>
            </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="h-10 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center justify-center px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
            Trình xem tài liệu số bảo mật - © 2026 HNUE Digital Library
          </p>
      </div>
    </div>
  );
};

export default BookReader;
