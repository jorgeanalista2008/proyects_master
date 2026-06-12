// d:\github\proyects_master\frontend\src\context\AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    function initializeAuth() {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to restore authentication state:", error);
        // Clear corrupt storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Calls http://localhost:3000/api/auth/login
      const response = await api.post<LoginResponse>("/auth/login", { email, password });
      
      const sessionToken = response.token || response.accessToken;
      if (!sessionToken) {
        throw new Error("Invalid server response: Access token is missing.");
      }
      
      const sessionUser = response.user;
      if (!sessionUser) {
        throw new Error("Invalid server response: User information is missing.");
      }

      // Store in localStorage
      localStorage.setItem("token", sessionToken);
      localStorage.setItem("user", JSON.stringify(sessionUser));

      // Update state
      setToken(sessionToken);
      setUser(sessionUser);

      // Redirect to /dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to /login
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
