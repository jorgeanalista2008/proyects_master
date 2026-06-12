// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\[id]\quotes\[quoteId]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Client {
  name: string;
  taxId: string;
  email: string;
  phone: string;
}

interface Project {
  id: string;
  name: string;
  client: Client;
}

interface QuoteItem {
  id: string;
  quantity: number;
  price: number;
  catalogItem: {
    sku: string;
    name: string;
  };
}

interface Quote {
  id: string;
  version: number;
  currency: string;
  exchangeRate: number;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  terms: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  items: QuoteItem[];
}

interface PageProps {
  params: Promise<{ id: string; quoteId: string }>;
}

export default function QuoteDetailView({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { id: projectId, quoteId } = resolvedParams;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadQuoteData() {
      try {
        setFetching(true);
        // Load details from backend
        // Normally, GET /projects/:projectId/quotes/:quoteId or GET /quotes/:quoteId
        const [quoteData, projectData] = await Promise.all([
          api.get<Quote>(`/quotes/${quoteId}`),
          api.get<Project>(`/projects/${projectId}`)
        ]);
        setQuote(quoteData);
        setProject(projectData);
      } catch (err: any) {
        console.error("Error loading quote details:", err);
        setError("No se pudo cargar la información del presupuesto.");
      } finally {
        setFetching(false);
      }
    }
    loadQuoteData();
  }, [projectId, quoteId]);

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!quote) return;
    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      // Calls PUT /quotes/:quoteId with payload { status }
      await api.put(`/quotes/${quoteId}`, { status: newStatus });
      setSuccess(`Presupuesto actualizado a ${newStatus === "APPROVED" ? "Aprobado" : "Rechazado"} con éxito.`);
      
      // Update state local
      setQuote({
        ...quote,
        status: newStatus
      });

      // Optionally, if approved, project status might also change. We reload project data
      const [quoteData, projectData] = await Promise.all([
        api.get<Quote>(`/quotes/${quoteId}`),
        api.get<Project>(`/projects/${projectId}`)
      ]);
      setQuote(quoteData);
      setProject(projectData);
    } catch (err: any) {
      console.error("Error updating quote status:", err);
      setError("No se pudo actualizar el estado de la cotización.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (fetching) {
    return (
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando presupuesto...</p>
      </div>
    );
  }

  if (!quote || !project) {
    return (
      <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
        <h3>Presupuesto no encontrado</h3>
        <Link href={`/projects/${projectId}`} className="btn btn-primary" style={{ margin: "1.5rem auto 0" }}>
          Volver al Proyecto
        </Link>
      </div>
    );
  }

  const formattedValue = (val: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: quote.currency
    }).format(val);
  };

  return (
    <div className="fade-in">
      {/* Top Header Buttons (Hidden on Print) */}
      <div className="no-print" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <Link href={`/projects/${projectId}`} style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          ⬅️ Volver al Proyecto
        </Link>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            🖨️ Imprimir / Guardar PDF
          </button>

          {quote.status === "PENDING" && (
            <>
              <button
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={updating}
                className="btn btn-success btn-sm"
              >
                ✓ Aprobar
              </button>
              <button
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={updating}
                className="btn btn-danger btn-sm"
              >
                ✕ Rechazar
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="no-print" style={{
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
        <div className="no-print" style={{
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

      {/* Quote Document Area (Formatted for Print) */}
      <div className="glass-card print-invoice" style={{
        padding: "3rem",
        background: "white",
        color: "#1e293b",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        borderRadius: "var(--radius-lg)"
      }}>
        
        {/* Invoice Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "2rem",
          marginBottom: "2rem"
        }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>SecurityNet S.A.</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Sistemas Integrales de Seguridad Electrónica</p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Av. Providencia 1254, Oficina 402, Santiago, Chile</p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>contacto@securitynet.cl | +56 2 2456 7890</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              background: quote.status === "APPROVED" ? "#dcfce7" : quote.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
              color: quote.status === "APPROVED" ? "#15803d" : quote.status === "REJECTED" ? "#b91c1c" : "#b45309",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "1rem"
            }}>
              {quote.status === "PENDING" && "Borrador"}
              {quote.status === "APPROVED" && "Aprobada"}
              {quote.status === "REJECTED" && "Rechazada"}
            </span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>COTIZACIÓN</h3>
            <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0.25rem 0" }}>Nº Proyecto: {project.name}</p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Versión: <strong>v{quote.version}</strong></p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Fecha: {new Date(quote.createdAt).toLocaleDateString("es-ES")}</p>
          </div>
        </div>

        {/* Billing Info */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2.5rem"
        }}>
          <div>
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>CLIENTE</h4>
            <h5 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>{project.client.name}</h5>
            <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0.15rem 0" }}>ID Fiscal: <strong>{project.client.taxId}</strong></p>
            <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0.15rem 0" }}>Email: {project.client.email}</p>
            <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0.15rem 0" }}>Teléfono: {project.client.phone}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>VENCIMIENTO</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ef4444" }}>
              {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("es-ES") : "Sin Vencer"}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>* Precios convertidos a tasa: 1 USD = {quote.exchangeRate} {quote.currency}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "2rem"
        }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>SKU</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Descripción / Ítem</th>
              <th style={{ textAlign: "center", padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Cant.</th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Precio Unitario</th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>Total Item</th>
            </tr>
          </thead>
          <tbody>
            {quote.items && quote.items.map((item) => {
              const itemTotal = item.price * item.quantity;
              
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem" }}><code>{item.catalogItem?.sku}</code></td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>{item.catalogItem?.name}</td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem", textAlign: "right" }}>{formattedValue(item.price)}</td>
                  <td style={{ padding: "1rem 0.5rem", fontSize: "0.9rem", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{formattedValue(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Invoice Summary and Terms */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.7fr",
          gap: "3rem",
          alignItems: "start"
        }}>
          <div>
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>TÉRMINOS Y CONDICIONES</h4>
            <p style={{
              fontSize: "0.8rem",
              color: "#475569",
              lineHeight: "1.5",
              whiteSpace: "pre-line",
              background: "#f8fafc",
              padding: "1rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid #e2e8f0"
            }}>
              {quote.terms}
            </p>
          </div>
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>{formattedValue(quote.subtotal)}</span>
              </div>
              {quote.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#b91c1c" }}>
                  <span>Descuento:</span>
                  <span>-{formattedValue(quote.discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>IVA / Impuesto ({quote.taxRate}%):</span>
                <span style={{ fontWeight: 600 }}>{formattedValue(quote.tax)}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "2px solid #e2e8f0",
                paddingTop: "0.75rem",
                marginTop: "0.25rem",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#0f172a"
              }}>
                <span>Total Final:</span>
                <span>{formattedValue(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
