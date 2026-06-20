// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\[id]\quotes\new\page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Trash2, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
  label: string;
}

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category: Category;
  unitCost: number;
  priceCash: number;
  priceCredit: number;
  pricePreferred: number;
  marginCash: number;
  marginCredit: number;
  marginPreferred: number;
}

interface QuoteItem {
  catalogItemId: string;
  sku: string;
  name: string;
  unitCost: number;
  priceCash: number;
  priceCredit: number;
  pricePreferred: number;
  marginCash: number;
  marginCredit: number;
  marginPreferred: number;
  quantity: number;
  priceType: "CASH" | "CREDIT" | "PREFERRED";
}

interface ProjectImage {
  id: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  images?: ProjectImage[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewQuoteBuilder({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Data states
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Navigation & Tabs states
  const [leftTab, setLeftTab] = useState<"catalog" | "photos">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Quote configuration
  const [currency, setCurrency] = useState<string>("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [taxRate, setTaxRate] = useState<number>(19); // 19% standard VAT/IVA
  const [discount, setDiscount] = useState<number>(0);
  
  // Expiration and terms
  const [validUntil, setValidUntil] = useState<string>("");
  const [terms, setTerms] = useState<string>("Términos de pago: 50% anticipado, 50% contra entrega. Validez de la cotización: 15 días.");

  // Selected items in the builder
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);

  // General Status states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load catalog items, categories, and project details
  useEffect(() => {
    async function loadData() {
      try {
        setFetching(true);
        const [catalogData, projectData, categoriesData] = await Promise.all([
          api.get<CatalogItem[]>("/catalog"),
          api.get<Project>(`/projects/${projectId}`),
          api.get<Category[]>("/settings/categories")
        ]);
        setCatalog(catalogData);
        setProject(projectData);
        setCategories(categoriesData);

        // Pre-fill validUntil to 15 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        setValidUntil(futureDate.toISOString().split("T")[0]);
      } catch (err) {
        console.error("Error loading builder data:", err);
        setError("No se pudo cargar la información del catálogo o del proyecto.");
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [projectId]);

  // Adjust default exchange rate based on currency selection
  useEffect(() => {
    if (currency === "USD") setExchangeRate(1);
    else if (currency === "CLP") setExchangeRate(920);
    else if (currency === "MXN") setExchangeRate(18.5);
    else if (currency === "COP") setExchangeRate(3900);
    else if (currency === "EUR") setExchangeRate(0.92);
  }, [currency]);

  // Filter Catalog items based on search query and category tab
  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "ALL") return matchesSearch;
    return matchesSearch && item.categoryId === selectedCategory;
  });

  // Add item to quote list
  const addItemToQuote = (item: CatalogItem) => {
    const existingIndex = selectedItems.findIndex((q) => q.catalogItemId === item.id);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          catalogItemId: item.id,
          sku: item.sku,
          name: item.name,
          unitCost: item.unitCost,
          priceCash: item.priceCash,
          priceCredit: item.priceCredit,
          pricePreferred: item.pricePreferred,
          marginCash: item.marginCash,
          marginCredit: item.marginCredit,
          marginPreferred: item.marginPreferred,
          quantity: 1,
          priceType: "CASH"
        }
      ]);
    }
    setSuccess(`Agregado: ${item.name}`);
    setTimeout(() => setSuccess(""), 1500);
  };

  const removeItemFromQuote = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const updateQuantity = (index: number, val: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, val);
    setSelectedItems(updated);
  };

  const updatePriceType = (index: number, type: "CASH" | "CREDIT" | "PREFERRED") => {
    const updated = [...selectedItems];
    updated[index].priceType = type;
    setSelectedItems(updated);
  };

  // Image Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      setError("");
      setSuccess("");

      try {
        // Comprimir y convertir a JPG en el cliente
        const compressedFile = await compressAndConvertToJpeg(file);

        const formData = new FormData();
        formData.append("file", compressedFile);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const response = await fetch(getApiUrl(`/images/project/${projectId}`), {
          method: "POST",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la imagen del levantamiento.");
        }

        setSuccess("Foto del levantamiento subida con éxito.");
        
        // Reload project to update images list
        const updatedProject = await api.get<Project>(`/projects/${projectId}`);
        setProject(updatedProject);
      } catch (err: any) {
        console.error("Error uploading image in builder:", err);
        setError(err.message || "Error al cargar la imagen.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- FINANCIAL CALCULATIONS (REAL-TIME) ---
  const getActiveUnitPrice = (item: QuoteItem) => {
    if (item.priceType === "CREDIT") return Number(item.priceCredit) || 0;
    if (item.priceType === "PREFERRED") return Number(item.pricePreferred) || 0;
    return Number(item.priceCash) || 0;
  };

  const subtotalUSD = selectedItems.reduce((acc, item) => acc + getActiveUnitPrice(item) * item.quantity, 0);
  const costUSD = selectedItems.reduce((acc, item) => acc + Number(item.unitCost) * item.quantity, 0);

  const subtotal = subtotalUSD * exchangeRate;
  const costTotal = costUSD * exchangeRate;
  const discountVal = Math.min(subtotal, Math.max(0, discount));
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const tax = taxableAmount * (taxRate / 100);
  const total = taxableAmount + tax;

  const profit = taxableAmount - costTotal;
  const profitMarginPercent = taxableAmount > 0 ? (profit / taxableAmount) * 100 : 0;

  const getMarginColors = () => {
    if (profitMarginPercent < 20) return { bg: "rgba(234, 84, 85, 0.1)", border: "#ea5455", text: "#ea5455" };
    if (profitMarginPercent < 35) return { bg: "rgba(255, 159, 67, 0.1)", border: "#ff9f43", text: "#ff9f43" };
    return { bg: "rgba(40, 199, 111, 0.1)", border: "#28c76f", text: "#28c76f" };
  };

  const getMarginText = () => {
    if (profitMarginPercent < 20) return "⚠️ Margen bajo el umbral meta.";
    if (profitMarginPercent < 35) return "⚡ Margen aceptable, revisar descuentos.";
    return "✨ Margen óptimo y saludable.";
  };

  const getImageUrl = (imageId: string) => {
    return getApiUrl(`/images/${imageId}`);
  };

  const formattedValue = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency
    }).format(val);
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (selectedItems.length === 0) {
      setError("Debes agregar al menos un elemento del catálogo a la cotización.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        projectId,
        currency,
        exchangeRate,
        taxRate,
        discount: discountVal,
        validUntil,
        terms,
        subtotal,
        tax,
        total,
        items: selectedItems.map((item) => ({
          productId: item.catalogItemId,
          quantity: item.quantity,
          priceType: item.priceType
        }))
      };

      await api.post("/quotes", payload);
      setSuccess("¡Cotización creada con éxito!");
      
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error saving quote:", err);
      setError(err.message || "No se pudo guardar la cotización.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: 2 }}>
        <CircularProgress size={40} sx={{ color: "var(--primary)" }} />
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Cargando catálogo y levantamiento del proyecto...
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

  const marginInfo = getMarginColors();

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Header breadcrumb */}
      <Box sx={{ mb: 4 }}>
        <Link href={`/projects/${projectId}`} style={{ textDecoration: "none" }}>
          <Button variant="text" size="small" sx={{ color: "var(--text-muted)", mb: 2, textTransform: "none", fontSize: "0.9rem" }}>
            ← Volver al Proyecto
          </Button>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 650, color: "var(--text-main)", mb: 0.5 }}>
          Constructor de Cotizaciones
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Proyecto: <Box component="span" sx={{ color: "var(--primary)", fontWeight: "bold" }}>{project?.name}</Box> | Cliente: <Box component="span" sx={{ fontWeight: 600, color: "var(--text-main)" }}>{project?.client?.name}</Box>
        </Typography>
      </Box>

      {/* Status Alerts */}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "6px" }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "6px" }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* LEFT PANEL: CATALOG & PHOTOS WORKSPACE */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ 
            bgcolor: "var(--bg-card)", 
            borderRadius: "6px", 
            border: "1px solid var(--border-light)", 
            boxShadow: "var(--shadow-sm)",
            mb: 4
          }}>
            <Box sx={{ borderBottom: 1, borderColor: "var(--border-light)" }}>
              <Tabs 
                value={leftTab} 
                onChange={(_, newValue) => setLeftTab(newValue)} 
                sx={{
                  "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem", py: 1.5 },
                  "& .Mui-selected": { color: "var(--primary) !important" },
                  "& .MuiTabs-indicator": { bgcolor: "var(--primary)" }
                }}
              >
                <Tab label="Catálogo de Equipos" value="catalog" />
                <Tab label="Fotos de Levantamiento" value="photos" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {leftTab === "catalog" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--text-main)" }}>
                      Catálogo de Equipos y Servicios
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--text-muted)", fontWeight: 500 }}>
                      {filteredCatalog.length} ítems
                    </Typography>
                  </Box>

                  {/* Category buttons row */}
                  <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, borderBottom: "1px solid var(--border-light)" }}>
                    <Button
                      variant={selectedCategory === "ALL" ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setSelectedCategory("ALL")}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        px: 2,
                        bgcolor: selectedCategory === "ALL" ? "var(--primary)" : "transparent",
                        borderColor: selectedCategory === "ALL" ? "var(--primary)" : "var(--border-light)",
                        color: selectedCategory === "ALL" ? "#fff" : "var(--text-muted)",
                        "&:hover": {
                          bgcolor: selectedCategory === "ALL" ? "var(--primary-hover)" : "var(--primary-light)",
                          borderColor: "var(--primary)"
                        }
                      }}
                    >
                      Todo
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setSelectedCategory(cat.id)}
                        sx={{
                          borderRadius: "20px",
                          textTransform: "none",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap",
                          px: 2,
                          bgcolor: selectedCategory === cat.id ? "var(--primary)" : "transparent",
                          borderColor: selectedCategory === cat.id ? "var(--primary)" : "var(--border-light)",
                          color: selectedCategory === cat.id ? "#fff" : "var(--text-muted)",
                          "&:hover": {
                            bgcolor: selectedCategory === cat.id ? "var(--primary-hover)" : "var(--primary-light)",
                            borderColor: "var(--primary)"
                          }
                        }}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </Box>

                  {/* Search input */}
                  <TextField
                    fullWidth
                    placeholder="Buscar equipos por SKU o Nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: <Search size={16} style={{ marginRight: 8, color: "var(--text-muted)" }} />
                      }
                    }}
                    sx={fieldStyle}
                  />

                  {/* Catalog items list scrollable */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 360, overflowY: "auto", pr: 1 }}>
                    {filteredCatalog.length === 0 ? (
                      <Typography variant="body2" align="center" sx={{ color: "var(--text-muted)", py: 6 }}>
                        No se encontraron artículos que coincidan con la búsqueda.
                      </Typography>
                    ) : (
                      filteredCatalog.map((item) => (
                        <Box 
                          key={item.id}
                          sx={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            p: 2, 
                            borderRadius: "6px",
                            bgcolor: "rgba(115, 103, 240, 0.02)",
                            border: "1px solid var(--border-light)",
                            "&:hover": { borderColor: "rgba(115, 103, 240, 0.4)" }
                          }}
                        >
                          <Box sx={{ minWidth: 0, pr: 2 }}>
                            <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: "var(--text-main)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                              SKU: <Box component="span" sx={{ color: "var(--primary)", fontWeight: "bold", fontFamily: "monospace" }}>{item.sku}</Box> | {item.category?.label || "Sin Categoría"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                              {formattedValue(item.priceCash)}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => addItemToQuote(item)}
                              sx={{ 
                                textTransform: "none", 
                                borderRadius: "4px", 
                                fontSize: "0.7rem", 
                                py: 0.5,
                                borderColor: "var(--primary)",
                                color: "var(--primary)",
                                "&:hover": { bgcolor: "var(--primary)", color: "#fff" }
                              }}
                            >
                              Añadir
                            </Button>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              )}

              {leftTab === "photos" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--text-main)" }}>
                    Galería de Fotos Levantamiento
                  </Typography>

                  <Box 
                    onClick={triggerFileInput}
                    sx={{ 
                      border: "2px dashed var(--border-light)", 
                      bgcolor: "rgba(115, 103, 240, 0.01)", 
                      p: 4, 
                      borderRadius: "6px", 
                      textAlign: "center", 
                      cursor: "pointer",
                      "&:hover": { bgcolor: "var(--primary-light)", borderColor: "var(--primary)" }
                    }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      hidden
                      accept="image/*"
                    />
                    {uploadingImage ? (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={24} sx={{ color: "var(--primary)" }} />
                        <Typography variant="caption" sx={{ color: "var(--text-muted)", fontWeight: 500 }}>Subiendo archivo...</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>📤</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--text-main)" }}>Haz clic o arrastra fotos</Typography>
                        <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>Soporta JPG, PNG, GIF de instalación</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Images Grid */}
                  <Grid container spacing={2} sx={{ maxHeight: 350, overflowY: "auto", pr: 1 }}>
                    {(project?.images || []).length === 0 ? (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" align="center" sx={{ color: "var(--text-muted)", py: 6 }}>
                          No hay imágenes cargadas en este proyecto.
                        </Typography>
                      </Grid>
                    ) : (
                      (project?.images || []).map((img) => (
                        <Grid size={{ xs: 6 }} key={img.id}>
                          <Card sx={{ 
                            borderRadius: "6px", 
                            border: "1px solid var(--border-light)", 
                            bgcolor: "var(--bg-card)",
                            overflow: "hidden" 
                          }}>
                            <Box sx={{ height: 110, bgcolor: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getImageUrl(img.id)}
                                alt={img.fileName}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            </Box>
                            <Box sx={{ p: 1, bgcolor: "rgba(115, 103, 240, 0.02)" }}>
                              <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: "var(--text-main)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={img.fileName}>
                                {img.fileName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                {new Date(img.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT PANEL: LIVE QUOTE SHEET */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ 
            bgcolor: "var(--bg-card)", 
            borderRadius: "6px", 
            border: "1px solid var(--border-light)", 
            boxShadow: "var(--shadow-sm)" 
          }}>
            <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--text-main)" }}>
                Presupuesto de Materiales Cotizados
              </Typography>

              {selectedItems.length === 0 ? (
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 2, 
                  py: 12, 
                  border: "1px dashed var(--border-light)", 
                  borderRadius: "6px",
                  bgcolor: "rgba(115, 103, 240, 0.01)"
                }}>
                  <Box sx={{ p: 2, borderRadius: "6px", border: "1px solid var(--border-light)", bgcolor: "var(--bg-card)", color: "var(--text-muted)" }}>
                    📦
                  </Box>
                  <Typography variant="body2" align="center" sx={{ color: "var(--text-muted)", maxWidth: 280 }}>
                    Tu cotización está vacía. Añade elementos del catálogo para estructurar la cotización.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  
                  {/* Table View */}
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "6px", borderColor: "var(--border-light)", bgcolor: "transparent" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "rgba(115, 103, 240, 0.02)" }}>
                        <TableRow>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "0.75rem" }}>Artículo</TableCell>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "0.75rem" }}>Tarifa</TableCell>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "0.75rem" }}>Cant.</TableCell>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "0.75rem" }} align="right">Subtotal</TableCell>
                          <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "0.75rem" }} align="center"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedItems.map((item, index) => {
                          const activePrice = getActiveUnitPrice(item);
                          const itemSubtotal = activePrice * item.quantity * exchangeRate;
                          return (
                            <TableRow key={item.catalogItemId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: "var(--text-main)" }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.65rem", fontWeight: "bold" }}>
                                  SKU: {item.sku}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Select
                                  size="small"
                                  value={item.priceType}
                                  onChange={(e) => updatePriceType(index, e.target.value as any)}
                                  sx={{ 
                                    borderRadius: "4px", 
                                    fontSize: "0.75rem", 
                                    height: 30,
                                    "& fieldset": { borderColor: "var(--border-light)" } 
                                  }}
                                >
                                  <MenuItem value="CASH">Contado</MenuItem>
                                  <MenuItem value="CREDIT">Crédito</MenuItem>
                                  <MenuItem value="PREFERRED">Preferente</MenuItem>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Button 
                                    size="small"
                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                    sx={{ minWidth: 22, height: 22, p: 0, bgcolor: "var(--primary-light)", color: "var(--primary)" }}
                                  >
                                    -
                                  </Button>
                                  <Typography variant="caption" sx={{ width: 20, textAlign: "center", color: "var(--text-main)", fontWeight: "bold" }}>
                                    {item.quantity}
                                  </Typography>
                                  <Button 
                                    size="small"
                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                    sx={{ minWidth: 22, height: 22, p: 0, bgcolor: "var(--primary-light)", color: "var(--primary)" }}
                                  >
                                    +
                                  </Button>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-main)", fontSize: "0.8rem" }}>
                                {formattedValue(itemSubtotal)}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton size="small" onClick={() => removeItemFromQuote(index)} sx={{ color: "#ea5455" }}>
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Financial Configuration Inputs */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <FormControl fullWidth sx={fieldStyle}>
                        <InputLabel shrink id="currency-label">Moneda Base</InputLabel>
                        <Select
                          labelId="currency-label"
                          label="Moneda Base"
                          notched
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          sx={{ borderRadius: "6px" }}
                        >
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="CLP">CLP ($)</MenuItem>
                          <MenuItem value="MXN">MXN ($)</MenuItem>
                          <MenuItem value="COP">COP ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Tasa Cambio"
                        type="number"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(Number(e.target.value))}
                        slotProps={{ 
                          inputLabel: { shrink: true },
                          htmlInput: { step: "0.01" }
                        }}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Impuesto (IVA %)"
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={fieldStyle}
                      />
                    </Grid>
                  </Grid>

                  {/* Summary Box */}
                  <Box sx={{ 
                    bgcolor: "rgba(115, 103, 240, 0.02)", 
                    border: "1px solid var(--border-light)", 
                    p: 2.5, 
                    borderRadius: "6px", 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 1.5 
                  }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>Subtotal Neto:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-main)" }}>
                        {formattedValue(subtotal)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                        Descuento Aplicado ({currency})
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        slotProps={{ htmlInput: { style: { textAlign: "right", fontFamily: "monospace" } } }}
                        sx={{ ...fieldStyle, width: 120 }}
                      />
                    </Box>

                    <Divider sx={{ my: 1, borderColor: "var(--border-light)" }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--text-main)" }}>
                        TOTAL PRESUPUESTADO
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily: "monospace", fontWeight: 750, color: "var(--primary)" }}>
                        {formattedValue(total)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Rentabilidad Box */}
                  <Box sx={{ 
                    bgcolor: marginInfo.bg, 
                    border: `1px solid ${marginInfo.border}`, 
                    color: marginInfo.text, 
                    p: 2.5, 
                    borderRadius: "6px" 
                  }}>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", opacity: 0.8 }}>
                      Rentabilidad de Cotización
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mt: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "monospace" }}>
                        {Math.round(profitMarginPercent * 10) / 10}%
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Utilidad: {formattedValue(profit)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ display: "block", mt: 1, fontWeight: 600, fontSize: "0.7rem" }}>
                      {getMarginText()}
                    </Typography>
                  </Box>

                  {/* Date and terms */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Vencimiento Cotización"
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={fieldStyle}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Términos de Pago y Condiciones"
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={fieldStyle}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    onClick={handleSaveQuote}
                    sx={{
                      borderRadius: "6px",
                      py: 1.5,
                      fontWeight: 700,
                      bgcolor: "var(--primary)",
                      boxShadow: "0 4px 8px 0 rgba(115, 103, 240, 0.3)",
                      "&:hover": { bgcolor: "var(--primary-hover)" }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "💾 Guardar Presupuesto"
                    )}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
