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
  const [unitCost, setUnitCost] = useState<number>(0);
  const [margin, setMargin] = useState<number>(30); // 30% default margin
  const [salePrice, setSalePrice] = useState<number>(0);
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
        setUnitCost(data.unitCost ?? 0);
        setMargin(data.margin ?? 0);
        setSalePrice(data.salePrice ?? 0);
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

  // Recalculate suggested sale price in real-time when unitCost or margin changes
  useEffect(() => {
    const calculated = unitCost * (1 + margin / 100);
    // Round to 2 decimal places
    setSalePrice(Math.round(calculated * 100) / 100);
  }, [unitCost, margin]);

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
        margin,
        salePrice
      };

      let savedItem: any;

      if (isNew) {
        savedItem = await api.post("/catalog", payload);
      } else {
        savedItem = await api.put(`/catalog/${id}`, payload);
      }

      // If an image is selected, upload it
      if (imageFile) {
        const productId = isNew ? savedItem.id : id;
        await uploadImage(productId);
      }

      setSuccess(`¡Producto ${isNew ? "creado" : "actualizado"} con éxito!`);
      
      // Redirect back after a short delay
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
    <div className="fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
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
          {isNew ? "Ingresa la ficha técnica y calcula los costos de venta del nuevo producto" : "Actualiza la información técnica y costos de este elemento."}
        </p>
      </div>

      <div className="glass-card">
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
              <input
                id="category"
                type="text"
                placeholder="Cámara, Sensor, Accesorios, Mano de Obra..."
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                required
              />
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
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Pricing Math Section */}
          <div style={{
            background: "hsla(var(--bg-secondary), 0.5)",
            border: "1px solid hsl(var(--border-glass))",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)"
          }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "hsl(var(--primary-hover))" }}>Estructura de Precios (USD)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="unitCost">Costo Base ($)</label>
                <input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="margin">Margen de Venta (%)</label>
                <input
                  id="margin"
                  type="number"
                  min="0"
                  className="input-field"
                  value={margin}
                  onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="salePrice">Precio Venta Sugerido ($)</label>
                <input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                  style={{ fontWeight: "bold", borderLeft: "3px solid hsl(var(--success))" }}
                />
              </div>
            </div>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", marginTop: "0.75rem", display: "block" }}>
              * Precio sugerido calculado automáticamente como: <code>Costo Base * (1 + Margen / 100)</code>
            </span>
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
            
            {/* Show preview or existing image */}
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              <span>{isNew ? "Guardar Producto" : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
