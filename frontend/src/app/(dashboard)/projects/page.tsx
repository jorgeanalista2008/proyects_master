"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
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
  Chip
} from "@mui/material";
import { Plus } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "PENDING" | "QUOTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  client: Client;
  manager?: User;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("ALL");

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await api.get<Project[]>("/projects");
        setProjects(data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError("No se pudo cargar la lista de proyectos.");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.manager && 
        `${project.manager.firstName} ${project.manager.lastName}`.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusTab === "ALL" || project.status === statusTab;

    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Chip label="Levantamiento" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "QUOTED":
        return <Chip label="Cotizado" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "APPROVED":
        return <Chip label="Aprobado" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "IN_PROGRESS":
        return <Chip label="Instalación" color="primary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "COMPLETED":
        return <Chip label="Completado" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "CANCELLED":
        return <Chip label="Cancelado" color="error" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const tabs = [
    { key: "ALL", label: "Todos" },
    { key: "PENDING", label: "Levantamiento" },
    { key: "QUOTED", label: "Cotizados" },
    { key: "APPROVED", label: "Aprobados" },
    { key: "IN_PROGRESS", label: "Instalación" },
    { key: "COMPLETED", label: "Completados" },
    { key: "CANCELLED", label: "Cancelados" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title & Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Tablero de Proyectos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supervisa el ciclo de vida de los proyectos de seguridad y cotizaciones de clientes
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/projects/new"
          variant="contained"
          color="primary"
          startIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Tabs Filtering */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={statusTab}
          onChange={(e, newVal) => setStatusTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          {tabs.map((tab) => (
            <Tab 
              key={tab.key} 
              label={tab.label} 
              value={tab.key} 
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 40, py: 1 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Search Input Box */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por Nombre del Proyecto, Cliente o Manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Cargando proyectos...</Typography>
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Typography variant="h3">📁</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>No se encontraron proyectos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 1 }}>
              No hay proyectos para el estado o filtro de búsqueda seleccionado.
            </Typography>
            <Button component={Link} href="/projects/new" variant="outlined" color="primary">
              Crear un Proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", borderRadius: 1.5 }}>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Proyecto</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Cliente</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Manager Asignado</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Estado</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Fecha de Creación</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Detalle</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {project.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{project.client?.name || "Cliente no asignado"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.manager 
                        ? `${project.manager.firstName} ${project.manager.lastName}` 
                        : <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>Sin asignar</Typography>}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(project.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(project.createdAt).toLocaleDateString("es-ES")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      component={Link} 
                      href={`/projects/${project.id}`} 
                      variant="text" 
                      color="primary" 
                      sx={{ fontWeight: 700, textTransform: "none" }}
                    >
                      Ver Detalles →
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
