// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\[id]\quotes\new\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitCost: number;
  salePrice: number;
}

interface QuoteItem {
  catalogItemId: string;
  sku: string;
  name: string;
  unitCost: number; // in USD
  salePrice: number; // in USD
  quantity: number;
}

interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewQuoteBuilder({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  // Catalog items list for search
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [project, setProject] = useState<Project | null>(null);

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

  // Autocomplete / Search Catalog states
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCatalog, setFilteredCatalog] = useState<CatalogItem[]>([]);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // General states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  // Handle autocomplete search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCatalog([]);
      return;
    }
    const filtered = catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCatalog(filtered.slice(0, 5)); // cap at 5 results
  }, [searchQuery, catalog]);

  // Add item to quote list
  const addItemToQuote = (item: CatalogItem) => {
    // Check if already exists, increment quantity
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
          salePrice: item.salePrice,
          quantity: 1
        }
      ]);
    }
    setSearchQuery("");
    setShowCatalogDropdown(false);
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

  // --- FINANCIAL CALCULATIONS (REAL-TIME) ---
  // Subtotal in USD
  const subtotalUSD = selectedItems.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  const costUSD = selectedItems.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);

  // Convert to selected currency
  const subtotal = subtotalUSD * exchangeRate;
  const costTotal = costUSD * exchangeRate;

  // Discount (in selected currency)
  const discountVal = Math.min(subtotal, Math.max(0, discount));
  
  // Tax calculations
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const tax = taxableAmount * (taxRate / 100);
  const total = taxableAmount + tax;

  // Margin calculation (for Admin/Seller eyes only)
  // Profit in selected currency = Sale price before tax - Cost price
  const profit = taxableAmount - costTotal;
  const profitMarginPercent = taxableAmount > 0 ? (profit / taxableAmount) * 100 : 0;

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
          catalogItemId: item.catalogItemId,
          quantity: item.quantity,
          price: item.salePrice * exchangeRate // save item price in the currency of the quote
        }))
      };

      // Create quote (POST /projects/:id/quotes or POST /quotes)
      await api.post(`/projects/${projectId}/quotes`, payload);

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
        <p>Inicializando constructor de cotizaciones...</p>
      </div>
    );
  }

  const formattedValue = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency
    }).format(val);
  };

  return (
    <div className="fade-in">
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
          Proyecto: <strong>{project?.name}</strong> | Cliente: <strong>{project?.client?.name}</strong>
        </p>
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

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* Left column: Catalog search & Quote items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Card: Add Items */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>1. Agregar Equipos / Servicios</h2>
            
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Escribe SKU o nombre de cámara, sensor, instalación..."
                className="input-field"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowCatalogDropdown(true);
                }}
                onFocus={() => setShowCatalogDropdown(true)}
              />

              {showCatalogDropdown && filteredCatalog.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "hsl(var(--bg-secondary))",
                  border: "1px solid hsl(var(--border-glass))",
                  borderRadius: "var(--radius-sm)",
                  marginTop: "0.25rem",
                  zIndex: 20,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}>
                  {filteredCatalog.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => addItemToQuote(item)}
                      style={{
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid hsl(var(--border-glass))",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "hsla(var(--primary), 0.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", marginLeft: "0.5rem" }}>
                          SKU: {item.sku} | {item.category}
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, color: "hsl(var(--primary-hover))" }}>
                        {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(item.salePrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card: Selected Items Table */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem" }}>2. Desglose del Presupuesto</h2>
            
            {selectedItems.length === 0 ? (
              <p style={{ color: "hsl(var(--text-muted))", textAlign: "center", padding: "3rem 0" }}>
                No has agregado ningún elemento. Busca y selecciona productos arriba.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Elemento</th>
                      <th>Precio (USD)</th>
                      <th style={{ width: "90px" }}>Cant.</th>
                      <th>Subtotal ({currency})</th>
                      <th style={{ textAlign: "right" }}>Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => {
                      const itemSubtotal = item.salePrice * item.quantity * exchangeRate;
                      
                      return (
                        <tr key={item.catalogItemId}>
                          <td><code>{item.sku}</code></td>
                          <td className="font-weight-medium">{item.name}</td>
                          <td>
                            {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(item.salePrice)}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="input-field"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontSize: "0.85rem" }}
                            />
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{formattedValue(itemSubtotal)}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => removeItemFromQuote(index)}
                              style={{
                                background: "transparent",
                                color: "hsl(var(--danger))",
                                cursor: "pointer",
                                fontSize: "1.1rem"
                              }}
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
            )}
          </div>
        </div>

        {/* Right column: Config & Summary Calculations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Card: Configuration */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Ajustes de Moneda</h3>
            
            <div className="input-group">
              <label className="input-label" htmlFor="currency">Moneda Base</label>
              <select
                id="currency"
                className="input-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD - Dólar Americano</option>
                <option value="CLP">CLP - Peso Chileno</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            {currency !== "USD" && (
              <div className="input-group">
                <label className="input-label" htmlFor="exchange">Tasa de Cambio (1 USD = )</label>
                <input
                  id="exchange"
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                />
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="tax">Tasa de Impuesto / IVA (%)</label>
              <input
                id="tax"
                type="number"
                className="input-field"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Card: Totals & Profit Margin Summary */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Resumen Financiero</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Subtotal:</span>
                <span>{formattedValue(subtotal)}</span>
              </div>

              <div className="input-group" style={{ margin: "0.25rem 0", gap: "0.25rem" }}>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>Descuento Directo ({currency})</label>
                <input
                  type="number"
                  className="input-field"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>IVA / Impuestos ({taxRate}%):</span>
                <span>{formattedValue(tax)}</span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid hsl(var(--border-glass))",
                paddingTop: "0.75rem",
                marginTop: "0.25rem",
                fontSize: "1.1rem",
                fontWeight: 800
              }}>
                <span>Total Cotizado:</span>
                <span style={{ color: "hsl(var(--primary-hover))" }}>{formattedValue(total)}</span>
              </div>
            </div>

            {/* Profit Margin analysis for administrator */}
            {selectedItems.length > 0 && (
              <div style={{
                background: profitMarginPercent < 20 ? "hsla(0, 84.2%, 60.2%, 0.1)" : "hsla(142.1, 70.6%, 45.3%, 0.1)",
                border: `1px solid ${profitMarginPercent < 20 ? "hsla(0, 84.2%, 60.2%, 0.3)" : "hsla(142.1, 70.6%, 45.3%, 0.3)"}`,
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem"
              }}>
                <span style={{ fontSize: "0.75rem", display: "block", color: "hsl(var(--text-muted))", textTransform: "uppercase", fontWeight: 600 }}>
                  Margen Consolidado Estimado
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.25rem" }}>
                  <span style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: profitMarginPercent < 20 ? "#ff8888" : "#a3e635"
                  }}>
                    {Math.round(profitMarginPercent * 10) / 10}%
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>
                    Ganancia: {formattedValue(profit)}
                  </span>
                </div>
              </div>
            )}

            {/* Expiration date */}
            <div className="input-group">
              <label className="input-label" htmlFor="expire">Vence el</label>
              <input
                id="expire"
                type="date"
                className="input-field"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>

            {/* Terms and conditions */}
            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label className="input-label" htmlFor="terms">Términos y Notas</label>
              <textarea
                id="terms"
                className="input-field"
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                style={{ resize: "vertical", fontSize: "0.8rem", fontFamily: "inherit" }}
              />
            </div>

            <button
              onClick={handleSaveQuote}
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? <span className="spinner" /> : null}
              <span>Guardar Presupuesto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
