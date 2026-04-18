import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User, Minimize2 } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const SUGGESTIONS = [
  'Quy định mượn sách?',
  'Gợi ý sách triết học',
  'Cách tìm tài liệu?',
  'Thư viện mở cửa khi nào?',
];

/** Render basic markdown: **bold**, *italic*, bullet lists */
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // bullet list
    if (line.match(/^[\*\-]\s/)) {
      const content = line.replace(/^[\*\-]\s/, '');
      return (
        <li key={i} className="ml-4 list-disc">
          {renderInline(content)}
        </li>
      );
    }
    // numbered list
    if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <li key={i} className="ml-4 list-decimal">
          {renderInline(content)}
        </li>
      );
    }
    // empty line → spacer
    if (line.trim() === '') return <br key={i} />;
    return <p key={i}>{renderInline(line)}</p>;
  });
};

const renderInline = (text: string) => {
  // **bold**
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage: Message = { role: 'user', parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        history: messages,
      });

      const botMessage: Message = {
        role: 'model',
        parts: [{ text: response.data.data }],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const isAuth = err?.response?.status === 401;
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [
            {
              text: isAuth
                ? 'Bạn cần **đăng nhập** để sử dụng tính năng AI Assistant.'
                : 'Xin lỗi, tôi gặp chút trục trặc. Bạn thử lại nhé!',
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[70vh] sm:h-[600px] bg-surface/90 backdrop-blur-2xl border border-on-surface/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-120px)]"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-primary to-secondary flex items-center justify-between flex-shrink-0 relative overflow-hidden">
              {/* Shine effect for header */}
              <div className="absolute inset-0 bg-white/10 skew-x-12 translate-x-1/2 -z-0" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-none">AI Assistant</h3>
                  <p className="text-white/70 text-[11px] mt-0.5">HNUE Digital Library</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 relative z-10"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-block p-4 rounded-full bg-on-surface/5 mb-3">
                    <Bot className="w-8 h-8 text-primary opacity-50" />
                  </div>
                  <h4 className="font-bold text-base mb-1 text-on-background">
                    Chào {user?.profile?.firstName || 'bạn'}! 👋
                  </h4>
                  <p className="text-on-surface/60 text-sm mb-6">
                    Tôi có thể giúp bạn tìm sách, giải đáp quy định mượn/trả hoặc gợi ý tài liệu học tập.
                  </p>
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 text-xs font-medium bg-on-surface/5 border border-on-surface/10 rounded-full hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-on-surface"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                      msg.role === 'user' ? 'bg-secondary text-white' : 'bg-gradient-to-br from-primary to-secondary text-white'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed space-y-1 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-secondary text-white rounded-tr-none'
                        : 'bg-on-surface/5 text-on-surface rounded-tl-none border border-on-surface/5'
                    }`}
                  >
                    {renderMarkdown(msg.parts[0].text)}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse text-white">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-on-surface/5 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center border border-on-surface/5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-on-surface/5 border-t border-on-surface/5 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi AI điều gì đó..."
                className="flex-1 bg-surface border border-on-surface/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-on-surface placeholder:text-on-surface/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-gradient-to-tr from-primary to-secondary text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="relative z-10 w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="relative z-10 w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default Chatbot;
