// d:\github\proyects_master\frontend\src\app\(dashboard)\technicians\[id]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getApiUrl } from "@/lib/api";
import { compressAndConvertToJpeg } from "@/lib/image";
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
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar
} from "@mui/material";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TechnicianForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  // Basic User states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Profile states
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [profession, setProfession] = useState("");
  const [trade, setTrade] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [shirtSize, setShirtSize] = useState("");
  const [pantsSize, setPantsSize] = useState("");
  const [shoeSize, setShoeSize] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [photoId, setPhotoId] = useState<string | null>(null);

  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // UI status states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load technician details if editing
  useEffect(() => {
    if (isNew) return;

    async function loadTechnician() {
      try {
        setFetching(true);
        const data = await api.get(`/technicians/${id}`);
        
        // Populate User fields
        setEmail(data.email || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");

        // Populate Profile fields
        const profile = data.technicianProfile;
        if (profile) {
          setDocumentNumber(profile.documentNumber || "");
          if (profile.birthDate) {
            setBirthDate(profile.birthDate.split("T")[0]);
          }
          setAcademicLevel(profile.academicLevel || "");
          setProfession(profile.profession || "");
          setTrade(profile.trade || "");
          setAddress(profile.address || "");
          setLandmark(profile.landmark || "");
          setShirtSize(profile.shirtSize || "");
          setPantsSize(profile.pantsSize || "");
          setShoeSize(profile.shoeSize || "");
          setWeight(profile.weight ? profile.weight.toString() : "");
          setHeight(profile.height ? profile.height.toString() : "");
          setPhotoId(profile.photoId || null);
        }
      } catch (err: any) {
        console.error("Error loading technician:", err);
        setError("No se pudo cargar la información del técnico.");
      } finally {
        setFetching(false);
      }
    }
    loadTechnician();
  }, [id, isNew]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async (techId: string) => {
    if (!selectedFile) return;

    // Comprimir y convertir a JPG en el cliente
    const compressedFile = await compressAndConvertToJpeg(selectedFile);

    const formData = new FormData();
    formData.append("file", compressedFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(getApiUrl(`/technicians/${techId}/photo`), {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error("No se pudo subir la foto de perfil.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic Validations
    if (!email || !firstName || !lastName || !documentNumber) {
      setError("El correo, nombres, apellidos y número de documento son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email,
        password: password || undefined,
        firstName,
        lastName,
        phone,
        documentNumber,
        birthDate: birthDate || undefined,
        academicLevel,
        profession,
        trade,
        address,
        landmark,
        shirtSize,
        pantsSize,
        shoeSize,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
      };

      let techId = id;

      if (isNew) {
        const saved = await api.post("/technicians", payload);
        techId = saved.id;
      } else {
        await api.patch(`/technicians/${id}`, payload);
      }

      // If photo is selected, upload it
      if (selectedFile) {
        await handlePhotoUpload(techId);
      }

      setSuccess(`¡Técnico ${isNew ? "registrado" : "actualizado"} con éxito!`);
      
      setTimeout(() => {
        router.push("/technicians");
      }, 1500);

    } catch (err: any) {
      console.error("Error saving technician:", err);
      setError(err.message || "Ocurrió un error al intentar guardar los datos.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: 2 }}>
        <CircularProgress size={40} sx={{ color: "var(--primary)" }} />
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Cargando información del técnico...
        </Typography>
      </Box>
    );
  }

  // MUI customized text field style config
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
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 1, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Link href="/technicians" style={{ textDecoration: "none" }}>
          <Button variant="text" size="small" sx={{ color: "var(--text-muted)", mb: 2, textTransform: "none", fontSize: "0.9rem" }}>
            ← Volver a Técnicos
          </Button>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text-main)", mb: 0.5 }}>
          {isNew ? "Registrar Nuevo Técnico" : "Editar Perfil de Técnico"}
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Completa la ficha detallada, credenciales de acceso y tallas físicas de equipamiento del técnico.
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
              {/* Foto de perfil */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 3, 
                  p: 3, 
                  borderRadius: "6px", 
                  bgcolor: "rgba(115, 103, 240, 0.04)", 
                  border: "1px dashed var(--border-light)" 
                }}>
                  <Avatar 
                    src={previewUrl || (photoId ? getApiUrl(`/images/${photoId}`) : undefined)}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      border: "2px solid var(--primary)",
                      bgcolor: "var(--primary-light)",
                      color: "var(--primary)",
                      fontSize: "2rem"
                    }}
                  >
                    {!previewUrl && !photoId ? "👨‍🔧" : undefined}
                  </Avatar>
                  <Box>
                    <Button 
                      variant="outlined" 
                      component="label"
                      size="small"
                      sx={{ 
                        borderRadius: "6px", 
                        textTransform: "none", 
                        borderColor: "var(--primary)", 
                        color: "var(--primary)",
                        mb: 1,
                        "&:hover": { borderColor: "var(--primary-hover)", bgcolor: "var(--primary-light)" }
                      }}
                    >
                      📷 {previewUrl || photoId ? "Cambiar Foto" : "Subir Foto"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        hidden
                        disabled={loading}
                      />
                    </Button>
                    <Typography variant="caption" sx={{ display: "block", color: "var(--text-muted)" }}>
                      Formatos permitidos: JPG, PNG. Máximo 5MB.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Seccion 1: Credenciales y Contacto */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ color: "var(--primary)", fontWeight: 600, mb: 1, borderBottom: "1px solid var(--border-light)", pb: 1 }}>
                  1. Credenciales y Contacto (Usuario)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombres"
                  placeholder="Ej. Juan Andrés"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  placeholder="Ej. Pérez Gómez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  placeholder="juan.perez@securitynet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Número de Teléfono"
                  placeholder="Ej. +56987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={`Contraseña ${isNew ? "" : "(dejar en blanco para no cambiarla)"}`}
                  type="password"
                  placeholder={isNew ? "Ingresa la contraseña de acceso" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required={isNew}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              {/* Seccion 2: Datos Personales y Profesionales */}
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "var(--primary)", fontWeight: 600, mb: 1, borderBottom: "1px solid var(--border-light)", pb: 1 }}>
                  2. Datos Personales y Profesionales
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Número de Documento (RUT / DNI / RFC)"
                  placeholder="Ej. 18.765.432-1 o DNI: 09876543"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel shrink id="academic-level-label">Nivel Académico</InputLabel>
                  <Select
                    labelId="academic-level-label"
                    label="Nivel Académico"
                    notched
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    disabled={loading}
                    sx={{ borderRadius: "6px" }}
                  >
                    <MenuItem value="">Selecciona...</MenuItem>
                    <MenuItem value="Secundaria Completa">Secundaria Completa</MenuItem>
                    <MenuItem value="Técnico Medio">Técnico Medio</MenuItem>
                    <MenuItem value="Técnico Superior / Tecnólogo">Técnico Superior / Tecnólogo</MenuItem>
                    <MenuItem value="Universitario Incompleto">Universitario Incompleto</MenuItem>
                    <MenuItem value="Universitario Graduado">Universitario Graduado</MenuItem>
                    <MenuItem value="Postgrado">Postgrado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Profesión / Título"
                  placeholder="Ej. Ingeniero de Telecomunicaciones"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Oficio / Especialidad Operativa"
                  placeholder="Ej. Especialista en Fibra Óptica, Fusionador, Instalador CCTV Senior"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              {/* Seccion 3: Tallas y Medidas */}
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "var(--primary)", fontWeight: 600, mb: 1, borderBottom: "1px solid var(--border-light)", pb: 1 }}>
                  3. Tallas de Uniforme e Indicadores Físicos
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel shrink id="shirt-size-label">Talla Camisa</InputLabel>
                  <Select
                    labelId="shirt-size-label"
                    label="Talla Camisa"
                    notched
                    value={shirtSize}
                    onChange={(e) => setShirtSize(e.target.value)}
                    disabled={loading}
                    sx={{ borderRadius: "6px" }}
                  >
                    <MenuItem value="">Selecciona...</MenuItem>
                    <MenuItem value="XS">XS</MenuItem>
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="L">L</MenuItem>
                    <MenuItem value="XL">XL</MenuItem>
                    <MenuItem value="XXL">XXL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Talla Pantalón"
                  placeholder="Ej. 32 / 42"
                  value={pantsSize}
                  onChange={(e) => setPantsSize(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Talla Calzado (Zapato)"
                  placeholder="Ej. 40 / 41 / 8"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Peso Corporal (Kg)"
                  type="number"
                  placeholder="Ej. 75.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={loading}
                  slotProps={{ 
                    inputLabel: { shrink: true },
                    htmlInput: { step: "0.1" }
                  }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Estatura / Altura (metros)"
                  type="number"
                  placeholder="Ej. 1.76"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={loading}
                  slotProps={{ 
                    inputLabel: { shrink: true },
                    htmlInput: { step: "0.01" }
                  }}
                  sx={fieldStyle}
                />
              </Grid>

              {/* Seccion 4: Dirección */}
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "var(--primary)", fontWeight: 600, mb: 1, borderBottom: "1px solid var(--border-light)", pb: 1 }}>
                  4. Dirección y Ubicación
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Dirección Particular"
                  placeholder="Calle, Número, Departamento, Ciudad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Punto de Referencia"
                  placeholder="Ej. Frente a Plaza Central, Edificio Amarillo segundo piso"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: "var(--border-light)" }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Link href="/technicians" style={{ textDecoration: "none" }}>
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
                {isNew ? "Registrar Técnico" : "Guardar Cambios"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
