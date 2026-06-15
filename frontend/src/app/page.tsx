"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import DashboardPage from "./(dashboard)/page";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        // Redirige a /projects o / para forzar la carga bajo el layout correcto
        // Usamos '/projects' como página inicial segura con menú
        router.replace("/projects");
      }
    }
  }, [user, loading, router]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <CircularProgress color="primary" />
    </Box>
  );
}
