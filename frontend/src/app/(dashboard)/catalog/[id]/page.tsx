// d:\github\proyects_master\frontend\src\app\(dashboard)\catalog\[id]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CatalogItemForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
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
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch product data if editing
  useEffect(() => {
    if (isNew) return;

    async function loadItem() {
      try {
        setFetching(true);
        const data = await api.get(`/catalog/${id}`);
        setName(data.name || "");
        setSku(data.sku || "");
        setCategory(data.category || "");
        setDescription(data.description || "");
        setUnitCost(Number(data.unitCost) || 0);
        setMarginCash(Number(data.marginCash) ?? 30);
        setMarginCredit(Number(data.marginCredit) ?? 40);
        setMarginPreferred(Number(data.marginPreferred) ?? 20);
        setPriceCash(Number(data.priceCash) || 0);
        setPriceCredit(Number(data.priceCredit) || 0);
        setPricePreferred(Number(data.pricePreferred) || 0);
        setImageId(data.imageId || null);
      } catch (err: any) {
        console.error("Error loading catalog item:", err);
        setError("No se pudo cargar el producto o servicio solicitado.");
      } finally {
        setFetching(false);
      }
    }
    loadItem();
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

    const formData = new FormData();
    formData.append("file", imageFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`http://localhost:3000/api/images/product/${productId}`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error("El producto se guardó, pero la carga de la imagen falló.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !sku || !category) {
      setError("Nombre, SKU y Categoría son campos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        sku,
        category,
        description,
        unitCost,
        marginCash,
        priceCash,
        marginCredit,
        priceCredit,
        marginPreferred,
        pricePreferred
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
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando información del producto...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: "850px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/catalog" style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          ⬅️ Volver al Catálogo
        </Link>
        <h1 className="title-primary">{isNew ? "Crear Nuevo Producto" : `Editar Producto: ${sku}`}</h1>
        <p className="subtitle-secondary">
          {isNew ? "Ingresa la ficha técnica y configura los márgenes de venta sugeridos" : "Actualiza la información técnica y costos de este elemento."}
        </p>
      </div>

      <div className="glass-card border-glow">
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="sku">SKU / Código Único</label>
              <input
                id="sku"
                type="text"
                placeholder="CAM-IP-001"
                className="input-field"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="category">Categoría</label>
              <select
                id="category"
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">-- Selecciona Categoría --</option>
                <option value="CAMERA">Cámara de Seguridad</option>
                <option value="DVR_NVR">Grabador DVR / NVR</option>
                <option value="CABLE">Cableado Estructurado</option>
                <option value="TUBING">Tuberías y Canalización</option>
                <option value="ACCESSORY">Accesorios / Anclajes</option>
                <option value="LABOR">Mano de Obra</option>
                <option value="SERVICE">Servicios / Viáticos</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="name">Nombre del Producto / Servicio</label>
            <input
              id="name"
              type="text"
              placeholder="Cámara Domo IP 4MP Varifocal"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="description">Descripción</label>
            <textarea
              id="description"
              placeholder="Ficha técnica detallada o alcance del servicio..."
              className="input-field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Pricing Structure - 3 Tiers */}
          <div style={{
            background: "hsla(var(--bg-secondary), 0.5)",
            border: "1px solid hsl(var(--border-glass))",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)"
          }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", color: "hsl(var(--primary))", fontWeight: 700 }}>
              Estructura de Precios Multi-Tarifa (USD)
            </h3>

            {/* Cost Base Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginBottom: "1.25rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "1rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="unitCost" style={{ fontWeight: "bold" }}>Costo Adquisición ($)</label>
                <input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                  style={{ borderLeft: "3px solid hsl(var(--accent))" }}
                  required
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: "0.8rem", color: "hsl(var(--text-muted))" }}>
                <span>Ingresa el costo neto de importación o compra del equipo. Los tres precios de venta sugeridos se autocalcularán en base a este costo y el respectivo margen.</span>
              </div>
            </div>

            {/* Pricing Tiers Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Contado */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr", gap: "1rem", alignItems: "center" }}>
                <strong style={{ fontSize: "0.85rem", color: "hsl(var(--primary))" }}>💵 Precio al Contado:</strong>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: "0.7rem" }}>Margen Contado (%)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={marginCash}
                    onChange={(e) => setMarginCash(parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: "0.7rem" }}>Precio Contado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={priceCash}
                    onChange={(e) => setPriceCash(parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    style={{ fontWeight: 700, borderColor: "hsla(var(--primary), 0.5)" }}
                  />
                </div>
              </div>

              {/* Crédito */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr", gap: "1rem", alignItems: "center" }}>
                <strong style={{ fontSize: "0.85rem", color: "#fbbf24" }}>💳 Precio a Crédito:</strong>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: "0.7rem" }}>Margen Crédito (%)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={marginCredit}
                    onChange={(e) => setMarginCredit(parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: "0.7rem" }}>Precio Crédito ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={priceCredit}
                    onChange={(e) => setPriceCredit(parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    style={{ fontWeight: 700, borderColor: "rgba(251, 191, 36, 0.5)" }}
                  />
                </div>
              </div>

              {/* Preferencial */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr", gap: "1rem", alignItems: "center" }}>
                <strong style={{ fontSize: "0.85rem", color: "hsl(var(--accent))" }}>⭐ Precio Preferencial:</strong>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: "0.7rem" }}>Margen Preferente (%)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={marginPreferred}
                    onChange={(e) => setMarginPreferred(parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: "0.7rem" }}>Precio Preferente ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={pricePreferred}
                    onChange={(e) => setPricePreferred(parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    style={{ fontWeight: 700, borderColor: "hsla(var(--accent), 0.5)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Area */}
          <div style={{
            background: "hsla(var(--bg-secondary), 0.3)",
            border: "1px dashed hsl(var(--border-glass))",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
          }}>
            <h4 style={{ fontSize: "0.95rem" }}>Imagen del Producto</h4>
            
            {(imagePreview || imageId) && (
              <div style={{
                width: "200px",
                height: "150px",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: "1px solid hsl(var(--border-glass))",
                background: "hsla(var(--bg-secondary), 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview || `http://localhost:3000/api/images/${imageId}`}
                  alt="Vista Previa"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                📷 {imagePreview || imageId ? "Cambiar Imagen" : "Subir Imagen"}
              </label>
              {imageFile && (
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", marginTop: "0.5rem" }}>
                  Archivo seleccionado: {imageFile.name}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/catalog" className="btn btn-secondary" style={{ pointerEvents: loading ? "none" : "auto" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary border-glow" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              <span>{isNew ? "Guardar Producto" : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
