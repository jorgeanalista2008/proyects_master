// d:\github\proyects_master\frontend\src\app\(dashboard)\catalog\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Dialog
} from "@mui/material";
import { Plus } from "lucide-react";

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
  marginCash: number;
  priceCash: number;
  marginCredit: number;
  priceCredit: number;
  marginPreferred: number;
  pricePreferred: number;
  images?: { id: string; fileName: string; mimeType: string }[];
  description?: string;
  suppliers?: { id: string; name: string }[];
}

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catalogData, categoriesData] = await Promise.all([
          api.get<CatalogItem[]>("/catalog"),
          api.get<Category[]>("/settings/categories")
        ]);
        setItems(catalogData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error("Error fetching catalog and categories:", err);
        setError("No se pudo cargar el catálogo de productos y servicios.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.sku.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "ALL" || 
      item.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD"
    }).format(val);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title & Action Bar */}
      <Box sx={{ display: "flex", justifycontent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "var(--text-main)" }}>
            Catálogo de Equipos y Servicios
          </Typography>
          <Typography variant="body2" color="var(--text-muted)">
            Administra los componentes de seguridad, sensores y las tres tarifas de precios sugeridas.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/catalog/new"
          variant="contained"
          color="primary"
          startIcon={<Plus className="w-4 h-4" />}
          sx={{
            borderRadius: "6px",
            textTransform: "none",
            bgcolor: "var(--primary)",
            boxShadow: "0 4px 8px 0 rgba(115, 103, 240, 0.3)",
            "&:hover": { bgcolor: "var(--primary-hover)" }
          }}
        >
          Crear Producto/Servicio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: "6px" }}>
          {error}
        </Alert>
      )}

      {/* Filters Box */}
      <Card sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "6px", boxShadow: "var(--shadow-sm)" }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Buscar por SKU o Nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    "& fieldset": { borderColor: "var(--border-light)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--primary)" }
                  },
                  "& .MuiInputBase-input": { color: "var(--text-main)" }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    "& fieldset": { borderColor: "var(--border-light)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--primary)" }
                  },
                  "& .MuiInputBase-input": { color: "var(--text-main)" }
                }}
              >
                <MenuItem value="ALL">Todas las Categorías</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 2 }}>
          <CircularProgress sx={{ color: "var(--primary)" }} />
          <Typography variant="body2" color="var(--text-muted)">Cargando catálogo...</Typography>
        </Box>
      ) : filteredItems.length === 0 ? (
        <Card sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "6px", textAlign: "center", py: 8 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Typography variant="h3">📦</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text-main)" }}>Catálogo Vacío</Typography>
            <Typography variant="body2" color="var(--text-muted)" sx={{ maxWidth: 360, mb: 1 }}>
              No se encontraron productos o servicios que coincidan con la búsqueda.
            </Typography>
            <Button component={Link} href="/catalog/new" variant="outlined" sx={{ textTransform: "none", borderRadius: "6px", borderColor: "var(--primary)", color: "var(--primary)" }}>
              Crear el Primer Producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "6px", boxShadow: "var(--shadow-sm)", height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", gap: 2 }}>
                  {/* Thumbnail */}
                  <Box 
                    onClick={() => {
                      if (item.images && item.images.length > 0) {
                        setSelectedImage(getApiUrl(`/images/${item.images[0].id}`));
                      }
                    }}
                    sx={{ 
                      position: "relative",
                      width: "100%", 
                      height: 160, 
                      bgcolor: "rgba(115, 103, 240, 0.01)",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: item.images && item.images.length > 0 ? "pointer" : "default",
                      "&:hover": item.images && item.images.length > 0 ? {
                        "& img": {
                          transform: "scale(1.06)"
                        }
                      } : {}
                    }}
                  >
                    {item.images && item.images.length > 0 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getApiUrl(`/images/${item.images[0].id}`)}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease-in-out" }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <Typography variant="h4">📷</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sin Imagen</Typography>
                      </Box>
                    )}
                    <Chip 
                      label={item.sku} 
                      size="small" 
                      sx={{ 
                        position: "absolute", 
                        top: 8, 
                        right: 8, 
                        bgcolor: "var(--bg-card)", 
                        border: "1px solid var(--border-light)", 
                        color: "var(--text-main)",
                        fontWeight: 700 
                      }} 
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", display: "block", mb: 0.5 }}>
                      {item.category?.label || "Sin Categoría"}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--text-main)", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", height: 40, overflow: "hidden" }}>
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" color="var(--text-muted)" sx={{ lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", height: 36, overflow: "hidden", mt: 1 }}>
                        {item.description}
                      </Typography>
                    )}
                    {item.suppliers && item.suppliers.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.5 }}>
                        {item.suppliers.map((sup: any) => (
                          <Chip 
                            key={sup.id} 
                            label={sup.name} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              fontSize: "0.7rem", 
                              height: 20, 
                              borderColor: "var(--border-light)", 
                              color: "var(--text-muted)" 
                            }} 
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ borderColor: "var(--border-light)" }} />

                  <Box sx={{ bgcolor: "rgba(115, 103, 240, 0.02)", p: 2, borderRadius: "6px", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="var(--text-muted)">Costo Adquisición:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--text-main)" }}>{formatUSD(item.unitCost)}</Typography>
                    </Box>
                    <Divider sx={{ my: 0.5, borderColor: "var(--border-light)" }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="var(--text-muted)">Contado (+{item.marginCash}%):</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--primary)" }}>{formatUSD(item.priceCash)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="var(--text-muted)">Crédito (+{item.marginCredit}%):</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#fbbf24" }}>{formatUSD(item.priceCredit)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="var(--text-muted)">Preferente (+{item.marginPreferred}%):</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--accent)" }}>{formatUSD(item.pricePreferred)}</Typography>
                    </Box>
                  </Box>

                  <Button
                    component={Link}
                    href={`/catalog/${item.id}`}
                    variant="outlined"
                    fullWidth
                    sx={{ textTransform: "none", fontWeight: 600, borderColor: "var(--border-light)", color: "var(--text-muted)", "&:hover": { borderColor: "var(--primary)", color: "var(--primary)" } }}
                  >
                    Editar Producto
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden"
          }
        }}
      >
        {selectedImage && (
          <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Visualización del Producto"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "8px",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-card)"
              }}
            />
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
