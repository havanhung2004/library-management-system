import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  _id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    tokens: {
      access: { token: string };
      refresh: { token: string };
    },
    userData: User,
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (
    tokens: { access: { token: string }; refresh: { token: string } },
    userData: User,
  ) => {
    localStorage.setItem("token", tokens.access.token);
    localStorage.setItem("refreshToken", tokens.refresh.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
