"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SupplierForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load supplier data if editing
  useEffect(() => {
    if (isNew) return;

    async function loadSupplier() {
      try {
        setFetching(true);
        const data = await api.get(`/suppliers/${id}`);
        setName(data.name || "");
        setContact(data.contact || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      } catch (err: any) {
        console.error("Error loading supplier:", err);
        setError("No se pudo cargar la información del proveedor.");
      } finally {
        setFetching(false);
      }
    }
    loadSupplier();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name) {
      setError("Nombre / Razón Social es un campo obligatorio.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        contact: contact || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined
      };

      if (isNew) {
        await api.post("/suppliers", payload);
      } else {
        await api.patch(`/suppliers/${id}`, payload);
      }

      setSuccess(`¡Proveedor ${isNew ? "registrado" : "actualizado"} con éxito!`);
      
      // Redirect back
      setTimeout(() => {
        router.push("/suppliers");
      }, 1500);

    } catch (err: any) {
      console.error("Error saving supplier:", err);
      setError(err.message || "Ocurrió un error al intentar guardar los datos del proveedor.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: 2 }}>
        <CircularProgress size={40} sx={{ color: "var(--primary)" }} />
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Cargando información del proveedor...
        </Typography>
      </Box>
    );
  }

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      "& fieldset": { borderColor: "var(--border-light)" },
      "&.Mui-focused fieldset": { borderColor: "var(--primary)" }
    },
    "& .MuiInputLabel-root": { color: "var(--text-muted)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
    "& .MuiInputBase-input": { color: "var(--text-main)" }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 1, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Link href="/suppliers" style={{ textDecoration: "none" }}>
          <Button variant="text" size="small" sx={{ color: "var(--text-muted)", mb: 2, textTransform: "none", fontSize: "0.9rem" }}>
            ← Volver a Proveedores
          </Button>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text-main)", mb: 0.5 }}>
          {isNew ? "Registrar Nuevo Proveedor" : "Editar Proveedor"}
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          {isNew ? "Ingresa la información general, ejecutivos y datos de contacto de distribución" : "Actualiza la información general y de contacto del distribuidor."}
        </Typography>
      </Box>

      <Card sx={{ 
        bgcolor: "var(--bg-card)", 
        borderRadius: "6px", 
        border: "1px solid var(--border-light)", 
        boxShadow: "var(--shadow-sm)" 
      }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "6px" }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: "6px" }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre / Razón Social"
                  placeholder="Ej. Syscom S.A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Persona de Contacto / Ejecutivo"
                  placeholder="Ej. Juan Pérez"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ventas@proveedor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono de Contacto"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Dirección Física"
                  placeholder="Av. Principal 123, Ciudad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: "var(--border-light)" }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Link href="/suppliers" style={{ textDecoration: "none" }}>
                <Button 
                  variant="outlined" 
                  disabled={loading}
                  sx={{ 
                    borderRadius: "6px", 
                    textTransform: "none", 
                    borderColor: "var(--border-light)", 
                    color: "var(--text-muted)",
                    "&:hover": { borderColor: "var(--text-muted)", bgcolor: "transparent" }
                  }}
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ 
                  borderRadius: "6px", 
                  textTransform: "none", 
                  bgcolor: "var(--primary)",
                  boxShadow: "0 4px 8px 0 rgba(115, 103, 240, 0.3)",
                  "&:hover": { bgcolor: "var(--primary-hover)" }
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ mr: 1, color: "white" }} /> : null}
                {isNew ? "Registrar Proveedor" : "Guardar Cambios"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
