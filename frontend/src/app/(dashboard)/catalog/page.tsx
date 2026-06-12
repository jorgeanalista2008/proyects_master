// d:\github\proyects_master\frontend\src\app\(dashboard)\catalog\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitCost: number;
  margin: number; // e.g. 30 for 30%
  salePrice: number;
  imageId?: string;
  description?: string;
}

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const data = await api.get<CatalogItem[]>("/catalog");
        setItems(data);
      } catch (err: any) {
        console.error("Error fetching catalog:", err);
        setError("No se pudo cargar el catálogo de productos y servicios.");
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.sku.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "ALL" || 
      item.category.toUpperCase() === categoryFilter.toUpperCase();
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter dropdown
  const categories = Array.from(new Set(items.map((item) => item.category.toUpperCase())));

  return (
    <div className="fade-in">
      <div className="card-header-flex" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-primary" style={{ marginBottom: "0.25rem" }}>Catálogo de Equipos y Servicios</h1>
          <p className="subtitle-secondary" style={{ marginBottom: 0 }}>
            Administra los componentes de seguridad, sensores y tarifas de mano de obra
          </p>
        </div>
        <Link href="/catalog/new" className="btn btn-primary">
          ➕ Crear Producto/Servicio
        </Link>
      </div>

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

      {/* Filters Area */}
      <div style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
        background: "hsla(var(--bg-secondary), 0.3)",
        padding: "1rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid hsl(var(--border-glass))"
      }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            placeholder="Buscar por SKU o Nombre..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "0.75rem 1rem" }}
          />
        </div>
        <div style={{ width: "200px" }}>
          <select
            className="input-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: "0.75rem 1rem", cursor: "pointer" }}
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
          <p style={{ color: "hsl(var(--text-secondary))" }}>Cargando catálogo...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
          <span style={{ fontSize: "3rem" }}>📦</span>
          <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Catálogo Vacío</h3>
          <p style={{ color: "hsl(var(--text-secondary))", marginBottom: "1.5rem" }}>
            No se encontraron productos o servicios que coincidan con la búsqueda.
          </p>
          <Link href="/catalog/new" className="btn btn-secondary" style={{ margin: "0 auto" }}>
            Crear el Primer Producto
          </Link>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => {
            const formattedSalePrice = new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "USD"
            }).format(item.salePrice);

            const formattedCost = new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "USD"
            }).format(item.unitCost);

            return (
              <div key={item.id} className="glass-card" style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.25rem",
                height: "100%"
              }}>
                <div>
                  {/* Thumbnail / Image container */}
                  <div style={{
                    width: "100%",
                    height: "160px",
                    background: "hsla(var(--bg-secondary), 0.7)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                    overflow: "hidden",
                    border: "1px solid hsl(var(--border-glass))",
                    position: "relative"
                  }}>
                    {item.imageId ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`http://localhost:3000/api/images/${item.imageId}`}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "2.5rem" }}>📷</span>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Sin Imagen</span>
                      </div>
                    )}
                    <span style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "hsla(var(--bg-primary), 0.85)",
                      border: "1px solid hsl(var(--border-glass))",
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 600,
                      color: "hsl(var(--primary-hover))"
                    }}>
                      {item.sku}
                    </span>
                  </div>

                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "hsl(var(--text-muted))",
                    display: "block",
                    marginBottom: "0.25rem"
                  }}>
                    {item.category}
                  </span>
                  
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    lineHeight: "1.3",
                    height: "2.6rem",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                  }}>
                    {item.name}
                  </h3>

                  {item.description && (
                    <p style={{
                      fontSize: "0.8rem",
                      color: "hsl(var(--text-secondary))",
                      marginBottom: "1rem",
                      height: "2.4rem",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    background: "hsla(var(--bg-secondary), 0.4)",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "1rem",
                    fontSize: "0.8rem",
                    border: "1px solid hsl(var(--border-glass))"
                  }}>
                    <div>
                      <span style={{ color: "hsl(var(--text-muted))", display: "block" }}>Costo Base:</span>
                      <strong>{formattedCost}</strong>
                    </div>
                    <div>
                      <span style={{ color: "hsl(var(--text-muted))", display: "block" }}>Margen:</span>
                      <strong style={{ color: "hsl(var(--success))" }}>+{item.margin}%</strong>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem"
                  }}>
                    <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.85rem" }}>Precio de Venta:</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "hsl(var(--primary-hover))" }}>
                      {formattedSalePrice}
                    </span>
                  </div>

                  <Link href={`/catalog/${item.id}`} className="btn btn-secondary btn-block btn-sm">
                    ✏️ Editar Producto
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
