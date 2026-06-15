"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "./(dashboard)/layout";
import DashboardPage from "./(dashboard)/page";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  // Sirve el inicio (Dashboard) envuelto correctamente con su menú lateral
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
