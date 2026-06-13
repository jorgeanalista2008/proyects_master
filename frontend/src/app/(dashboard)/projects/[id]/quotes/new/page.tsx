"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Package, 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  DollarSign, 
  Loader2, 
  Plus, 
  Search,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText
} from "lucide-react";

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
  { key: "ALL", label: "Todo" },
  { key: "CAMERA", label: "Cámaras" },
  { key: "DVR_NVR", label: "Grabadores" },
  { key: "CABLE", label: "Cableado" },
  { key: "TUBING", label: "Canalización" },
  { key: "ACCESSORY", label: "Accesorios" },
  { key: "LABOR", label: "Mano de Obra" },
  { key: "SERVICE", label: "Servicios" }
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

  // Margin categorization for UI color
  const getMarginBgClass = () => {
    if (profitMarginPercent < 20) return "bg-red-500/10 border-red-500/30 text-red-400 shadow-md shadow-red-500/5";
    if (profitMarginPercent < 35) return "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5";
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5";
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm font-medium">Cargando catálogo y levantamiento del proyecto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div>
        <Link 
          href={`/projects/${projectId}`} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors uppercase tracking-wider mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Proyecto</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Constructor de Cotizaciones</h1>
        <p className="text-xs text-slate-400 mt-1">
          Proyecto: <span className="text-amber-500 font-bold">{project?.name}</span> | Cliente: <span className="font-semibold text-slate-300">{project?.client?.name}</span>
        </p>
      </div>

      {/* Status Toasts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Split-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================== */}
        {/* LEFT PANEL: CATALOG & PHOTOS WORKSPACE      */}
        {/* ========================================== */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tab Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setLeftTab("catalog")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
                leftTab === "catalog" 
                  ? "bg-amber-500 text-slate-950 shadow" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo de Equipos</span>
            </button>
            <button
              onClick={() => setLeftTab("photos")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
                leftTab === "photos" 
                  ? "bg-amber-500 text-slate-950 shadow" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Fotos de Levantamiento</span>
            </button>
          </div>

          {/* TAB CONTENT: CATALOG */}
          {leftTab === "catalog" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-200">Catálogo de Equipos y Servicios</h2>
                <span className="text-xs text-slate-500 font-medium">{filteredCatalog.length} ítems</span>
              </div>

              {/* Category selector row */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/60 scrollbar-thin">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      selectedCategory === cat.key 
                        ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar SKU o nombre de artículo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Catalog Scrollable Cards */}
              <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
                {filteredCatalog.length === 0 ? (
                  <p className="text-slate-500 text-center py-12 text-xs font-medium">
                    No se encontraron artículos que coincidan con la búsqueda.
                  </p>
                ) : (
                  filteredCatalog.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 rounded-lg p-3 flex justify-between items-center transition-all group"
                    >
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-200 text-xs group-hover:text-slate-100 transition-colors">
                          {item.name}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          SKU: <code className="text-amber-500/80 font-mono">{item.sku}</code> | {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-500 text-xs">
                          {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(item.priceCash)}
                        </span>
                        <button
                          onClick={() => addItemToQuote(item)}
                          className="bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-slate-950 hover:bg-amber-500 text-slate-300 font-bold px-3 py-1 rounded text-[10px] uppercase tracking-wider transition-all"
                        >
                          Añadir
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
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-200">Fotos de Levantamiento Técnico</h2>
                <span className="text-xs text-slate-500 font-medium">{(project?.images || []).length} fotos</span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950/40 hover:bg-amber-500/[0.02] rounded-lg p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-amber-500 transition-colors mb-2" />
                )}
                <span className="block text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">
                  {uploadingImage ? "Subiendo archivo..." : "Haz clic para subir foto del levantamiento"}
                </span>
                <span className="block text-[10px] text-slate-600 mt-1">
                  JPG, PNG o WEBP (Máx 5MB)
                </span>
              </div>

              {/* Images Grid */}
              <div className="max-h-[350px] overflow-y-auto grid grid-cols-2 gap-4 pr-1">
                {(project?.images || []).length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-xs text-slate-500 font-medium">
                    No hay imágenes cargadas en este proyecto.
                  </div>
                ) : (
                  (project?.images || []).map((img) => (
                    <div
                      key={img.id}
                      className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
                    >
                      <div className="h-28 w-full overflow-hidden bg-slate-950 relative flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(img.id)}
                          alt={img.fileName}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 text-[10px] flex flex-col gap-0.5 border-t border-slate-800/60 bg-slate-900/60">
                        <span className="font-bold text-slate-300 truncate" title={img.fileName}>
                          {img.fileName}
                        </span>
                        <span className="text-slate-500">
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
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Hoja de Presupuesto</span>
            </h2>

            {selectedItems.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-xs max-w-xs leading-relaxed font-medium">
                  Tu cotización está vacía. Añade elementos del catálogo para estructurar la cotización.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Table items list */}
                <div className="max-h-[350px] overflow-y-auto border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                        <th className="p-3">Artículo</th>
                        <th className="p-3 w-28">Tarifa</th>
                        <th className="p-3 w-28">Cant.</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-center w-12">Quitar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {selectedItems.map((item, index) => {
                        const activePrice = getActiveUnitPrice(item);
                        const itemSubtotal = activePrice * item.quantity * exchangeRate;
                        return (
                          <tr key={item.catalogItemId} className="hover:bg-slate-900/20">
                            <td className="p-3">
                              <span className="block font-bold text-slate-200">{item.name}</span>
                              <span className="block text-[9px] text-slate-500 mt-0.5">SKU: {item.sku}</span>
                            </td>
                            <td className="p-3">
                              <select
                                className="w-full bg-slate-900 border border-slate-800 rounded py-1 px-1.5 text-slate-300 focus:outline-none focus:border-amber-500 text-[11px] cursor-pointer"
                                value={item.priceType}
                                onChange={(e) => updatePriceType(index, e.target.value as any)}
                              >
                                <option value="CASH">Contado</option>
                                <option value="CREDIT">Crédito</option>
                                <option value="PREFERRED">Preferente</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 font-bold transition-all"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  className="w-8 bg-slate-900 border border-slate-800 rounded py-0.5 text-center text-slate-200 focus:outline-none text-[11px]"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 font-bold transition-all"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-300">
                              {formattedValue(itemSubtotal)}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeItemFromQuote(index)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Currency & Tax Config Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Moneda Base</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-amber-500 text-xs"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CLP">CLP (Ch$)</option>
                      <option value="MXN">MXN ($)</option>
                      <option value="COP">COP ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">IVA / Impuestos (%)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {currency !== "USD" && (
                  <div className="mt-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Tasa de Cambio (1 USD = )</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                )}

                {/* Financial Summary */}
                <div className="bg-slate-950/60 border border-slate-800/40 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono font-bold text-slate-300">{formattedValue(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Descuento Directo ({currency}):</span>
                    <input
                      type="number"
                      className="w-24 bg-slate-950 border border-slate-800 rounded py-1 px-2 text-right text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>IVA ({taxRate}%):</span>
                    <span className="font-mono font-bold text-slate-300">{formattedValue(tax)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold">
                    <span className="text-slate-100">Total Final:</span>
                    <span className="font-mono text-amber-500">{formattedValue(total)}</span>
                  </div>
                </div>

                {/* Margen Consolidado Estimado */}
                <div className={`border rounded-lg p-4 transition-all ${getMarginBgClass()}`}>
                  <span className="block text-[10px] uppercase font-bold tracking-wide opacity-80">
                    Rentabilidad de Cotización
                  </span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-xl font-black font-mono">
                      {Math.round(profitMarginPercent * 10) / 10}%
                    </span>
                    <span className="text-xs font-semibold">
                      Utilidad: {formattedValue(profit)}
                    </span>
                  </div>
                  <span className="block text-[10px] mt-2 font-medium">
                    {getMarginText()}
                  </span>
                </div>

                {/* Terms and date config */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="expire">Vencimiento</label>
                    <div className="relative">
                      <input
                        id="expire"
                        type="date"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-300 focus:outline-none focus:border-amber-500 text-xs"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="terms">Términos y Notas</label>
                    <textarea
                      id="terms"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-300 focus:outline-none focus:border-amber-500 text-xs"
                      rows={2}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                    />
                  </div>
                </div>

                {/* Save Quote Action */}
                <button
                  onClick={handleSaveQuote}
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Guardar Presupuesto</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
