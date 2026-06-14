"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getApiUrl } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from "@mui/material";

interface Client {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: {
    name: string;
  } | string;
}

interface ProjectImage {
  id: string;
  filename: string;
  createdAt: string;
}

interface Quote {
  id: string;
  version: number;
  total: number;
  currency: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "PENDING" | "QUOTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  client: Client;
  manager?: User;
  quotes?: Quote[];
  images?: ProjectImage[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailOrForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [managerId, setManagerId] = useState("");

  const [project, setProject] = useState<Project | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>("");

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadFormDirectories() {
      try {
        const clientsData = await api.get<Client[]>("/clients");
        setClients(clientsData);
        
        try {
          const usersData = await api.get<User[]>("/users");
          setUsers(usersData);
        } catch {
          console.warn("Could not load users directory");
        }
      } catch (err) {
        console.error("Error loading form directories:", err);
      }
    }

    async function loadProjectDetails() {
      try {
        setFetching(true);
        const data = await api.get<Project>(`/projects/${id}`);
        setProject(data);
        setProjectStatus(data.status);
      } catch (err: any) {
        console.error("Error loading project details:", err);
        setError("No se pudo cargar el detalle del proyecto.");
      } finally {
        setFetching(false);
      }
    }

    if (isNew) {
      loadFormDirectories().then(() => setFetching(false));
    } else {
      loadProjectDetails();
    }
  }, [id, isNew]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !clientId) {
      setError("Nombre del Proyecto y Cliente son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        description,
        clientId,
        managerId: managerId || undefined
      };

      const saved = await api.post<any>("/projects", payload);
      setSuccess("¡Proyecto registrado exitosamente!");
      setTimeout(() => {
        router.push(`/projects/${saved.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Error al intentar registrar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    setError("");
    setSuccess("");
    try {
      await api.patch(`/projects/${project.id}`, { status: newStatus });
      setProjectStatus(newStatus);
      setSuccess("Estado del proyecto actualizado.");
      const updated = await api.get<Project>(`/projects/${id}`);
      setProject(updated);
    } catch (err: any) {
      console.error("Error changing status:", err);
      setError("No se pudo actualizar el estado del proyecto.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !project) return;
    setUploadingImage(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const response = await fetch(getApiUrl(`/images/project/${project.id}`), {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar la imagen del levantamiento.");
      }

      setSuccess("Foto del levantamiento cargada con éxito.");
      setSelectedFile(null);
      const data = await api.get<Project>(`/projects/${id}`);
      setProject(data);
    } catch (err: any) {
      console.error("Error uploading survey image:", err);
      setError(err.message || "Error al cargar el archivo de imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">Cargando información...</Typography>
      </Box>
    );
  }

  // --- RENDERING CREATION FORM ---
  if (isNew) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600, mx: "auto" }}>
        <Box>
          <Button component={Link} href="/projects" color="secondary" sx={{ textTransform: "none", mb: 1, p: 0, justifyContent: "flex-start" }}>
            ⬅️ Volver a Proyectos
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>Registrar Nuevo Proyecto</Typography>
          <Typography variant="body2" color="text.secondary">
            Crea la ficha de un nuevo proyecto, asócialo a un cliente y asigna el personal técnico de soporte.
          </Typography>
        </Box>

        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleCreateProject} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Nombre del Proyecto"
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Ej. Instalación CCTV Bodega Central"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />

              <TextField
                label="Descripción y Objetivos"
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={3}
                placeholder="Detalla el alcance del proyecto de seguridad, cámaras deseadas, sensores..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Cliente Asociado"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={loading}
                    required
                  >
                    <MenuItem value="">Selecciona un Cliente...</MenuItem>
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Technical Manager / Técnico"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="">Selecciona un Manager (Opcional)...</MenuItem>
                    {users.map((u) => {
                      const roleLabel = typeof u.role === "object" ? u.role.name : u.role;
                      return (
                        <MenuItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({roleLabel})
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}>
                <Button component={Link} href="/projects" variant="outlined" color="secondary" disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={loading && <CircularProgress size={20} color="inherit" />}>
                  Registrar Proyecto
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // --- RENDERING DETAIL VIEW ---
  if (!project) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header and status selector */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Button component={Link} href="/projects" color="secondary" sx={{ textTransform: "none", mb: 1, p: 0, justifyContent: "flex-start" }}>
            ⬅️ Volver a Proyectos
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>{project.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Ficha de control técnico, cotizaciones generadas e imágenes de levantamiento.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Estado:</Typography>
          <TextField
            select
            variant="outlined"
            size="small"
            value={projectStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            sx={{ width: 180 }}
          >
            <MenuItem value="PENDING">Levantamiento</MenuItem>
            <MenuItem value="QUOTED">Cotizado</MenuItem>
            <MenuItem value="APPROVED">Aprobado</MenuItem>
            <MenuItem value="IN_PROGRESS">Instalación</MenuItem>
            <MenuItem value="COMPLETED">Completado</MenuItem>
            <MenuItem value="CANCELLED">Cancelado</MenuItem>
          </TextField>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ borderRadius: 1.5 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column: Tech Info & Survey Gallery */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Card: Ficha Técnica */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Ficha Técnica" titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }} />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, display: "block" }}>Cliente</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{project.client?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, display: "block" }}>Asignado A</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : "Ninguno"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, display: "block" }}>Fecha Creación</Typography>
                <Typography variant="subtitle2">{new Date(project.createdAt).toLocaleString("es-ES")}</Typography>
              </Box>
              {project.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, display: "block" }}>Descripción</Typography>
                  <Typography variant="body2" color="text.secondary">{project.description}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Card: Survey Photos Gallery */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Fotos del Levantamiento" titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }} />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {!project.images || project.images.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  Aún no hay fotos registradas para este proyecto.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {project.images.map((img) => (
                    <Grid size={{ xs: 6 }} key={img.id}>
                      <Box sx={{
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        height: 110,
                        bgcolor: "background.default"
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getApiUrl(`/images/${img.id}`)}
                          alt="Levantamiento"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Upload Form Box */}
              <Box sx={{
                bgcolor: "background.default",
                border: "1px dashed",
                borderColor: "divider",
                p: 2,
                borderRadius: 1.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5
              }}>
                <input
                  id="proj-img-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button 
                  component="label" 
                  htmlFor="proj-img-upload" 
                  variant="outlined" 
                  color="secondary" 
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  📷 {selectedFile ? "Cambiar Imagen" : "Elegir Foto"}
                </Button>
                {selectedFile && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">{selectedFile.name}</Typography>
                    <Button
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                    >
                      {uploadingImage ? "Subiendo..." : "Subir Foto"}
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Quotes List */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Cotizaciones Asociadas"
              titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }}
              action={
                <Button
                  component={Link}
                  href={`/projects/${project.id}/quotes/new`}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Crear Nueva Cotización
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 1 }}>
              {!project.quotes || project.quotes.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                  <Typography variant="h4">📄</Typography>
                  <Typography variant="body2" color="text.secondary">No hay cotizaciones para este proyecto.</Typography>
                  <Button component={Link} href={`/projects/${project.id}/quotes/new`} variant="outlined" color="primary" size="small">
                    Crear la primera cotización
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "background.default" }}>
                      <TableRow>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Versión</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Fecha</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Estado</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Total</Typography></TableCell>
                        <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Detalle</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {project.quotes.map((q) => {
                        const totalFormatted = new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: q.currency
                        }).format(q.total);

                        return (
                          <TableRow key={q.id} hover>
                            <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>v{q.version}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{new Date(q.createdAt).toLocaleDateString("es-ES")}</Typography></TableCell>
                            <TableCell>
                              <Chip 
                                label={
                                  q.status === "DRAFT" 
                                    ? "Borrador" 
                                    : q.status === "SENT" 
                                    ? "Enviado" 
                                    : q.status === "APPROVED" 
                                    ? "Aprobado" 
                                    : q.status === "REJECTED" 
                                    ? "Rechazado" 
                                    : "Expirado"
                                } 
                                color={
                                  q.status === "APPROVED" 
                                    ? "success" 
                                    : q.status === "DRAFT" 
                                    ? "default" 
                                    : q.status === "SENT" 
                                    ? "warning" 
                                    : "error"
                                }
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 650 }}
                              />
                            </TableCell>
                            <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>{totalFormatted}</Typography></TableCell>
                            <TableCell align="right">
                              <Button
                                component={Link}
                                href={`/projects/${project.id}/quotes/${q.id}`}
                                variant="text"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700, textTransform: "none" }}
                              >
                                Ver / Editar →
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
