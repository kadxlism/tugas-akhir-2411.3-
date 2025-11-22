import React, { createContext, useState, useEffect } from "react";
import axios from "@/services/axios";
import { User } from "@/types/auth";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const res = await axios.get("/auth/me", {
            signal: controller.signal,
          });
          const userObj = res.data.user || res.data;
          console.log('fetchUser /auth/me response:', res.data, 'userObj:', userObj);
          setUser(userObj);
        } catch (error: any) {
          console.error("Failed to fetch user:", error);
          // Clear invalid token
          localStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_token");
          setUser(null);
        } finally {
          clearTimeout(timeoutId);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth fetch error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    await axios.get("/sanctum/csrf-cookie");
    const response = await axios.post("/auth/login", { email, password });

    const token = response.data.token;
    if (rememberMe) {
      localStorage.setItem("auth_token", token);
    } else {
      sessionStorage.setItem("auth_token", token);
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    await fetchUser();
  };

  const register = async (data: RegisterData) => {
    await axios.get("/sanctum/csrf-cookie");
    await axios.post("/auth/register", data);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout gagal", err);
    } finally {
      localStorage.removeItem("auth_token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
