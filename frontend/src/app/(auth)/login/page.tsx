"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  InputAdornment, 
  Alert,
  CircularProgress
} from "@mui/material";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "background.default" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "background.default", px: 2 }}>
      <Card sx={{ width: "105%", maxWidth: 400, border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo & Header */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 3 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: "50%", 
              bgcolor: "primary.light", 
              color: "primary.main", 
              display: "flex", 
              alignItems: "center", 
              justify: "center", 
              justifyContent: "center",
              mb: 2,
              opacity: 0.85
            }}>
              <Shield className="w-6 h-6" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.5px", color: "text.primary" }}>
              Acceso al Panel
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Ingresa tus credenciales para administrar proyectos
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Correo Electrónico"
              variant="outlined"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
            />

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase" }}>
                  Contraseña
                </Typography>
                <Typography variant="caption" component="a" href="#" sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                  ¿Olvidaste tu contraseña?
                </Typography>
              </Box>
              <TextField
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Lock className="w-4 h-4" />}
              sx={{ py: 1.2, mt: 1 }}
            >
              {isSubmitting ? "Autenticando..." : "Ingresar"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider", textAlign: "center", color: "text.secondary", fontSize: "12px" }}>
            ¿Problemas para acceder? Contacta al administrador del sistema.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
