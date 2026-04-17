import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Book,
  User,
  LogOut,
  Search,
  Home,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  return (
    <nav className="glass-nav px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
          <Book className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold font-outfit text-on-background tracking-tight">
          HNUE <span className="text-primary italic">Library</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          to="/"
          className="text-on-surface hover:text-primary flex items-center gap-1.5 transition-colors font-medium"
        >
          <Home className="w-4 h-4" /> Trang chủ
        </Link>
        <Link
          to="/search"
          className="text-on-surface hover:text-primary flex items-center gap-1.5 transition-colors font-medium"
        >
          <Search className="w-4 h-4" /> Tìm kiếm
        </Link>
        {(user?.role === "admin" ||
          user?.role === "librarian" ||
          user?.role === "superadmin") && (
          <Link
            to="/admin"
            className="text-primary hover:text-primary-light flex items-center gap-1.5 transition-colors font-bold"
          >
            <Book className="w-4 h-4" /> Quản trị
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                  <div className="w-full h-full rounded-full bg-surface-hover flex items-center justify-center">
                    <User className="w-5 h-5 text-on-surface" />
                  </div>
                </div>
                <span className="text-sm font-medium hidden sm:block text-on-surface">
                  {user?.profile?.firstName}
                </span>
              </Link>
              <Link
                to="/fines"
                className="p-2 text-on-surface/60 hover:text-red-500 transition-colors"
                title="Phí phạt"
              >
                <DollarSign className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-on-surface/60 hover:text-accent transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-on-surface hover:text-primary px-4 py-2 font-medium"
              >
                Đăng nhập
              </Link>
              <Link to="/register" className="premium-button">
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-on-surface hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-surface-hover p-6 md:hidden z-50 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-on-surface hover:text-primary flex items-center gap-3 transition-colors font-medium text-lg"
              >
                <Home className="w-5 h-5" /> Trang chủ
              </Link>
              <Link
                to="/search"
                onClick={() => setIsMenuOpen(false)}
                className="text-on-surface hover:text-primary flex items-center gap-3 transition-colors font-medium text-lg"
              >
                <Search className="w-5 h-5" /> Tìm kiếm
              </Link>
              {user && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-on-surface hover:text-primary flex items-center gap-3 transition-colors font-medium text-lg"
                  >
                    <User className="w-5 h-5" /> Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/fines"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-on-surface hover:text-primary flex items-center gap-3 transition-colors font-medium text-lg"
                  >
                    <DollarSign className="w-5 h-5" /> Phí phạt & Thanh toán
                  </Link>
                </>
              )}
              {(user?.role === "admin" ||
                user?.role === "librarian" ||
                user?.role === "superadmin") && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-primary flex items-center gap-3 transition-colors font-bold text-lg"
                >
                  <Book className="w-5 h-5" /> Quản trị
                </Link>
              )}
            </div>

            <div className="pt-4 border-t border-surface-hover">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                      <User className="w-6 h-6 text-on-surface/70" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-background">
                        {user.profile.firstName} {user.profile.lastName}
                      </p>
                      <p className="text-xs text-on-surface/60 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center py-3 text-on-surface font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="premium-button text-center"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

