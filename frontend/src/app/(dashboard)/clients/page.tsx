"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from "@mui/material";
import { Plus } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  rutOrId: string;
  projects?: any[];
  _count?: {
    projects: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        const data = await api.get<Client[]>("/clients");
        setClients(data);
      } catch (err: any) {
        console.error("Error fetching clients:", err);
        setError("No se pudo cargar la lista de clientes.");
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.rutOrId.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title & Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Directorio de Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra la información fiscal, datos de contacto y proyectos de tus clientes
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/clients/new"
          variant="contained"
          color="primary"
          startIcon={<Plus className="w-4 h-4" />}
        >
          Registrar Cliente
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Search Input Box */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por Nombre, RUT/RFC/DNI o Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Cargando directorio...</Typography>
        </Box>
      ) : filteredClients.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Typography variant="h3">👥</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Directorio Vacío</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 1 }}>
              No se encontraron clientes registrados en este momento.
            </Typography>
            <Button component={Link} href="/clients/new" variant="outlined" color="primary">
              Registrar Primer Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", borderRadius: 1.5 }}>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Nombre / Razón Social</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Identificación Fiscal</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Contacto</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Proyectos</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Acciones</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => {
                const projectCount = client._count?.projects ?? client.projects?.length ?? 0;
                return (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: 'primary.light', 
                          color: 'primary.main', 
                          fontSize: '14px', 
                          fontWeight: 700,
                          borderRadius: 1.5
                        }}>
                          {client.name[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {client.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        fontFamily: "monospace", 
                        bgcolor: "background.default", 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        display: "inline-block",
                        border: "1px solid",
                        borderColor: "divider",
                        fontSize: "0.85rem"
                      }}>
                        {client.rutOrId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2">📧 {client.email}</Typography>
                        <Typography variant="caption" color="text.secondary">📞 {client.phone}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${projectCount} ${projectCount === 1 ? 'Proyecto' : 'Proyectos'}`} 
                        color={projectCount > 0 ? "success" : "default"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        component={Link} 
                        href={`/clients/${client.id}`} 
                        variant="outlined" 
                        color="secondary" 
                        size="small"
                        sx={{ fontWeight: 600, textTransform: "none" }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
