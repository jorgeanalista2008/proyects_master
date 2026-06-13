// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\[id]\quotes\new\page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
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

const CATEGORIES = [
  { key: "ALL", label: "📋 Todo" },
  { key: "CAMERA", label: "📹 Cámaras" },
  { key: "DVR_NVR", label: "💾 DVR / NVR" },
  { key: "CABLE", label: "🔌 Cableado" },
  { key: "TUBING", label: "⚙️ Canalización" },
  { key: "ACCESSORY", label: "🛠️ Accesorios" },
  { key: "LABOR", label: "👨‍🔧 Mano de Obra" },
  { key: "SERVICE", label: "🚗 Servicios" }
];

export default function NewQuoteBuilder({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Data states
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [project, setProject] = useState<Project | null>(null);

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

  // Load catalog items and project details
  useEffect(() => {
    async function loadData() {
      try {
        setFetching(true);
        const [catalogData, projectData] = await Promise.all([
          api.get<CatalogItem[]>("/catalog"),
          api.get<Project>(`/projects/${projectId}`)
        ]);
        setCatalog(catalogData);
        setProject(projectData);

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
    return matchesSearch && item.category === selectedCategory;
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
    setTimeout(() => setSuccess(""), 2000);
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

      const formData = new FormData();
      formData.append("file", file);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      try {
        const response = await fetch(`http://localhost:3000/api/images/project/${projectId}`, {
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

  const getActiveMargin = (item: QuoteItem) => {
    if (item.priceType === "CREDIT") return Number(item.marginCredit) || 0;
    if (item.priceType === "PREFERRED") return Number(item.marginPreferred) || 0;
    return Number(item.marginCash) || 0;
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

  // Margin categorization for gauge color
  const getMarginClass = () => {
    if (profitMarginPercent < 20) return "margin-danger";
    if (profitMarginPercent < 35) return "margin-warning";
    return "margin-success";
  };

  const getMarginText = () => {
    if (profitMarginPercent < 20) return "⚠️ Margen bajo el umbral meta.";
    if (profitMarginPercent < 35) return "⚡ Margen aceptable, revisar descuentos.";
    return "✨ Margen óptimo y saludable.";
  };

  const getImageUrl = (imageId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${base}/images/${imageId}`;
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
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando catálogo y levantamiento del proyecto...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header breadcrumb */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/projects/${projectId}`} style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          ⬅️ Volver al Proyecto
        </Link>
        <h1 className="title-primary">Constructor de Cotizaciones</h1>
        <p className="subtitle-secondary">
          Proyecto: <strong style={{ color: "hsl(var(--primary))" }}>{project?.name}</strong> | Cliente: <strong>{project?.client?.name}</strong>
        </p>
      </div>

      {/* Status Toasts */}
      {error && (
        <div style={{
          background: "hsla(0, 84.2%, 60.2%, 0.15)",
          border: "1px solid hsl(var(--danger))",
          color: "#ff8888",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "hsla(142.1, 70.6%, 45.3%, 0.15)",
          border: "1px solid hsl(var(--success))",
          color: "#a3e635",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem"
        }}>
          ✓ {success}
        </div>
      )}

      {/* Main Split-Panel Workspace */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.25fr",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* ========================================== */}
        {/* LEFT PANEL: CATALOG & PHOTOS WORKSPACE      */}
        {/* ========================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Tab Selector */}
          <div style={{
            display: "flex",
            background: "hsla(var(--bg-secondary), 0.5)",
            border: "1px solid hsl(var(--border-glass))",
            borderRadius: "var(--radius-md)",
            padding: "4px"
          }}>
            <button
              onClick={() => setLeftTab("catalog")}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                background: leftTab === "catalog" ? "hsl(var(--primary))" : "transparent",
                color: leftTab === "catalog" ? "hsl(var(--bg-primary))" : "hsl(var(--text-secondary))",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--transition-fast)"
              }}
            >
              📦 Catálogo de Equipos
            </button>
            <button
              onClick={() => setLeftTab("photos")}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                background: leftTab === "photos" ? "hsl(var(--primary))" : "transparent",
                color: leftTab === "photos" ? "hsl(var(--bg-primary))" : "hsl(var(--text-secondary))",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--transition-fast)"
              }}
            >
              📷 Fotos de Levantamiento
            </button>
          </div>

          {/* TAB CONTENT: CATALOG */}
          {leftTab === "catalog" && (
            <div className="glass-card border-glow" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Catálogo de Equipos / Servicios</h2>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>{filteredCatalog.length} ítems</span>
              </div>

              {/* Category selector row */}
              <div style={{
                display: "flex",
                gap: "0.4rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
                margin: "0.25rem 0",
                scrollbarWidth: "thin"
              }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      background: selectedCategory === cat.key ? "hsla(var(--primary), 0.2)" : "hsla(0, 0%, 100%, 0.04)",
                      border: `1px solid ${selectedCategory === cat.key ? "hsl(var(--primary))" : "hsl(var(--border-glass))"}`,
                      color: selectedCategory === cat.key ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Buscar SKU o nombre de artículo..."
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: "0.5rem" }}
              />

              {/* Catalog Scrollable Cards */}
              <div style={{
                maxHeight: "450px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                paddingRight: "0.25rem"
              }}>
                {filteredCatalog.length === 0 ? (
                  <p style={{ color: "hsl(var(--text-muted))", textAlign: "center", padding: "3rem 0", fontSize: "0.85rem" }}>
                    No se encontraron artículos que coincidan con la búsqueda.
                  </p>
                ) : (
                  filteredCatalog.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "hsla(0, 0%, 100%, 0.02)",
                        border: "1px solid hsl(var(--border-glass))",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all var(--transition-fast)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "hsla(var(--primary), 0.4)";
                        e.currentTarget.style.background = "hsla(var(--primary), 0.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "hsl(var(--border-glass))";
                        e.currentTarget.style.background = "hsla(0, 0%, 100%, 0.02)";
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                          SKU: <code style={{ color: "hsl(var(--accent))" }}>{item.sku}</code> | {item.category}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontWeight: 700, color: "hsl(var(--primary))", fontSize: "0.95rem", fontFamily: "monospace" }}>
                          {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(item.priceCash)}
                        </span>
                        <button
                          onClick={() => addItemToQuote(item)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                        >
                          ➕ Añadir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: PHOTOS */}
          {leftTab === "photos" && (
            <div className="glass-card border-glow" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Fotos de Levantamiento</h2>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                  {(project?.images || []).length} fotos
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={triggerFileInput}
                style={{
                  border: "2px dashed hsl(var(--border-glass))",
                  borderRadius: "var(--radius-md)",
                  padding: "1.75rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "hsla(0, 0%, 100%, 0.02)",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--primary))";
                  e.currentTarget.style.background = "hsla(var(--primary), 0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border-glass))";
                  e.currentTarget.style.background = "hsla(0, 0%, 100%, 0.02)";
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>
                  {uploadingImage ? "⏳" : "📁"}
                </span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", color: "hsl(var(--text-secondary))" }}>
                  {uploadingImage ? "Subiendo archivo..." : "Haz clic para subir foto del espacio"}
                </span>
                <span style={{ fontSize: "0.7rem", color: "hsl(var(--text-muted))" }}>
                  JPG, PNG o WEBP (Máx 5MB)
                </span>
              </div>

              {/* Images Grid */}
              <div style={{
                maxHeight: "350px",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                paddingRight: "0.25rem"
              }}>
                {(project?.images || []).length === 0 ? (
                  <div style={{ gridColumn: "span 2", textAlign: "center", padding: "2rem", color: "hsl(var(--text-muted))" }}>
                    No hay imágenes de levantamiento técnico cargadas en este proyecto.
                  </div>
                ) : (
                  (project?.images || []).map((img) => (
                    <div
                      key={img.id}
                      style={{
                        border: "1px solid hsl(var(--border-glass))",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        background: "hsla(var(--bg-secondary), 0.5)"
                      }}
                    >
                      <div style={{ height: "110px", width: "100%", overflow: "hidden", position: "relative", background: "#000" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(img.id)}
                          alt={img.fileName}
                          style={{ width: "100%", height: "100%", objectFit: "contain", transition: "transform var(--transition-normal)" }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.08)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                        />
                      </div>
                      <div style={{ padding: "0.5rem", fontSize: "0.7rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "hsl(var(--text-primary))" }}>
                          {img.fileName}
                        </span>
                        <span style={{ color: "hsl(var(--text-muted))" }}>
                          {new Date(img.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* RIGHT PANEL: LIVE QUOTE SHEET               */}
        {/* ========================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Main workspace sheet card */}
          <div className="glass-card border-glow" style={{ padding: "2rem", background: "hsla(var(--bg-secondary), 0.35)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem" }}>
              📄 Hoja de Cotización
            </h2>

            {selectedItems.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "4rem 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"
              }}>
                <span style={{ fontSize: "2.5rem" }}>🛒</span>
                <p style={{ color: "hsl(var(--text-muted))", maxWidth: "250px", fontSize: "0.85rem", lineHeight: 1.5 }}>
                  Tu cotización está vacía. Selecciona la pestaña <strong>Catálogo</strong> y añade artículos.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Table items list */}
                <div style={{ maxHeight: "350px", overflowY: "auto", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "1rem" }}>
                  <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Artículo</th>
                        <th style={{ width: "115px" }}>Tarifa</th>
                        <th style={{ width: "95px" }}>Cant.</th>
                        <th>Subtotal ({currency})</th>
                        <th style={{ textAlign: "right", width: "30px" }}>Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, index) => {
                        const activePrice = getActiveUnitPrice(item);
                        const itemSubtotal = activePrice * item.quantity * exchangeRate;
                        return (
                          <tr key={item.catalogItemId}>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                <span style={{ fontSize: "0.7rem", color: "hsl(var(--text-muted))" }}>SKU: {item.sku}</span>
                              </div>
                            </td>
                            <td>
                              <select
                                className="input-field"
                                value={item.priceType}
                                onChange={(e) => updatePriceType(index, e.target.value as any)}
                                style={{
                                  padding: "2px 4px",
                                  fontSize: "0.75rem",
                                  marginBottom: 0,
                                  cursor: "pointer",
                                  height: "26px",
                                  background: "hsla(0,0%,100%,0.04)"
                                }}
                              >
                                <option value="CASH">Contado</option>
                                <option value="CREDIT">Crédito</option>
                                <option value="PREFERRED">Preferente</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "4px",
                                    background: "hsla(0,0%,100%,0.05)",
                                    border: "1px solid hsl(var(--border-glass))",
                                    cursor: "pointer",
                                    color: "hsl(var(--text-primary))"
                                  }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  className="input-field"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                  style={{
                                    width: "35px",
                                    padding: "2px 4px",
                                    textAlign: "center",
                                    fontSize: "0.8rem",
                                    marginBottom: 0
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "4px",
                                    background: "hsla(0,0%,100%,0.05)",
                                    border: "1px solid hsl(var(--border-glass))",
                                    cursor: "pointer",
                                    color: "hsl(var(--text-primary))"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
                                {formattedValue(itemSubtotal)}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => removeItemFromQuote(index)}
                                style={{
                                  background: "transparent",
                                  color: "hsl(var(--danger))",
                                  cursor: "pointer",
                                  fontSize: "1.05rem",
                                  padding: "4px"
                                }}
                                title="Eliminar ítem"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Currency & Tax Config Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="input-group">
                    <label className="input-label" style={{ fontSize: "0.75rem" }}>Moneda Base</label>
                    <select
                      className="input-field"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CLP">CLP (Ch$)</option>
                      <option value="MXN">MXN ($)</option>
                      <option value="COP">COP ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label" style={{ fontSize: "0.75rem" }}>IVA / Impuestos (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                    />
                  </div>
                </div>

                {currency !== "USD" && (
                  <div className="input-group" style={{ marginTop: "-0.5rem" }}>
                    <label className="input-label" style={{ fontSize: "0.75rem" }}>Tasa de Cambio (1 USD = )</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                    />
                  </div>
                )}

                {/* Financial Summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "hsl(var(--text-secondary))" }}>Subtotal:</span>
                    <span style={{ fontFamily: "monospace" }}>{formattedValue(subtotal)}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", alignItems: "center", gap: "1rem" }}>
                    <span style={{ color: "hsl(var(--text-secondary))" }}>Descuento Directo ({currency}):</span>
                    <input
                      type="number"
                      className="input-field"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", marginBottom: 0, textAlign: "right" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "hsl(var(--text-secondary))" }}>IVA ({taxRate}%):</span>
                    <span style={{ fontFamily: "monospace" }}>{formattedValue(tax)}</span>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid hsl(var(--border-glass))",
                    paddingTop: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: 800
                  }}>
                    <span>Total Final:</span>
                    <span className="text-glow-primary" style={{ color: "hsl(var(--primary))", fontFamily: "monospace" }}>
                      {formattedValue(total)}
                    </span>
                  </div>
                </div>

                {/* Margen Consolidado Estimado Gauge */}
                <div className={`margin-gauge-card ${getMarginClass()}`} style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  transition: "all var(--transition-normal)"
                }}>
                  <span style={{ fontSize: "0.75rem", display: "block", textTransform: "uppercase", fontWeight: 600, opacity: 0.8 }}>
                    Rentabilidad Proyectada
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.4rem" }}>
                    <span style={{ fontSize: "1.65rem", fontWeight: 800, fontFamily: "monospace" }}>
                      {Math.round(profitMarginPercent * 10) / 10}%
                    </span>
                    <span style={{ fontSize: "0.8rem" }}>
                      Ganancia: {formattedValue(profit)}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", display: "block", marginTop: "0.4rem", fontWeight: 500 }}>
                    {getMarginText()}
                  </span>
                </div>

                {/* Terms and date config */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="expire" style={{ fontSize: "0.75rem" }}>Vence el</label>
                    <input
                      id="expire"
                      type="date"
                      className="input-field"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="terms" style={{ fontSize: "0.75rem" }}>Términos y Notas</label>
                    <textarea
                      id="terms"
                      className="input-field"
                      rows={2}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      style={{ resize: "vertical", fontSize: "0.75rem", fontFamily: "inherit", padding: "0.4rem 0.6rem" }}
                    />
                  </div>
                </div>

                {/* Save Quote Action */}
                <button
                  onClick={handleSaveQuote}
                  disabled={loading}
                  className="btn btn-primary btn-block text-glow-primary border-glow"
                  style={{ padding: "0.85rem", fontSize: "0.95rem" }}
                >
                  {loading ? <span className="spinner" /> : null}
                  <span>💾 Guardar Presupuesto</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styled margin cards rules */}
      <style jsx global>{`
        .margin-success {
          background: hsla(142.1, 70.6%, 45.3%, 0.1);
          border-color: hsla(142.1, 70.6%, 45.3%, 0.3);
          color: #a3e635;
          box-shadow: 0 0 15px hsla(142.1, 70.6%, 45.3%, 0.1);
        }
        .margin-warning {
          background: hsla(38, 92%, 50%, 0.1);
          border-color: hsla(38, 92%, 50%, 0.3);
          color: #fbbf24;
          box-shadow: 0 0 15px hsla(38, 92%, 50%, 0.1);
        }
        .margin-danger {
          background: hsla(0, 84.2%, 60.2%, 0.1);
          border-color: hsla(0, 84.2%, 60.2%, 0.3);
          color: #ff8888;
          box-shadow: 0 0 15px hsla(0, 84.2%, 60.2%, 0.1);
        }
      `}</style>
    </div>
  );
}
