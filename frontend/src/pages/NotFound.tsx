import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated 404 Text */}
          <div className="relative inline-block mb-12">
            <motion.h1 
              className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary via-secondary to-transparent opacity-20 select-none"
              animate={{ 
                scale: [1, 1.02, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ repeat: Infinity, duration: 8 }}
            >
              404
            </motion.h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-full border border-on-surface/10 shadow-2xl relative">
                  <Search className="w-16 h-16 text-primary" />
                  <motion.div 
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    <Ghost className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-on-background">
            Oops! Trang này đã <span className="text-gradient decoration-skip-ink">biến mất</span>
          </h2>
          
          <p className="text-lg text-on-surface/60 mb-12 max-w-lg mx-auto leading-relaxed">
            Chúng tôi không tìm thấy nội dung bạn đang yêu cầu. Có vẻ như trang này đã bị xóa hoặc đường dẫn bị sai.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="premium-button w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Về trang chủ
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-2.5 bg-surface/50 backdrop-blur-md border border-on-surface/10 rounded-xl font-bold text-on-surface hover:bg-surface-hover hover:border-primary/30 transition-all w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </button>
          </div>
        </motion.div>

        {/* Knowledge crumbs / particles decoration */}
        <div className="mt-20 flex justify-center gap-8 opacity-20 hidden md:flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="w-1 h-1 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
