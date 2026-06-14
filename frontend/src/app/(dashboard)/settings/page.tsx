// d:\github\proyects_master\frontend\src\app\(dashboard)\settings\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/hooks/useAuth";
import { api, getApiUrl } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from "@mui/material";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  label: string;
}

const PRESET_PALETTES = [
  { name: "Vuexy Corporate (Recomendado)", primary: "#7367F0", accent: "#82868B" },
  { name: "Cyber-Sentinel", primary: "#00F2FE", accent: "#8A2BE2" },
  { name: "Classic Navy / Slate", primary: "#1e3a8a", accent: "#94a3b8" },
  { name: "Cyberpunk Neon", primary: "#8b5cf6", accent: "#ec4899" },
  { name: "Emerald Garden", primary: "#10b981", accent: "#06b6d4" },
  { name: "Crimson Metal", primary: "#b91c1c", accent: "#f59e0b" },
  { name: "Ocean Breeze", primary: "#0ea5e9", accent: "#10b981" }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { config, updateConfig, uploadLogo } = useConfig();

  const [activeTab, setActiveTab] = useState<"general" | "categories">("general");

  const [appName, setAppName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e3a8a");
  const [accentColor, setAccentColor] = useState("#94a3b8");
  const [defaultTheme, setDefaultTheme] = useState("dark");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Categories states
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    if (config) {
      setAppName(config.appName || "");
      setPhone(config.phone || "");
      setEmail(config.email || "");
      setAddress(config.address || "");
      setWebsite(config.website || "");
      setPrimaryColor(config.primaryColor || "#1e3a8a");
      setAccentColor(config.accentColor || "#94a3b8");
      setDefaultTheme(config.defaultTheme || "dark");

      if (config.logoId) {
        setLogoPreviewUrl(getApiUrl(`/images/${config.logoId}`));
      }
    }
  }, [config]);

  // Fetch Categories on demand
  const fetchCategories = async () => {
    try {
      setLoadingCats(true);
      const data = await api.get<Category[]>("/settings/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

  if (user && user.role !== "ADMIN") {
    return (
      <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>Acceso Denegado</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
            Solo los administradores del sistema pueden acceder al panel de personalización.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleApplyPalette = (palette: typeof PRESET_PALETTES[0]) => {
    setPrimaryColor(palette.primary);
    setAccentColor(palette.accent);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setError("");
    setSuccess("");
    setUploadingLogo(true);
    try {
      const newLogoId = await uploadLogo(logoFile);
      setLogoFile(null);
      setLogoPreviewUrl(getApiUrl(`/images/${newLogoId}`));
      setSuccess("Logo corporativo actualizado con éxito.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al subir el logo corporativo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    if (!appName) {
      setError("El nombre de la aplicación es obligatorio.");
      setSaving(false);
      return;
    }

    try {
      await updateConfig({
        appName,
        phone: phone || null,
        email: email || null,
        address: address || null,
        website: website || null,
        primaryColor,
        accentColor,
        defaultTheme
      });
      setSuccess("¡Configuración de personalización guardada con éxito!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al intentar guardar los ajustes.");
    } finally {
      setSaving(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !categoryLabel) return;
    setError("");
    setSuccess("");
    try {
      await api.post("/settings/categories", { name: categoryName, label: categoryLabel });
      setCategoryName("");
      setCategoryLabel("");
      setSuccess("Categoría agregada exitosamente.");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      setError("No se pudo agregar la categoría.");
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Esto podría afectar a los productos asociados.")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/settings/categories/${catId}`);
      setSuccess("Categoría eliminada exitosamente.");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      setError("No se pudo eliminar la categoría.");
    }
  };

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 850, mx: "auto", p: { xs: 1, sm: 3 } }}>
      {/* Title */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 750, color: "var(--text-main)", mb: 0.5 }}>
          Configuración y Personalización
        </Typography>
        <Typography variant="body2" color="var(--text-muted)">
          Modifica los colores, logo corporativo, clasificaciones de productos e identidad general aplicables en la plataforma.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "var(--border-light)", mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "var(--primary) !important" },
            "& .MuiTabs-indicator": { bgcolor: "var(--primary)" }
          }}
        >
          <Tab label="⚙️ Ajustes Generales" value="general" />
          <Tab label="🏷️ Categorías del Catálogo" value="categories" />
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: "6px" }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ borderRadius: "6px" }}>{success}</Alert>}

      {activeTab === "general" && (
        <Grid container spacing={3}>
          {/* Logo Uploader */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: "var(--bg-card)", borderRadius: "6px", border: "1px solid var(--border-light)", textAlign: "center" }}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--text-main)" }}>Logo Corporativo</Typography>
                <Box sx={{
                  bgcolor: "rgba(115, 103, 240, 0.01)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "6px",
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  overflow: "hidden"
                }}>
                  {logoPreviewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logoPreviewUrl} alt="Logo" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                  ) : (
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>Sin Logo Cargado</Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="settings-logo-upload"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <Button 
                    component="label" 
                    htmlFor="settings-logo-upload" 
                    variant="outlined" 
                    size="small"
                    sx={{ textTransform: "none", fontWeight: 600, borderColor: "var(--border-light)", color: "var(--text-muted)" }}
                  >
                    Elegir Archivo Logo
                  </Button>
                  {logoFile && (
                    <Button
                      onClick={handleUploadLogo}
                      disabled={uploadingLogo}
                      variant="contained"
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 600, bgcolor: "var(--primary)", "&:hover": { bgcolor: "var(--primary-hover)" } }}
                    >
                      {uploadingLogo ? "Subiendo..." : "Subir Logo"}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Branding Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ bgcolor: "var(--bg-card)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, pb: 0.5, borderBottom: "1px solid var(--border-light)", color: "var(--text-main)" }}>
                    Identidad de Marca
                  </Typography>

                  <TextField
                    label="Nombre Comercial (App)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    disabled={saving}
                    required
                    sx={fieldStyle}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Teléfono Empresa"
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={saving}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Correo Empresa"
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={saving}
                        sx={fieldStyle}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Dirección Principal"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={saving}
                    sx={fieldStyle}
                  />

                  <TextField
                    label="Página Web"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={saving}
                    sx={fieldStyle}
                  />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, pb: 0.5, borderBottom: "1px solid var(--border-light)", color: "var(--text-main)", mt: 1 }}>
                    Estética & Temas
                  </Typography>

                  <Box>
                    <Typography variant="caption" color="var(--text-muted)" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                      Paletas de Colores Predeterminadas
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {PRESET_PALETTES.map((palette) => (
                        <Button
                          key={palette.name}
                          onClick={() => handleApplyPalette(palette)}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            textTransform: "none", 
                            fontSize: "11px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1,
                            py: 0.5,
                            borderColor: "var(--border-light)",
                            color: "var(--text-muted)"
                          }}
                        >
                          <Box sx={{ display: "flex", gap: "2px" }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: palette.primary }} />
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: palette.accent }} />
                          </Box>
                          {palette.name.split(" ")[0]}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="var(--text-muted)" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>Color Primario</Typography>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          style={{ border: "none", width: 40, height: 40, borderRadius: 4, cursor: "pointer", padding: 0, background: "transparent" }}
                        />
                        <TextField
                          size="small"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          sx={{ flex: 1, ...fieldStyle }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="var(--text-muted)" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>Color Acento</Typography>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          style={{ border: "none", width: 40, height: 40, borderRadius: 4, cursor: "pointer", padding: 0, background: "transparent" }}
                        />
                        <TextField
                          size="small"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          sx={{ flex: 1, ...fieldStyle }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <TextField
                    select
                    label="Tema Predeterminado"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={defaultTheme}
                    onChange={(e) => setDefaultTheme(e.target.value)}
                    disabled={saving}
                    sx={fieldStyle}
                  >
                    <MenuItem value="dark">Tema Oscuro (Moderno)</MenuItem>
                    <MenuItem value="light">Tema Claro (Limpio)</MenuItem>
                  </TextField>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      sx={{ bgcolor: "var(--primary)", "&:hover": { bgcolor: "var(--primary-hover)" }, textTransform: "none", borderRadius: "6px" }}
                    >
                      {saving ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
                      Guardar Personalización
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === "categories" && (
        <Grid container spacing={3}>
          {/* Add Category Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: "var(--bg-card)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: "var(--text-main)" }}>
                  Nueva Categoría
                </Typography>
                <Box component="form" onSubmit={handleAddCategory} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <TextField
                    label="Identificador (E.g. CAMERA)"
                    placeholder="En mayúsculas, sin espacios"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value.toUpperCase().replace(/\s/g, "_"))}
                    required
                    sx={fieldStyle}
                  />
                  <TextField
                    label="Etiqueta Visible (E.g. Cámaras)"
                    placeholder="Nombre que verá el usuario"
                    value={categoryLabel}
                    onChange={(e) => setCategoryLabel(e.target.value)}
                    required
                    sx={fieldStyle}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    sx={{ bgcolor: "var(--primary)", "&:hover": { bgcolor: "var(--primary-hover)" }, textTransform: "none", borderRadius: "6px", mt: 1 }}
                  >
                    Agregar Categoría
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Categories List Table */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ bgcolor: "var(--bg-card)", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: "var(--text-main)" }}>
                  Listado de Categorías Existentes
                </Typography>

                {loadingCats ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 1 }}>
                    <CircularProgress size={30} sx={{ color: "var(--primary)" }} />
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>Cargando categorías...</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "6px", borderColor: "var(--border-light)", bgcolor: "transparent" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "rgba(115, 103, 240, 0.02)" }}>
                        <TableRow>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Identificador</TableCell>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Etiqueta Visible</TableCell>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }} align="right">Eliminar</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categories.map((cat) => (
                          <TableRow key={cat.id}>
                            <TableCell sx={{ fontWeight: 650, color: "var(--text-main)", fontFamily: "monospace" }}>{cat.name}</TableCell>
                            <TableCell sx={{ color: "var(--text-main)" }}>{cat.label}</TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteCategory(cat.id)}
                                sx={{ color: "#ea5455" }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {categories.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ color: "var(--text-muted)", py: 4 }}>
                              No hay categorías dinámicas creadas.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
