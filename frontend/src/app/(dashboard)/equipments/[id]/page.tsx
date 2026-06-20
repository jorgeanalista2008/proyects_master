"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getApiUrl } from "@/lib/api";
import { compressAndConvertToJpeg } from "@/lib/image";
import { useAuth } from "@/hooks/useAuth";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from "@mui/material";
import { Wrench, Trash2, ArrowLeft, Image as ImageIcon, CheckCircle, PackageOpen } from "lucide-react";

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  role: {
    name: string;
  } | string;
}

interface EquipmentImage {
  id: string;
  fileName: string;
  createdAt: string;
}

interface EquipmentReceipt {
  id: string;
  clientName: string;
  clientId?: string;
  equipmentType: string;
  brand: string;
  model: string;
  serialNumber: string;
  issueDescription: string;
  status: "RECEIVED" | "ASSIGNED" | "IN_PROGRESS" | "REPAIRED" | "DELIVERED";
  technicalNotes?: string;
  technicianId?: string;
  technician?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  images: EquipmentImage[];
  receivedAt: string;
  assignedAt?: string;
  repairedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EquipmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();

  const [equipment, setEquipment] = useState<EquipmentReceipt | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Photo uploads
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Lightbox modal zoom
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState("");

  // Technical notes dialog
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [technicalNotesText, setTechnicalNotesText] = useState("");

  const loadData = async () => {
    try {
      setFetching(true);
      const data = await api.get<EquipmentReceipt>(`/equipments/${id}`);
      setEquipment(data);

      if (user?.role === "ADMIN" || user?.role === "SELLER") {
        const usersData = await api.get<any[]>("/users");
        const filteredTechs = usersData.filter(
          (u) =>
            u.role === "TECHNICIAN" ||
            u.role === "ADMIN" ||
            u.role?.name === "TECHNICIAN" ||
            u.role?.name === "ADMIN"
        );
        setTechnicians(filteredTechs);
      }
    } catch (err: any) {
      console.error("Error loading equipment details:", err);
      setError("No se pudo cargar la información del equipo.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleAssignTechnician = async (techId: string) => {
    if (!equipment) return;
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await api.patch(`/equipments/${equipment.id}/assign`, { technicianId: techId });
      setSuccess("Técnico asignado correctamente.");
      loadData();
    } catch (err: any) {
      console.error("Error assigning technician:", err);
      setError(err.message || "Error al asignar técnico.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string, technicalNotes?: string) => {
    if (!equipment) return;
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await api.patch(`/equipments/${equipment.id}/status`, { status, technicalNotes });
      setSuccess(`Estado actualizado a ${status === 'IN_PROGRESS' ? 'En Revisión' : status === 'REPAIRED' ? 'Reparado' : 'Entregado'} correctamente.`);
      loadData();
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message || "Error al actualizar estado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!equipment) return;
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro de recepción? Esta acción no se puede deshacer.")) {
      try {
        setLoading(true);
        await api.delete(`/equipments/${equipment.id}`);
        router.push("/equipments");
      } catch (err: any) {
        console.error("Error deleting equipment:", err);
        setError(err.message || "No se pudo eliminar la recepción.");
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !equipment) return;
    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      // Comprimir y convertir a JPG en el cliente
      const compressedFile = await compressAndConvertToJpeg(selectedFile);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(getApiUrl(`/images/equipment/${equipment.id}`), {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = "No se pudo cargar la foto del equipo.";
        try {
          const errData = await response.json();
          if (Array.isArray(errData.message)) {
            errorMessage = errData.message.join(", ");
          } else {
            errorMessage = errData.message || errData.error || errorMessage;
          }
        } catch {
          try {
            const text = await response.text();
            if (text) errorMessage += ` Detalle: ${text}`;
          } catch {
            // ignore
          }
        }
        throw new Error(errorMessage);
      }

      setSuccess("Foto del equipo subida correctamente.");
      setSelectedFile(null);
      loadData();
    } catch (err: any) {
      console.error("Error uploading equipment image:", err);
      setError(err.message || "Error al subir la foto.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta foto?")) {
      try {
        setError("");
        setSuccess("");
        await api.delete(`/images/equipment/${imageId}`);
        setSuccess("Foto eliminada correctamente.");
        loadData();
      } catch (err: any) {
        console.error("Error deleting image:", err);
        setError(err.message || "No se pudo eliminar la imagen.");
      }
    }
  };

  const handleOpenLightbox = (url: string) => {
    setLightboxUrl(url);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">Cargando detalles...</Typography>
      </Box>
    );
  }

  if (!equipment) return null;

  const isStaff = user?.role === "ADMIN" || user?.role === "SELLER";
  const isAssignedTech = equipment.technicianId === user?.id;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <Chip label="Recibido" color="warning" sx={{ fontWeight: 600 }} />;
      case "ASSIGNED":
        return <Chip label="Asignado" color="info" sx={{ fontWeight: 600 }} />;
      case "IN_PROGRESS":
        return <Chip label="En Revisión" color="primary" sx={{ fontWeight: 600 }} />;
      case "REPAIRED":
        return <Chip label="Reparado (Listo)" color="success" sx={{ fontWeight: 700 }} />;
      case "DELIVERED":
        return <Chip label="Entregado" color="secondary" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Button
            component={Link}
            href="/equipments"
            color="secondary"
            startIcon={<ArrowLeft className="w-4 h-4" />}
            sx={{ textTransform: "none", mb: 1, p: 0, justifyContent: "flex-start" }}
          >
            Volver a Recepción de Equipos
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Ficha de Equipo S/N: {equipment.serialNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {equipment.equipmentType} {equipment.brand} {equipment.model} — Registrado el {new Date(equipment.createdAt).toLocaleString("es-ES")}
          </Typography>
        </Box>
        {isStaff && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDeleteEquipment}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Eliminar Registro
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ borderRadius: 1.5 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Left Side: Ficha Técnica & Flow States */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Card: Detalles de Recepción */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Detalles del Equipo y Falla</Typography>} />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 750 }}>Cliente</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{equipment.clientName}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 750 }}>Tipo de Equipo</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{equipment.equipmentType}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 750 }}>Marca / Modelo</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{equipment.brand} / {equipment.model}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 750, display: "block", mb: 0.5 }}>Falla Reportada</Typography>
                  <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {equipment.issueDescription}
                    </Typography>
                  </Box>
                </Grid>

                {equipment.technicalNotes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="success.main" sx={{ textTransform: "uppercase", fontWeight: 750, display: "block", mb: 0.5, mt: 1 }}>
                      Trabajo Realizado / Notas de Reparación
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "rgba(16, 185, 129, 0.05)", borderRadius: 1.5, border: "1px solid", borderColor: "success.light" }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontWeight: 500 }}>
                        {equipment.technicalNotes}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Card: Tiempos e Historial */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tiempos del Ciclo de Soporte</Typography>} />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Fecha de Recepción:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {new Date(equipment.receivedAt).toLocaleString("es-ES")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Asignado a Técnico:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {equipment.assignedAt ? new Date(equipment.assignedAt).toLocaleString("es-ES") : "Pendiente de asignación"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Fecha de Reparación:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: equipment.repairedAt ? "success.main" : "text.primary" }}>
                  {equipment.repairedAt ? new Date(equipment.repairedAt).toLocaleString("es-ES") : "No reparado aún"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Fecha de Entrega al Cliente:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: equipment.deliveredAt ? "secondary.main" : "text.primary" }}>
                  {equipment.deliveredAt ? new Date(equipment.deliveredAt).toLocaleString("es-ES") : "Pendiente de entrega"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Flow Control, Assigned Technician & Image Uploads */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Card: Control de Flujo de Estados */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Estado del Servicio</Typography>}
              action={getStatusDisplay(equipment.status)}
            />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Acciones de Técnico */}
              {(isAssignedTech || user?.role === "ADMIN") && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {equipment.status === "ASSIGNED" && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUpdateStatus("IN_PROGRESS")}
                      startIcon={<Wrench className="w-4 h-4" />}
                      fullWidth
                    >
                      Comenzar Revisión (Técnico)
                    </Button>
                  )}
                  {equipment.status === "IN_PROGRESS" && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setTechnicalNotesText("");
                        setOpenNotesDialog(true);
                      }}
                      startIcon={<CheckCircle className="w-4 h-4" />}
                      fullWidth
                    >
                      Marcar como Reparado (Notificar Admin)
                    </Button>
                  )}
                </Box>
              )}

              {/* Acciones de Administrador */}
              {isStaff && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {equipment.status === "REPAIRED" && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleUpdateStatus("DELIVERED")}
                      startIcon={<PackageOpen className="w-4 h-4" />}
                      fullWidth
                    >
                      Entregar Equipo al Cliente
                    </Button>
                  )}

                  {/* Asignar Técnico */}
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 750, display: "block", mb: 1 }}>
                      {equipment.technicianId ? "Reasignar Técnico" : "Asignar Técnico"}
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={equipment.technicianId || ""}
                      onChange={(e) => handleAssignTechnician(e.target.value)}
                      disabled={loading}
                    >
                      <MenuItem value="">-- Sin Asignar --</MenuItem>
                      {technicians.map((tech) => (
                        <MenuItem key={tech.id} value={tech.id}>
                          {tech.firstName} {tech.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              )}

              {equipment.status === "DELIVERED" && (
                <Box sx={{ p: 2, bgcolor: "action.selected", borderRadius: 1.5, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    ✅ Servicio Finalizado. Equipo entregado al cliente.
                  </Typography>
                </Box>
              )}

              {equipment.status === "RECEIVED" && !isStaff && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                  El equipo ha sido registrado y está a la espera de que el administrador asigne un técnico de soporte.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Card: Galería de Fotos */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader title={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Fotos de Recepción y Soporte</Typography>} />
            <Divider />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {!equipment.images || equipment.images.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  Aún no hay fotos registradas para este equipo.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {equipment.images.map((img) => (
                    <Grid size={{ xs: 6 }} key={img.id}>
                      <Box sx={{
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        height: 120,
                        bgcolor: "background.default",
                        position: "relative",
                        cursor: "pointer",
                        "&:hover .delete-btn": { opacity: 1 },
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getApiUrl(`/images/${img.id}`)}
                          alt="Detalle de equipo"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onClick={() => handleOpenLightbox(getApiUrl(`/images/${img.id}`))}
                        />
                        {(isStaff || isAssignedTech) && (
                          <IconButton
                            className="delete-btn"
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img.id);
                            }}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "rgba(255,255,255,0.85)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              opacity: 0.1,
                              transition: "opacity 0.2s ease",
                              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Upload Section */}
              {(isStaff || isAssignedTech) && (
                <Box sx={{
                  bgcolor: "background.default",
                  border: "1px dashed",
                  borderColor: "divider",
                  p: 2.5,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5
                }}>
                  <input
                    id="eq-img-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <Button
                    component="label"
                    htmlFor="eq-img-upload"
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<ImageIcon className="w-4 h-4" />}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {selectedFile ? "Cambiar Imagen" : "Elegir Foto"}
                  </Button>
                  {selectedFile && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>{selectedFile.name}</Typography>
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
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lightbox / Zoom View Dialog */}
      <Dialog open={lightboxOpen} onClose={handleCloseLightbox} maxWidth="lg" fullWidth>
        <Box sx={{ p: 1, bgcolor: "background.paper", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Visor de alta resolución"
            style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 4 }}
          />
        </Box>
      </Dialog>

      {/* Diálogo de Notas Técnicas de Reparación */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Detalle de Reparación Realizada</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Por favor, describe en detalle qué le hiciste al equipo para solucionar la falla reportada. Este reporte será visible para el administrador y el cliente.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder="Ej: Se realizó la limpieza interna, reemplazo de pasta térmica y reparación del circuito de alimentación de la placa principal..."
            value={technicalNotesText}
            onChange={(e) => setTechnicalNotesText(e.target.value)}
            required
            label="Detalle del trabajo realizado *"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotesDialog(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (!technicalNotesText.trim()) {
                alert("Por favor escribe el detalle de la reparación.");
                return;
              }
              setOpenNotesDialog(false);
              handleUpdateStatus("REPAIRED", technicalNotesText);
            }}
            variant="contained"
            color="success"
            disabled={!technicalNotesText.trim()}
          >
            Guardar y Marcar Reparado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
