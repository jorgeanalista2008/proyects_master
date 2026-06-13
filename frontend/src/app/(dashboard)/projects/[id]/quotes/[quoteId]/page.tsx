// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\[id]\quotes\[quoteId]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";

interface Client {
  name: string;
  rutOrId: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
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
  description?: string;
  client: Client;
  surveyImages?: ProjectImage[];
  images?: ProjectImage[]; // Fallback
}

interface ProductImage {
  id: string;
  fileName: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  images?: ProductImage[];
}

interface QuoteItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
  priceType?: string;
}

interface Quote {
  id: string;
  version: number;
  currency: string;
  exchangeRate: number;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
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
  const { config: sysConfig } = useConfig();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states for pre-print customization
  const [clientName, setClientName] = useState("");
  const [clientTaxId, setClientTaxId] = useState("");
  const [clientAttention, setClientAttention] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [validity, setValidity] = useState("48 Horas");
  const [quoteNo, setQuoteNo] = useState("");
  const [emissionDate, setEmissionDate] = useState("");
  const [warranty, setWarranty] = useState("3 Años de Garantía");
  const [support, setSupport] = useState("Soporte Post-Técnico 6 meses");
  const [taxNote, setTaxNote] = useState("Precio No incluye IVA");
  const [contactWhatsApp, setContactWhatsApp] = useState("(0422)3230912");
  const [contactPhones, setContactPhones] = useState("(0414)5681386 / (0254)2336911");
  const [selectedSurveyImageId, setSelectedSurveyImageId] = useState<string | null>(null);
  const [pageLabel, setPageLabel] = useState("Fin de Pagina 2/2");

  // Pagination force options
  const [breakBeforeFitting, setBreakBeforeFitting] = useState(false);
  const [breakBeforeService, setBreakBeforeService] = useState(false);
  const [breakBeforeTotals, setBreakBeforeTotals] = useState(false);

  // Custom unit editing state per quote item
  const [itemUnits, setItemUnits] = useState<{ [itemId: string]: string }>({});

  useEffect(() => {
    async function loadQuoteData() {
      try {
        setFetching(true);
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

  // Sync state once data is fetched
  useEffect(() => {
    if (quote && project) {
      setClientName(project.client?.name || "");
      setClientTaxId(project.client?.rutOrId || "");
      setClientAttention(""); // Default to empty as in example, customizable
      setClientAddress(project.client?.address || project.client?.city || "");
      setClientPhone(project.client?.phone || "");
      setClientEmail(project.client?.email || "");
      setProjectSummary(project.description || "Instalación y programación de sistema de Vigilancia a través de CCTV PÖE");
      setValidity("48 Horas");
      setQuoteNo(`${quote.version}-${quote.id.slice(0, 4).toUpperCase()}`);
      
      const dateObj = new Date(quote.createdAt);
      setEmissionDate(`${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`);

      // Initialize default units
      const units: { [itemId: string]: string } = {};
      quote.items?.forEach((item) => {
        const cat = item.product?.category;
        if (cat === "CABLE") {
          units[item.id] = "Bobina";
        } else if (cat === "TUBING") {
          units[item.id] = "Metros";
        } else {
          units[item.id] = "Unidad";
        }
      });
      setItemUnits(units);

      // Select default blueprint image
      const imgs = project.surveyImages || project.images || [];
      if (imgs.length > 0) {
        setSelectedSurveyImageId(imgs[0].id);
      }

      // Populate branding details from SystemConfig if present
      if (sysConfig) {
        if (sysConfig.phone) {
          setContactWhatsApp(sysConfig.phone);
          setContactPhones(sysConfig.phone);
        }
        if (sysConfig.appName) {
          // Can be customized
        }
      }
    }
  }, [quote, project, sysConfig]);

  const handleUpdateStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!quote) return;
    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      await api.patch(`/quotes/${quoteId}`, { status: newStatus });
      setSuccess(`Presupuesto actualizado a ${newStatus === "APPROVED" ? "Aprobado" : "Rechazado"} con éxito.`);
      
      setQuote({
        ...quote,
        status: newStatus
      });

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
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Group items by category
  const items = quote.items || [];
  const techItems = items.filter(item =>
    ["CAMERA", "DVR_NVR", "ACCESSORY"].includes(item.product?.category)
  );
  const fittingItems = items.filter(item =>
    ["CABLE", "TUBING"].includes(item.product?.category)
  );
  const serviceItems = items.filter(item =>
    ["LABOR", "SERVICE"].includes(item.product?.category)
  );

  const techSubtotal = techItems.reduce((acc, item) => acc + Number(item.unitPrice) * Number(item.quantity), 0);
  const fittingSubtotal = fittingItems.reduce((acc, item) => acc + Number(item.unitPrice) * Number(item.quantity), 0);
  const serviceSubtotal = serviceItems.reduce((acc, item) => acc + Number(item.unitPrice) * Number(item.quantity), 0);

  const getImageUrl = (imgId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${base}/images/${imgId}`;
  };

  const projectImagesList = project.surveyImages || project.images || [];

  return (
    <div className="fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        .print-invoice-wrapper {
          background: white;
          color: #0f172a;
          font-family: 'Inter', -apple-system, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
        }

        .editable-print-input {
          background: transparent;
          border: 1px dashed rgba(59, 130, 246, 0.3);
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          width: 100%;
          padding: 2px 4px;
          border-radius: 4px;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .editable-print-input:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        .editable-print-input:focus {
          outline: none;
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        .editable-print-textarea {
          background: transparent;
          border: 1px dashed rgba(59, 130, 246, 0.3);
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          width: 100%;
          min-height: 80px;
          padding: 4px 6px;
          border-radius: 4px;
          box-sizing: border-box;
          resize: none;
          transition: all 0.2s;
        }
        .editable-print-textarea:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        .editable-print-textarea:focus {
          outline: none;
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        .quote-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.5rem;
          border: 2px solid #000;
        }
        .quote-table th {
          background: #f1f5f9;
          color: #000;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
          padding: 6px;
          border-bottom: 2px solid #000;
          border-right: 1px dashed #000;
        }
        .quote-table th:last-child {
          border-right: none;
        }
        .quote-table td {
          padding: 6px 8px;
          font-size: 0.85rem;
          color: #000;
          border-right: 1px dashed #000;
          border-bottom: 1.5px dashed #000;
          vertical-align: middle;
        }
        .quote-table td:last-child {
          border-right: none;
        }
        .quote-table tr:last-child td {
          border-bottom: none;
        }

        .double-underline {
          border-bottom: 3.5px double #000;
          padding-bottom: 2px;
        }

        .control-panel {
          background: hsla(var(--bg-secondary), 0.3);
          border: 1px solid hsl(var(--border-glass));
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        @media print {
          @page {
            size: portrait;
            margin: 12mm 10mm;
          }
          body, html {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-invoice-wrapper {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .editable-print-input, .editable-print-textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .quote-group-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      ` }} />

      {/* Control panel & print options (Hidden on Print) */}
      <div className="no-print control-panel">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              🖨️ Imprimir / Guardar PDF
            </button>

            {quote.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleUpdateStatus("APPROVED")}
                  disabled={updating}
                  className="btn btn-success btn-sm"
                >
                  ✓ Aprobar Presupuesto
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

        {/* Configuration checks for layout adjustments */}
        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid hsl(var(--border-glass))",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem"
        }}>
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Ajustes de Impresión / Salto de Página
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={breakBeforeFitting}
                  onChange={(e) => setBreakBeforeFitting(e.target.checked)}
                />
                Forzar salto de página antes de &quot;Empotramiento&quot;
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={breakBeforeService}
                  onChange={(e) => setBreakBeforeService(e.target.checked)}
                />
                Forzar salto de página antes de &quot;Servicio Técnico&quot;
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={breakBeforeTotals}
                  onChange={(e) => setBreakBeforeTotals(e.target.checked)}
                />
                Forzar salto de página antes del plano y totales
              </label>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Selección de Croquis o Plano
            </h4>
            {projectImagesList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <select
                  value={selectedSurveyImageId || ""}
                  onChange={(e) => setSelectedSurveyImageId(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "0.85rem", padding: "0.4rem" }}
                >
                  {projectImagesList.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.fileName || `Imagen ${img.id.slice(0, 4)}`}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", margin: 0 }}>
                  Esta foto se imprimirá en el área de croquis del presupuesto.
                </p>
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem" }}>
                <p style={{ color: "hsl(var(--text-muted))", margin: "0 0 0.5rem 0" }}>
                  No hay croquis subidos para este proyecto. Puedes subir uno directamente:
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      const token = localStorage.getItem("token");
                      try {
                        setUpdating(true);
                        const res = await fetch(`http://localhost:3000/api/images/project/${project.id}`, {
                          method: "POST",
                          headers: {
                            ...(token ? { "Authorization": `Bearer ${token}` } : {})
                          },
                          body: formData
                        });
                        if (res.ok) {
                          setSuccess("¡Plano cargado exitosamente!");
                          window.location.reload();
                        } else {
                          setError("Error al subir el croquis.");
                        }
                      } catch (err) {
                        console.error(err);
                        setError("Error de red al intentar subir el croquis.");
                      } finally {
                        setUpdating(false);
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
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

      {/* Printable template container */}
      <div className="print-invoice-wrapper">
        
        {/* Header Block */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem"
        }}>
          {/* Left: Logo */}
          <div>
            {sysConfig?.logoId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(sysConfig.logoId)}
                alt={sysConfig.appName || "Logo"}
                style={{ maxHeight: "65px", maxWidth: "240px", objectFit: "contain", display: "block" }}
              />
            ) : (
              <svg width="250" height="70" viewBox="0 0 250 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 60 C 21.2 60, 10 48.8, 10 35 C 10 21.2, 21.2 10, 35 10 C 45.4 10, 54.3 16.4, 58.1 26 C 58.8 27.7, 57.5 29.5, 55.6 29.5 L 44.5 29.5 C 43.1 29.5, 41.9 28.7, 41.4 27.4 C 39.8 23.3, 35.8 20.5, 31 20.5 C 23 20.5, 16.5 27, 16.5 35 C 16.5 43 23 49.5, 31 49.5 C 35.8 49.5, 39.8 46.7, 41.4 42.6 C 41.9 41.3, 43.1 40.5, 44.5 40.5 L 55.6 40.5 C 57.5 40.5, 58.8 42.3, 58.1 44 C 54.3 53.6, 45.4 60, 35 60 Z" fill="#0c1b40" />
                <path d="M35 5 C 51.6 5, 65 18.4, 65 35 C 65 35.8, 64.9 36.6, 64.8 37.4 C 64.5 34.6, 63.8 31.8, 62.6 29.2 C 58.8 20.8, 51 15.2, 42 14 C 39.7 13.7, 37.4 13.5, 35 13.5 C 24 13.5, 14.5 19, 9 27.4 C 10.5 20.5, 14.2 14.2, 19.5 9.5 C 24 5.5, 29.4 5, 35 5 Z" fill="#94a3b8" />
                <text x="75" y="42" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="28" fill="#0c1b40" letterSpacing="0.02em">GUSLAYA</text>
                <text x="210" y="42" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="400" fontSize="20" fill="#94a3b8">.com</text>
                <text x="10" y="65" fontFamily="monospace" fontSize="8.5" fill="#64748b" letterSpacing="0.1em">J506357682</text>
              </svg>
            )}
          </div>

          {/* Right: TP-LINK banner & Cotizacion details */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
            {/* TP-LINK Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tplink_cctv_kit.png" alt="TP-LINK kit" style={{ width: "110px", height: "45px", objectFit: "contain" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "7px", fontWeight: "bold", letterSpacing: "1px", color: "#64748b", margin: 0 }}>AUTHORIZED PARTNER</span>
                <svg width="70" height="25" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C14.76 22 17.26 20.88 19.08 19.06L16.24 16.22C15.16 17.3 13.66 18 12 18C8.68 18 6 15.32 6 12C6 8.68 8.68 6 12 6C13.66 6 15.16 6.7 16.24 7.78L19.08 4.94C17.26 3.12 14.76 2 12 2Z" fill="#00b4b6" />
                  <path d="M16 10H22V14H16V10Z" fill="#00b4b6" />
                  <path d="M22 6L18 10L20 12L24 8L22 6Z" fill="#00b4b6" />
                  <text x="28" y="16" fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="14" fill="#000">tp-link</text>
                  <text x="28" y="29" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="11" fill="#000" letterSpacing="0.15em">COTIZACIÓN</text>
                </svg>
              </div>
            </div>

            {/* Quote details box */}
            <div style={{
              border: "2px solid #000",
              borderRadius: "8px",
              overflow: "hidden",
              width: "210px",
              fontSize: "0.85rem",
              background: "#e2e8f0"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderBottom: "1.5px solid #000", padding: "4px 8px", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "right", paddingRight: "6px" }}>Fecha de emisión:</span>
                <input type="text" value={emissionDate} onChange={(e) => setEmissionDate(e.target.value)} className="editable-print-input" style={{ textAlign: "center", background: "white" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderBottom: "1.5px solid #000", padding: "4px 8px", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "right", paddingRight: "6px" }}>Cotización N°:</span>
                <input type="text" value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} className="editable-print-input" style={{ textAlign: "center", background: "white", fontWeight: "bold" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", padding: "4px 8px", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "right", paddingRight: "6px" }}>Validez:</span>
                <input type="text" value={validity} onChange={(e) => setValidity(e.target.value)} className="editable-print-input" style={{ textAlign: "center", background: "white" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Client Box */}
        <div style={{
          border: "2px solid #000",
          borderRadius: "4px",
          display: "grid",
          gridTemplateColumns: "2.1fr 1fr",
          marginBottom: "1.5rem"
        }}>
          {/* Left fields */}
          <div style={{ borderRight: "2px solid #000", display: "flex", flexDirection: "column" }}>
            <div style={{ borderBottom: "1.5px dashed #000", display: "flex", alignItems: "center", padding: "4px 8px" }}>
              <span style={{ fontWeight: "bold", width: "55px", fontSize: "0.85rem" }}>Cliente:</span>
              <div style={{ flex: 1 }}>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="editable-print-input" style={{ fontWeight: "bold" }} />
              </div>
            </div>
            
            <div style={{ borderBottom: "1.5px dashed #000", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ borderRight: "1.5px dashed #000", display: "flex", alignItems: "center", padding: "4px 8px" }}>
                <span style={{ fontWeight: "bold", width: "45px", fontSize: "0.85rem" }}>R.I.F:</span>
                <div style={{ flex: 1 }}>
                  <input type="text" value={clientTaxId} onChange={(e) => setClientTaxId(e.target.value)} className="editable-print-input" />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "4px 8px" }}>
                <span style={{ fontWeight: "bold", width: "65px", fontSize: "0.85rem" }}>Atención:</span>
                <div style={{ flex: 1 }}>
                  <input type="text" value={clientAttention} onChange={(e) => setClientAttention(e.target.value)} className="editable-print-input" placeholder="Nombre contacto..." />
                </div>
              </div>
            </div>

            <div style={{ borderBottom: "1.5px dashed #000", display: "flex", alignItems: "center", padding: "4px 8px" }}>
              <span style={{ fontWeight: "bold", width: "55px", fontSize: "0.85rem" }}>Direc.:</span>
              <div style={{ flex: 1 }}>
                <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="editable-print-input" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ borderRight: "1.5px dashed #000", display: "flex", alignItems: "center", padding: "4px 8px" }}>
                <span style={{ fontWeight: "bold", width: "45px", fontSize: "0.85rem" }}>Telef.:</span>
                <div style={{ flex: 1 }}>
                  <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="editable-print-input" />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "4px 8px" }}>
                <span style={{ fontWeight: "bold", width: "85px", fontSize: "0.85rem" }}>Correo elect.:</span>
                <div style={{ flex: 1 }}>
                  <input type="text" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="editable-print-input" />
                </div>
              </div>
            </div>
          </div>

          {/* Right field: Project summary */}
          <div style={{ display: "flex", flexDirection: "column", padding: "6px 8px" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.85rem", marginBottom: "4px" }}>Resumen del proyecto:</span>
            <div style={{ flex: 1, display: "flex" }}>
              <textarea value={projectSummary} onChange={(e) => setProjectSummary(e.target.value)} className="editable-print-textarea" style={{ flex: 1 }} />
            </div>
          </div>
        </div>

        {/* Section 1: Equipos de Tecnología */}
        {techItems.length > 0 && (
          <div className="quote-group-section">
            <div style={{
              background: "#0c1b40",
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              padding: "6px",
              fontSize: "0.9rem",
              border: "2px solid #000",
              borderBottom: "none",
              borderRadius: "4px 4px 0 0",
              textTransform: "uppercase"
            }}>
              Equipos de Tecnología
            </div>
            <table className="quote-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Item</th>
                  <th style={{ width: "50px" }}>Cant.</th>
                  <th style={{ width: "120px" }}>codigo</th>
                  <th>Descripcion del Servicio</th>
                  <th style={{ width: "80px" }}>Ref Visual</th>
                  <th style={{ width: "75px" }}>unid</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Precio Unit.</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {techItems.map((item, idx) => {
                  const sub = Number(item.unitPrice) * Number(item.quantity);
                  const firstImg = item.product?.images && item.product.images.length > 0 ? item.product.images[0] : null;
                  
                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ textAlign: "center" }}>{Number(item.quantity)}</td>
                      <td><code>{item.product?.sku}</code></td>
                      <td style={{ fontWeight: "bold" }}>
                        {item.product?.name}
                        {item.priceType && (
                          <span style={{
                            marginLeft: "8px",
                            fontSize: "9px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: item.priceType === "CREDIT" ? "#fef3c7" : item.priceType === "PREFERRED" ? "#f3e8ff" : "#ecfdf5",
                            color: item.priceType === "CREDIT" ? "#b45309" : item.priceType === "PREFERRED" ? "#6d28d9" : "#047857",
                            display: "inline-block",
                            verticalAlign: "middle"
                          }} className="no-print">
                            {item.priceType === "CREDIT" ? "Crédito" : item.priceType === "PREFERRED" ? "Preferente" : "Contado"}
                          </span>
                        )}
                        {item.product?.description && (
                          <div style={{ fontSize: "0.75rem", fontWeight: "normal", color: "#475569", marginTop: "2px" }}>
                            {item.product.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageUrl(firstImg.id)}
                            alt={item.product?.name}
                            style={{ maxWidth: "60px", maxHeight: "30px", objectFit: "contain", display: "block", margin: "0 auto" }}
                          />
                        ) : (
                          <div style={{ fontSize: "8px", color: "#94a3b8", textAlign: "center" }}>N/A</div>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={itemUnits[item.id] || "Unidad"}
                          onChange={(e) => setItemUnits({ ...itemUnits, [item.id]: e.target.value })}
                          className="editable-print-input"
                          style={{ textAlign: "center" }}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>{formattedValue(Number(item.unitPrice))}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{formattedValue(sub)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifySelf: "end", justifyContent: "flex-end", marginTop: "-0.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center" }} className="double-line-bottom">
                <span style={{ fontWeight: "bold", marginRight: "12px", fontSize: "0.8rem", textTransform: "uppercase" }}>Subtotal</span>
                <span style={{ fontWeight: "bold", minWidth: "90px", textAlign: "right" }}>{formattedValue(techSubtotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Empotramiento */}
        {fittingItems.length > 0 && (
          <div className={`quote-group-section ${breakBeforeFitting ? "page-break-before" : ""}`}>
            <div style={{
              background: "#0c1b40",
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              padding: "6px",
              fontSize: "0.9rem",
              border: "2px solid #000",
              borderBottom: "none",
              borderRadius: "4px 4px 0 0",
              textTransform: "uppercase"
            }}>
              Empotramiento
            </div>
            <table className="quote-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Item</th>
                  <th style={{ width: "50px" }}>Cant.</th>
                  <th style={{ width: "120px" }}>codigo</th>
                  <th>Descripcion del Servicio</th>
                  <th style={{ width: "80px" }}>Ref Visual</th>
                  <th style={{ width: "75px" }}>unid</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Precio Unit.</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {fittingItems.map((item, idx) => {
                  const sub = Number(item.unitPrice) * Number(item.quantity);
                  const firstImg = item.product?.images && item.product.images.length > 0 ? item.product.images[0] : null;

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ textAlign: "center" }}>{Number(item.quantity)}</td>
                      <td><code>{item.product?.sku}</code></td>
                      <td style={{ fontWeight: "bold" }}>
                        {item.product?.name}
                        {item.priceType && (
                          <span style={{
                            marginLeft: "8px",
                            fontSize: "9px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: item.priceType === "CREDIT" ? "#fef3c7" : item.priceType === "PREFERRED" ? "#f3e8ff" : "#ecfdf5",
                            color: item.priceType === "CREDIT" ? "#b45309" : item.priceType === "PREFERRED" ? "#6d28d9" : "#047857",
                            display: "inline-block",
                            verticalAlign: "middle"
                          }} className="no-print">
                            {item.priceType === "CREDIT" ? "Crédito" : item.priceType === "PREFERRED" ? "Preferente" : "Contado"}
                          </span>
                        )}
                        {item.product?.description && (
                          <div style={{ fontSize: "0.75rem", fontWeight: "normal", color: "#475569", marginTop: "2px" }}>
                            {item.product.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageUrl(firstImg.id)}
                            alt={item.product?.name}
                            style={{ maxWidth: "60px", maxHeight: "30px", objectFit: "contain", display: "block", margin: "0 auto" }}
                          />
                        ) : (
                          <div style={{ fontSize: "8px", color: "#94a3b8", textAlign: "center" }}>N/A</div>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={itemUnits[item.id] || "Bobina"}
                          onChange={(e) => setItemUnits({ ...itemUnits, [item.id]: e.target.value })}
                          className="editable-print-input"
                          style={{ textAlign: "center" }}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>{formattedValue(Number(item.unitPrice))}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{formattedValue(sub)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifySelf: "end", justifyContent: "flex-end", marginTop: "-0.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center" }} className="double-line-bottom">
                <span style={{ fontWeight: "bold", marginRight: "12px", fontSize: "0.8rem", textTransform: "uppercase" }}>Subtotal</span>
                <span style={{ fontWeight: "bold", minWidth: "90px", textAlign: "right" }}>{formattedValue(fittingSubtotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Servicio Técnico */}
        {serviceItems.length > 0 && (
          <div className={`quote-group-section ${breakBeforeService ? "page-break-before" : ""}`}>
            <div style={{
              background: "#0c1b40",
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              padding: "6px",
              fontSize: "0.9rem",
              border: "2px solid #000",
              borderBottom: "none",
              borderRadius: "4px 4px 0 0",
              textTransform: "uppercase"
            }}>
              Servicio Técnico
            </div>
            <table className="quote-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>Item</th>
                  <th style={{ width: "50px" }}>Cant.</th>
                  <th style={{ width: "120px" }}>codigo</th>
                  <th>Descripcion del Servicio</th>
                  <th style={{ width: "80px" }}>Ref Visual</th>
                  <th style={{ width: "75px" }}>unid</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Precio Unit.</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {serviceItems.map((item, idx) => {
                  const sub = Number(item.unitPrice) * Number(item.quantity);
                  const firstImg = item.product?.images && item.product.images.length > 0 ? item.product.images[0] : null;

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ textAlign: "center" }}>{Number(item.quantity)}</td>
                      <td><code>{item.product?.sku}</code></td>
                      <td style={{ fontWeight: "bold" }}>
                        {item.product?.name}
                        {item.priceType && (
                          <span style={{
                            marginLeft: "8px",
                            fontSize: "9px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: item.priceType === "CREDIT" ? "#fef3c7" : item.priceType === "PREFERRED" ? "#f3e8ff" : "#ecfdf5",
                            color: item.priceType === "CREDIT" ? "#b45309" : item.priceType === "PREFERRED" ? "#6d28d9" : "#047857",
                            display: "inline-block",
                            verticalAlign: "middle"
                          }} className="no-print">
                            {item.priceType === "CREDIT" ? "Crédito" : item.priceType === "PREFERRED" ? "Preferente" : "Contado"}
                          </span>
                        )}
                        {item.product?.description && (
                          <div style={{ fontSize: "0.75rem", fontWeight: "normal", color: "#475569", marginTop: "2px" }}>
                            {item.product.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageUrl(firstImg.id)}
                            alt={item.product?.name}
                            style={{ maxWidth: "60px", maxHeight: "30px", objectFit: "contain", display: "block", margin: "0 auto" }}
                          />
                        ) : (
                          // Technician icon fallback
                          <svg width="35" height="35" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto" }}>
                            <circle cx="20" cy="20" r="18" stroke="#475569" strokeWidth="1" fill="#f8fafc" />
                            <path d="M20 12 C18 12, 17 13.5, 17 15 C17 16.5, 18 18, 20 18 C22 18, 23 16.5, 23 15" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M14 28 C14 24, 16 22, 20 22 C24 22, 26 24, 26 28" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
                            <circle cx="26" cy="12" r="1.5" fill="#3b82f6" />
                            <path d="M22 25 L25 28" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={itemUnits[item.id] || "Unidad"}
                          onChange={(e) => setItemUnits({ ...itemUnits, [item.id]: e.target.value })}
                          className="editable-print-input"
                          style={{ textAlign: "center" }}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>{formattedValue(Number(item.unitPrice))}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>{formattedValue(sub)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifySelf: "end", justifyContent: "flex-end", marginTop: "-0.25rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center" }} className="double-line-bottom">
                <span style={{ fontWeight: "bold", marginRight: "12px", fontSize: "0.8rem", textTransform: "uppercase" }}>Subtotal</span>
                <span style={{ fontWeight: "bold", minWidth: "90px", textAlign: "right" }}>{formattedValue(serviceSubtotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Blueprint sketch and Grand Total Section */}
        <div className={`quote-group-section ${breakBeforeTotals ? "page-break-before" : ""}`} style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "24px",
          alignItems: "start",
          marginTop: "1.5rem"
        }}>
          {/* Left: Project Croquis & Phones */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              border: "1.5px solid #000",
              borderRadius: "4px",
              padding: "6px",
              background: "#fff",
              minHeight: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {selectedSurveyImageId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(selectedSurveyImageId)}
                  alt="Plano del Proyecto"
                  style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.8rem", padding: "1rem" }}>
                  <span>(Sin croquis o plano seleccionado)</span>
                </div>
              )}
            </div>

            {/* Contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "0.85rem", paddingLeft: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.51 1.45 5.4 1.45 5.53 0 10.03-4.5 10.03-10.03s-4.5-10.03-10.03-10.03C6.47 2.54 1.97 7.04 1.97 12.57c0 1.93.5 3.82 1.47 5.46l-.97 3.54 3.63-.95zM17.02 14.73c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.69.88-.85 1.05-.15.18-.3.2-.57.06-1.02-.51-1.72-.94-2.42-2.15-.19-.32-.19-.53.05-.88.1-.15.22-.32.33-.48.11-.16.15-.27.22-.46.07-.18.04-.35-.02-.48-.06-.14-.52-1.25-.71-1.71-.18-.45-.37-.39-.52-.39-.13-.01-.29-.01-.45-.01-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03s.87 2.35.99 2.52c.12.17 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.6-.65 1.83-1.29.23-.64.23-1.19.16-1.3-.07-.12-.25-.19-.53-.33z"/>
                </svg>
                <input type="text" value={contactWhatsApp} onChange={(e) => setContactWhatsApp(e.target.value)} className="editable-print-input" style={{ width: "200px" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#475569">
                  <path d="M20 22.621l-3.521-6.795c-.008-.004-1.974.97-2.064 1.011-2.24 1.086-6.753-7.859-4.524-8.995.109-.055 2.074-1.029 2.074-1.029l-3.521-6.795s-2.073 1.029-2.164 1.074c-4.484 2.174-2.148 12.38 2.073 20.537 4.225 8.156 11.597 10.36 15.834 8.31.09-.044 2.074-1.074 2.074-1.074z"/>
                </svg>
                <input type="text" value={contactPhones} onChange={(e) => setContactPhones(e.target.value)} className="editable-print-input" style={{ width: "300px" }} />
              </div>
            </div>
          </div>

          {/* Right: Grand Total & Guarantee box */}
          <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch", justifyContent: "space-between" }}>
            {/* Total box */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "1.25rem",
              fontWeight: "bold",
              padding: "10px 0",
              margin: "5px 0"
            }} className="double-underline">
              <span>Total a Pagar $</span>
              <span style={{ fontSize: "1.45rem", textDecoration: "underline", textDecorationStyle: "double" }}>
                {formattedValue(quote.total)}
              </span>
            </div>

            {/* Guarantee metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "center", margin: "10px 0" }}>
              <div style={{ color: "#ef4444", fontWeight: "bold", fontSize: "1.2rem" }}>
                <input type="text" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="editable-print-input" style={{ color: "#ef4444", fontWeight: "bold", textAlign: "center" }} />
              </div>
              <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#1e293b" }}>
                <input type="text" value={support} onChange={(e) => setSupport(e.target.value)} className="editable-print-input" style={{ textAlign: "center", fontWeight: "bold" }} />
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#64748b", marginTop: "2px" }}>
                <input type="text" value={taxNote} onChange={(e) => setTaxNote(e.target.value)} className="editable-print-input" style={{ textAlign: "center" }} />
              </div>
            </div>

            {/* Signature Area */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", width: "150px" }}>
                <div style={{ borderTop: "1.5px solid #000", textAlign: "center", fontWeight: "bold", fontSize: "0.8rem", paddingTop: "4px" }}>
                  FIRMA
                </div>
              </div>
              <div>
                <input type="text" value={pageLabel} onChange={(e) => setPageLabel(e.target.value)} className="editable-print-input" style={{ fontStyle: "italic", fontSize: "0.8rem", color: "#64748b", textAlign: "right", width: "110px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Closing decorative bars */}
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ borderTop: "1.5px solid #000" }}></div>
          <div style={{ borderTop: "1.5px solid #000", marginTop: "1px" }}></div>
        </div>

      </div>
    </div>
  );
}
