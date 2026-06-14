"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api, getApiUrl } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Chip
} from "@mui/material";
import { Plus } from "lucide-react";

interface TechnicianProfile {
  id: string;
  documentNumber: string;
  birthDate?: string;
  academicLevel?: string;
  profession?: string;
  trade?: string;
  address?: string;
  landmark?: string;
  shirtSize?: string;
  pantsSize?: string;
  shoeSize?: string;
  weight?: number;
  height?: number;
  photoId?: string;
}

interface Technician {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  technicianProfile?: TechnicianProfile;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setLoading(true);
        const data = await api.get<Technician[]>("/technicians");
        setTechnicians(data);
      } catch (err: any) {
        console.error("Error fetching technicians:", err);
        setError("No se pudo cargar la lista de técnicos.");
      } finally {
        setLoading(false);
      }
    }
    fetchTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter((tech) => {
    const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase();
    const query = search.toLowerCase();
    const doc = tech.technicianProfile?.documentNumber?.toLowerCase() || "";
    const trade = tech.technicianProfile?.trade?.toLowerCase() || "";
    const profession = tech.technicianProfile?.profession?.toLowerCase() || "";
    const email = tech.email.toLowerCase();

    return (
      fullName.includes(query) ||
      doc.includes(query) ||
      trade.includes(query) ||
      profession.includes(query) ||
      email.includes(query)
    );
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title & Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Directorio de Técnicos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los datos personales, fisonomía, tallas de uniforme y contacto del personal técnico
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/technicians/new"
          variant="contained"
          color="primary"
          startIcon={<Plus className="w-4 h-4" />}
        >
          Registrar Técnico
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Search Filter Box */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar técnico por Nombre, RUT/DNI, Correo, Especialidad u Oficio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Cargando directorio de técnicos...</Typography>
        </Box>
      ) : filteredTechnicians.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Typography variant="h3">🛠️</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Directorio Vacío</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 1 }}>
              No se encontraron técnicos registrados que coincidan con la búsqueda.
            </Typography>
            <Button component={Link} href="/technicians/new" variant="outlined" color="primary">
              Registrar Primer Técnico
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTechnicians.map((tech) => {
            const profile = tech.technicianProfile;
            return (
              <Grid key={tech.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", gap: 2 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Avatar
                        src={profile?.photoId ? getApiUrl(`/images/${profile.photoId}`) : undefined}
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          border: "2px solid", 
                          borderColor: "primary.light",
                          bgcolor: "primary.light",
                          color: "primary.main",
                          fontSize: "24px"
                        }}
                      >
                        {!profile?.photoId && "👨‍🔧"}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                          {tech.firstName} {tech.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, display: "block", mt: 0.5 }}>
                          💼 {profile?.trade || profile?.profession || "Sin Oficio Definido"}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                      <Typography variant="body2">
                        📄 <strong>Doc:</strong> {profile?.documentNumber || "No registrado"}
                      </Typography>
                      <Typography variant="body2">
                        📧 <strong>Correo:</strong> {tech.email}
                      </Typography>
                      <Typography variant="body2">
                        📞 <strong>Tel:</strong> {tech.phone || "No registrado"}
                      </Typography>
                      {profile?.academicLevel && (
                        <Typography variant="body2">
                          🎓 <strong>Estudios:</strong> {profile.academicLevel}
                        </Typography>
                      )}
                      
                      {profile && (profile.shirtSize || profile.pantsSize || profile.shoeSize) && (
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={`👕 ${profile.shirtSize || "-"} | 👖 ${profile.pantsSize || "-"} | 👟 ${profile.shoeSize || "-"}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: "11px" }}
                          />
                        </Box>
                      )}
                    </Box>

                    <Button
                      component={Link}
                      href={`/technicians/${tech.id}`}
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      sx={{ mt: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Editar Perfil Completo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
