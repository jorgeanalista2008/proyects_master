// d:\github\proyects_master\frontend\src\hooks\useAuth.ts
"use client";

import { useAuthContext } from "../context/AuthContext";

export function useAuth() {
  const { user, token, login, logout, loading } = useAuthContext();
  
  return {
    user,
    token,
    login,
    logout,
    loading,
  };
}
