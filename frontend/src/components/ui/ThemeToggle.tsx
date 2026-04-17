import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 hover:bg-surface-hover text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700 animate-in fade-in spin-in-90 duration-500" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400 animate-in fade-in spin-in--90 duration-500" />
      )}
    </button>
  );
};

export default ThemeToggle;

