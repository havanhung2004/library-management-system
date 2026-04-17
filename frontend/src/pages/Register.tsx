import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, UserCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student" as "student" | "lecturer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", formData);
      const { tokens, user } = response.data.data;
      login(tokens.access.token, user);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="premium-card relative overflow-hidden bg-surface/60">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary"></div>

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-on-background">
              Tham gia cùng chúng tôi
            </h2>
            <p className="text-on-surface/60 font-medium">
              Khởi đầu hành trình tri thức tại HNUE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface/80 mb-2 ml-1">
                  Họ
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-surface-hover border border-on-surface/10 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all font-inter"
                  placeholder="Nguyễn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface/80 mb-2 ml-1">
                  Tên
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-surface-hover border border-on-surface/10 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all font-inter"
                  placeholder="Văn A"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface/80 mb-2 ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface/40 group-focus-within:text-secondary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-hover border border-on-surface/10 rounded-lg py-3 pl-10 pr-3 text-on-surface focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 transition-all font-inter"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface/80 mb-2 ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface/40 group-focus-within:text-secondary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-surface-hover border border-on-surface/10 rounded-lg py-3 pl-10 pr-3 text-on-surface focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/20 transition-all font-inter"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface/80 mb-2 ml-1">
                Vai trò
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface/40 group-focus-within:text-secondary transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-surface-hover border border-on-surface/10 rounded-lg py-3 pl-10 pr-3 text-on-surface focus:outline-none focus:border-secondary/50 transition-all appearance-none cursor-pointer font-inter"
                >
                  <option value="student">Sinh viên</option>
                  <option value="lecturer">Giảng viên</option>
                </select>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-accent text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-button bg-secondary py-3 flex items-center justify-center gap-2 group hover:bg-secondary/80 shadow-secondary/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Tạo tài khoản</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-on-surface/5 text-center">
            <p className="text-on-surface/60 text-sm font-medium">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-secondary hover:text-secondary/80 font-bold transition-colors"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

