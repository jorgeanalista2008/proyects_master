// d:\github\proyects_master\frontend\src\app\(dashboard)\catalog\[id]\page.tsx
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
  Chip
} from "@mui/material";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Category {
  id: string;
  name: string;
  label: string;
}

export default function CatalogItemForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  
  // Cost and margins
  const [unitCost, setUnitCost] = useState<number>(0);
  const [marginCash, setMarginCash] = useState<number>(30); // 30% default margin cash
  const [marginCredit, setMarginCredit] = useState<number>(40); // 40% default margin credit
  const [marginPreferred, setMarginPreferred] = useState<number>(20); // 20% default margin preferred
  
  // Suggested prices
  const [priceCash, setPriceCash] = useState<number>(0);
  const [priceCredit, setPriceCredit] = useState<number>(0);
  const [pricePreferred, setPricePreferred] = useState<number>(0);
  
  const [imageId, setImageId] = useState<string | null>(null);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

  // Fetch product and categories data
  useEffect(() => {
    async function loadData() {
      try {
        setFetching(true);
        // Load categories first
        const categoriesData = await api.get<Category[]>("/settings/categories");
        setCategories(categoriesData);

        // Fetch all suppliers
        try {
          const suppliersData = await api.get<any[]>("/suppliers");
          setSuppliers(suppliersData);
        } catch (e) {
          console.warn("Could not load suppliers list", e);
        }

        if (!isNew) {
          const data = await api.get<any>(`/catalog/${id}`);
          setName(data.name || "");
          setSku(data.sku || "");
          setCategoryId(data.categoryId || "");
          setDescription(data.description || "");
          setUnitCost(Number(data.unitCost) || 0);
          setMarginCash(Number(data.marginCash) ?? 30);
          setMarginCredit(Number(data.marginCredit) ?? 40);
          setMarginPreferred(Number(data.marginPreferred) ?? 20);
          setPriceCash(Number(data.priceCash) || 0);
          setPriceCredit(Number(data.priceCredit) || 0);
          setPricePreferred(Number(data.pricePreferred) || 0);
          setImageId((data.images && data.images.length > 0) ? data.images[0].id : null);
          setSelectedSupplierIds(data.suppliers ? data.suppliers.map((s: any) => s.id) : []);
        }
      } catch (err: any) {
        console.error("Error loading catalog details and categories:", err);
        setError("No se pudo cargar la información del catálogo o las categorías.");
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id, isNew]);

  // Recalculate suggested sale prices in real-time when unitCost or margins change
  useEffect(() => {
    const calcCash = unitCost * (1 + marginCash / 100);
    const calcCredit = unitCost * (1 + marginCredit / 100);
    const calcPref = unitCost * (1 + marginPreferred / 100);
    
    setPriceCash(Math.round(calcCash * 100) / 100);
    setPriceCredit(Math.round(calcCredit * 100) / 100);
    setPricePreferred(Math.round(calcPref * 100) / 100);
  }, [unitCost, marginCash, marginCredit, marginPreferred]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image to backend
  const uploadImage = async (productId: string) => {
    if (!imageFile) return;

    // Comprimir y convertir a JPG en el cliente
    const compressedFile = await compressAndConvertToJpeg(imageFile);

    const formData = new FormData();
    formData.append("file", compressedFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(getApiUrl(`/images/product/${productId}`), {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `La carga de la imagen falló (Status ${response.status}).`;
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
        } catch {}
      }
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !sku || !categoryId) {
      setError("Nombre, SKU y Categoría son campos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        sku,
        categoryId,
        description,
        unitCost,
        marginCash,
        priceCash,
        marginCredit,
        priceCredit,
        marginPreferred,
        pricePreferred,
        supplierIds: selectedSupplierIds
      };

      let savedItem: any;

      if (isNew) {
        savedItem = await api.post("/catalog", payload);
      } else {
        savedItem = await api.patch(`/catalog/${id}`, payload);
      }

      if (imageFile) {
        const productId = isNew ? savedItem.id : id;
        await uploadImage(productId);
      }

      setSuccess(`¡Producto ${isNew ? "creado" : "actualizado"} con éxito!`);
      
      setTimeout(() => {
        router.push("/catalog");
      }, 1500);

    } catch (err: any) {
      console.error("Error saving catalog item:", err);
      setError(err.message || "Error al intentar guardar el producto en el catálogo.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: 2 }}>
        <CircularProgress size={40} sx={{ color: "var(--primary)" }} />
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Cargando información del producto...
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
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 1, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Link href="/catalog" style={{ textDecoration: "none" }}>
          <Button variant="text" size="small" sx={{ color: "var(--text-muted)", mb: 2, textTransform: "none", fontSize: "0.9rem" }}>
            ← Volver al Catálogo
          </Button>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text-main)", mb: 0.5 }}>
          {isNew ? "Crear Nuevo Producto" : `Editar Producto: ${sku}`}
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          {isNew ? "Ingresa la ficha técnica y configura los márgenes de venta sugeridos" : "Actualiza la información técnica y costos de este elemento."}
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SKU / Código Único"
                  placeholder="CAM-IP-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel shrink id="category-label">Categoría</InputLabel>
                  <Select
                    labelId="category-label"
                    label="Categoría"
                    notched
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={loading}
                    required
                    sx={{ borderRadius: "6px" }}
                  >
                    <MenuItem value="">-- Selecciona Categoría --</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre del Producto / Servicio"
                  placeholder="Cámara Domo IP 4MP Varifocal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  placeholder="Ficha técnica detallada o alcance del servicio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel shrink id="suppliers-label">Proveedores</InputLabel>
                  <Select
                    labelId="suppliers-label"
                    label="Proveedores"
                    multiple
                    notched
                    value={selectedSupplierIds}
                    onChange={(e) => setSelectedSupplierIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                    disabled={loading}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const sup = suppliers.find(s => s.id === value);
                          return <Chip key={value} label={sup ? sup.name : value} size="small" sx={{ bgcolor: "rgba(115, 103, 240, 0.08)", color: "var(--primary)" }} />;
                        })}
                      </Box>
                    )}
                    sx={{ borderRadius: "6px" }}
                  >
                    {suppliers.map((sup) => (
                      <MenuItem key={sup.id} value={sup.id}>
                        {sup.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Pricing Structure Box */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  bgcolor: "rgba(115, 103, 240, 0.04)", 
                  border: "1px solid var(--border-light)", 
                  p: 3, 
                  borderRadius: "6px" 
                }}>
                  <Typography variant="subtitle2" sx={{ color: "var(--primary)", fontWeight: 700, mb: 3 }}>
                    Estructura de Precios Multi-Tarifa (USD)
                  </Typography>

                  <Grid container spacing={3} sx={{ pb: 3, mb: 3, borderBottom: "1px solid var(--border-light)" }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Costo Adquisición ($)"
                        type="number"
                        placeholder="0.00"
                        value={unitCost}
                        onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        required
                        slotProps={{ 
                          inputLabel: { shrink: true },
                          htmlInput: { step: "0.01", min: "0" }
                        }}
                        sx={{
                          ...fieldStyle,
                          "& .MuiOutlinedInput-root": {
                            ...fieldStyle["& .MuiOutlinedInput-root"],
                            borderLeft: "3px solid var(--accent)"
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                        Ingresa el costo neto de importación o compra del equipo. Los tres precios de venta sugeridos se autocalcularán en base a este costo y el respectivo margen.
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    {/* Contado */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--primary)", mb: 1 }}>
                        💵 Precio al Contado:
                      </Typography>
                      <TextField
                        fullWidth
                        label="Margen Contado (%)"
                        type="number"
                        value={marginCash}
                        onChange={(e) => setMarginCash(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        required
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ ...fieldStyle, mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Precio Contado ($)"
                        type="number"
                        value={priceCash}
                        onChange={(e) => setPriceCash(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        slotProps={{ 
                          inputLabel: { shrink: true },
                          htmlInput: { step: "0.01" }
                        }}
                        sx={fieldStyle}
                      />
                    </Grid>

                    {/* Credito */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#fbbf24", mb: 1 }}>
                        💳 Precio a Crédito:
                      </Typography>
                      <TextField
                        fullWidth
                        label="Margen Crédito (%)"
                        type="number"
                        value={marginCredit}
                        onChange={(e) => setMarginCredit(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        required
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ ...fieldStyle, mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Precio Crédito ($)"
                        type="number"
                        value={priceCredit}
                        onChange={(e) => setPriceCredit(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        slotProps={{ 
                          inputLabel: { shrink: true },
                          htmlInput: { step: "0.01" }
                        }}
                        sx={fieldStyle}
                      />
                    </Grid>

                    {/* Preferencial */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--accent)", mb: 1 }}>
                        ⭐ Precio Preferencial:
                      </Typography>
                      <TextField
                        fullWidth
                        label="Margen Preferente (%)"
                        type="number"
                        value={marginPreferred}
                        onChange={(e) => setMarginPreferred(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        required
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ ...fieldStyle, mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Precio Preferente ($)"
                        type="number"
                        value={pricePreferred}
                        onChange={(e) => setPricePreferred(parseFloat(e.target.value) || 0)}
                        disabled={loading}
                        slotProps={{ 
                          inputLabel: { shrink: true },
                          htmlInput: { step: "0.01" }
                        }}
                        sx={fieldStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Upload image preview box */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{
                  bgcolor: "rgba(115, 103, 240, 0.02)",
                  border: "1px dashed var(--border-light)",
                  p: 3,
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2
                }}>
                  <Typography variant="subtitle2" sx={{ color: "var(--text-main)" }}>
                    Imagen del Producto
                  </Typography>

                  {(imagePreview || imageId) && (
                    <Box sx={{
                      width: 200,
                      height: 150,
                      borderRadius: "4px",
                      overflow: "hidden",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview || getApiUrl(`/images/${imageId}`)}
                        alt="Vista Previa"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  )}

                  <Button 
                    variant="outlined" 
                    component="label"
                    size="small"
                    sx={{ 
                      borderRadius: "6px", 
                      textTransform: "none", 
                      borderColor: "var(--border-light)", 
                      color: "var(--text-muted)",
                      "&:hover": { borderColor: "var(--text-muted)", bgcolor: "var(--bg-app)" }
                    }}
                  >
                    📷 {imagePreview || imageId ? "Cambiar Imagen" : "Subir Imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Button>
                  {imageFile && (
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                      Archivo seleccionado: {imageFile.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: "var(--border-light)" }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Link href="/catalog" style={{ textDecoration: "none" }}>
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
                {isNew ? "Guardar Producto" : "Guardar Cambios"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
