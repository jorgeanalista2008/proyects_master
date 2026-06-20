"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getApiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import { Plus, Search, Laptop, Clock, Wrench, CheckCircle, Package, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  role: {
    name: string;
  } | string;
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
  technician?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  receivedAt: string;
}

export default function EquipmentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [equipments, setEquipments] = useState<EquipmentReceipt[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Form State
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<{ file: File; preview: string }[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.get<EquipmentReceipt[]>("/equipments");
      setEquipments(data);

      if (user?.role === "ADMIN" || user?.role === "SELLER") {
        const clientsData = await api.get<Client[]>("/clients");
        setClients(clientsData);

        const usersData = await api.get<any[]>("/users");
        // Filter users who are ADMIN or TECHNICIAN
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
      console.error("Error loading equipments data:", err);
      setError("No se pudo cargar la información de soporte técnico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormError("");
    setClientName("");
    setClientId("");
    setEquipmentType("");
    setBrand("");
    setModel("");
    setSerialNumber("");
    setIssueDescription("");
    setTechnicianId("");
    setSelectedPhotos([]);
  };

  const handleCloseDialog = () => {
    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setSelectedPhotos([]);
    setOpenDialog(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const { compressAndConvertToJpeg } = await import("@/lib/image");

      const processedPhotos = await Promise.all(
        filesArray.map(async (file) => {
          const compressed = await compressAndConvertToJpeg(file);
          return {
            file: compressed,
            preview: URL.createObjectURL(compressed),
          };
        })
      );

      setSelectedPhotos((prev) => [...prev, ...processedPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleClientSelect = (id: string) => {
    setClientId(id);
    if (id) {
      const selected = clients.find((c) => c.id === id);
      if (selected) {
        setClientName(selected.name);
      }
    } else {
      setClientName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !equipmentType || !brand || !model || !serialNumber || !issueDescription) {
      setFormError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (selectedPhotos.length < 2) {
      setFormError("Por favor adjunta al menos 2 fotos del equipo para registrar la entrada (Política obligatoria de la empresa).");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        clientName,
        clientId: clientId || undefined,
        equipmentType,
        brand,
        model,
        serialNumber,
        issueDescription,
        technicianId: technicianId || undefined,
      };

      // 1. Guardar la recepción del equipo
      const result = await api.post("/equipments", payload);
      const newEquipmentId = result.id;

      // 2. Subir fotos
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      for (const photo of selectedPhotos) {
        const formData = new FormData();
        formData.append("file", photo.file);

        const response = await fetch(getApiUrl(`/images/equipment/${newEquipmentId}`), {
          method: "POST",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar una de las fotos del equipo en el servidor.");
        }
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      console.error("Error saving equipment receipt:", err);
      setFormError(err.message || "Error al registrar la recepción del equipo.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <Chip label="Recibido" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "ASSIGNED":
        return <Chip label="Asignado" color="info" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "IN_PROGRESS":
        return <Chip label="En Revisión" color="primary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case "REPAIRED":
        return <Chip label="Reparado" color="success" size="small" sx={{ fontWeight: 650 }} />;
      case "DELIVERED":
        return <Chip label="Entregado" color="secondary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredEquipments = equipments.filter((eq) => {
    const matchesSearch =
      eq.clientName.toLowerCase().includes(search.toLowerCase()) ||
      eq.brand.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.equipmentType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || eq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const stats = {
      total: equipments.length,
      received: equipments.filter((e) => e.status === "RECEIVED").length,
      assigned: equipments.filter((e) => e.status === "ASSIGNED").length,
      inProgress: equipments.filter((e) => e.status === "IN_PROGRESS").length,
      repaired: equipments.filter((e) => e.status === "REPAIRED").length,
    };
    return stats;
  };

  const stats = getStats();
  const uniqueBrands = Array.from(new Set(equipments.map((e) => e.brand).filter(Boolean)));
  const uniqueModels = Array.from(
    new Set(
      equipments
        .filter((e) => !brand || e.brand.toLowerCase() === brand.toLowerCase())
        .map((e) => e.model)
        .filter(Boolean)
    )
  );

  const isStaff = user?.role === "ADMIN" || user?.role === "SELLER";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title & Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Soporte Técnico: Recepción de Equipos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registra equipos entrantes, asigna personal técnico y gestiona el flujo de reparaciones
          </Typography>
        </Box>
        {isStaff && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenDialog}
            sx={{ boxShadow: "0 4px 8px 0 rgba(115, 103, 240, 0.3)" }}
          >
            Registrar Recepción
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards Row */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", p: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "rgba(115, 103, 240, 0.08)", borderRadius: 2, mr: 2, display: "flex", alignItems: "center" }}>
              <Laptop className="w-6 h-6 text-primary" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>{stats.total}</Typography>
              <Typography variant="caption" color="text.secondary">Total Equipos</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", p: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "rgba(255, 159, 67, 0.08)", borderRadius: 2, mr: 2, display: "flex", alignItems: "center" }}>
              <Clock className="w-6 h-6 text-warning" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>{stats.received + stats.assigned}</Typography>
              <Typography variant="caption" color="text.secondary">Pendientes</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", p: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "rgba(0, 207, 232, 0.08)", borderRadius: 2, mr: 2, display: "flex", alignItems: "center" }}>
              <Wrench className="w-6 h-6 text-info" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>{stats.inProgress}</Typography>
              <Typography variant="caption" color="text.secondary">En Revisión / Reparación</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", p: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "rgba(40, 199, 111, 0.08)", borderRadius: 2, mr: 2, display: "flex", alignItems: "center" }}>
              <CheckCircle className="w-6 h-6 text-success" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>{stats.repaired}</Typography>
              <Typography variant="caption" color="text.secondary">Listos para Entrega</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search Card */}
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por cliente, marca, modelo, serie o tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search className="w-4 h-4 text-gray-400 mr-2" />,
                },
              }}
            />
          </Box>
          <Box sx={{ width: 200 }}>
            <FormControl fullWidth size="small">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">Todos los Estados</MenuItem>
                <MenuItem value="RECEIVED">Recibidos</MenuItem>
                <MenuItem value="ASSIGNED">Asignados</MenuItem>
                <MenuItem value="IN_PROGRESS">En Revisión</MenuItem>
                <MenuItem value="REPAIRED">Reparados</MenuItem>
                <MenuItem value="DELIVERED">Entregados</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Equipments Table */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Cargando equipos...</Typography>
        </Box>
      ) : filteredEquipments.length === 0 ? (
        <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Package className="w-12 h-12 text-gray-300" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Sin Registros</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 1 }}>
              No se encontraron equipos registrados o asignados que coincidan con la búsqueda.
            </Typography>
            {isStaff && (
              <Button variant="outlined" color="primary" onClick={handleOpenDialog}>
                Recibir Primer Equipo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", borderRadius: 1.5 }}>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Equipo / Identificación</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Cliente</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Fecha Recepción</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Técnico Asignado</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Estado</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Acción</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEquipments.map((eq) => (
                <TableRow key={eq.id} hover>
                  <TableCell>
                    <Box sx={{ lineHeight: 1.2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {eq.equipmentType} {eq.brand} {eq.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        S/N: {eq.serialNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {eq.clientName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(eq.receivedAt).toLocaleDateString("es-ES")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: eq.technician ? "text.primary" : "text.secondary" }}>
                      {eq.technician ? `${eq.technician.firstName} ${eq.technician.lastName}` : "No Asignado"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(eq.status)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`/equipments/${eq.id}`)}
                    >
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for new equipment reception */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Registrar Recepción de Equipo</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 1 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Cliente */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Asociar Cliente del Sistema</InputLabel>
                  <Select
                    value={clientId}
                    onChange={(e) => handleClientSelect(e.target.value as string)}
                    label="Asociar Cliente del Sistema"
                  >
                    <MenuItem value="">-- Ingresar Cliente Manual --</MenuItem>
                    {clients.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre del Cliente (Obligatorio)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </Grid>

              {/* Detalles del Equipo */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tipo de Equipo (ej: Laptop, DVR, Switch)"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  required
                />
              </Grid>
              {/* Marca */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Marca Existente</InputLabel>
                  <Select
                    value={uniqueBrands.includes(brand) ? brand : ""}
                    onChange={(e) => setBrand(e.target.value)}
                    label="Marca Existente"
                  >
                    <MenuItem value="">-- Ingresar Manual / Otra --</MenuItem>
                    {uniqueBrands.map((b) => (
                      <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Marca (Obligatorio)"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </Grid>

              {/* Modelo */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Modelo Existente</InputLabel>
                  <Select
                    value={uniqueModels.includes(model) ? model : ""}
                    onChange={(e) => setModel(e.target.value)}
                    label="Modelo Existente"
                  >
                    <MenuItem value="">-- Ingresar Manual / Otra --</MenuItem>
                    {uniqueModels.map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Modelo (Obligatorio)"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Número de Serie (S/N)"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                />
              </Grid>

              {/* Falla */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción de la falla o lo que presenta el equipo"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  required
                />
              </Grid>

              {/* Asignación de Técnico */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Asignar Técnico de Reparación</InputLabel>
                  <Select
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value as string)}
                    label="Asignar Técnico de Reparación"
                  >
                    <MenuItem value="">-- Dejar sin asignar temporalmente --</MenuItem>
                    {technicians.map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.firstName} {tech.lastName} ({typeof tech.role === 'object' ? tech.role.name : tech.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fotos del Equipo (Mínimo 2) */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                  Fotos del Equipo * (Mínimo 2 fotos requeridas para registrar el ingreso)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    color={selectedPhotos.length < 2 ? "error" : "primary"}
                  >
                    Seleccionar Fotos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                    />
                  </Button>
                  <Typography variant="caption" color={selectedPhotos.length < 2 ? "error.main" : "text.secondary"} sx={{ fontWeight: 500 }}>
                    {selectedPhotos.length === 0 
                      ? "Ninguna foto seleccionada (Se requiere al menos 2)" 
                      : selectedPhotos.length === 1 
                        ? "1 foto seleccionada (Falta 1 más)" 
                        : `${selectedPhotos.length} fotos seleccionadas`}
                  </Typography>
                </Box>

                {selectedPhotos.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {selectedPhotos.map((photo, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          width: 80,
                          height: 80,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <img
                          src={photo.preview}
                          alt={`Vista previa ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemovePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            bgcolor: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            padding: 0.3,
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.8)",
                            },
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary" disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? "Registrando..." : "Guardar Recepción"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
