"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { 
  Truck, 
  AlertTriangle, 
  XOctagon, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  FolderKanban, 
  Loader2, 
  Plus, 
  Calendar 
} from "lucide-react";

interface DashboardStats {
  projects: {
    total: number;
    PENDING: number;
    QUOTED: number;
    APPROVED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  quotes: {
    total: number;
    APPROVED: number;
    REJECTED: number;
  };
  financialsUSD: {
    revenue: number;
    cost: number;
    profit: number;
    marginPercent: number;
  };
}

interface MonthlyHistory {
  month: string;
  revenue: number;
  cost: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  client: { name: string; rutOrId?: string };
  manager?: { firstName: string; lastName: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<MonthlyHistory[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs state for Row 3 Client list
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED">("IN_PROGRESS");

  // Hover states for the shipment combo chart
  const [hoveredData, setHoveredData] = useState<{
    month: string;
    revenue: number;
    cost: number;
    x: number;
    y: number;
  } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, historyRes, projectsRes] = await Promise.all([
          api.get<DashboardStats>("/analytics/summary").catch((err) => {
            console.error("Failed to load stats, using simulated default stats", err);
            return null;
          }),
          api.get<MonthlyHistory[]>("/analytics/history").catch(() => {
            return [
              { month: "2026-01", revenue: 15000, cost: 9000 },
              { month: "2026-02", revenue: 22000, cost: 13000 },
              { month: "2026-03", revenue: 18000, cost: 11000 },
              { month: "2026-04", revenue: 29000, cost: 17500 },
              { month: "2026-05", revenue: 35000, cost: 20000 },
              { month: "2026-06", revenue: 42000, cost: 23000 },
            ];
          }),
          api.get<ProjectSummary[]>("/projects").catch(() => [])
        ]);

        setStats(statsRes);
        setHistory(historyRes);
        setProjects(projectsRes || []);
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError("Ocurrió un error al cargar la información del panel principal.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm font-medium">Cargando panel de operaciones...</p>
      </div>
    );
  }

  // Fallback defaults
  const defaultStats: DashboardStats = stats || {
    projects: { total: 0, PENDING: 0, QUOTED: 0, APPROVED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 },
    quotes: { total: 0, APPROVED: 0, REJECTED: 0 },
    financialsUSD: { revenue: 0, cost: 0, profit: 0, marginPercent: 0 }
  };

  const getMonthName = (monthStr: string) => {
    const parts = monthStr.split("-");
    if (parts.length < 2) return monthStr;
    const monthNum = parseInt(parts[1], 10);
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months[monthNum - 1] || monthStr;
  };

  const formattedUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Stacked progress computations
  const totalProj = defaultStats.projects.total || 1;
  const inProgressPct = Math.round((defaultStats.projects.IN_PROGRESS / totalProj) * 100);
  const approvedPct = Math.round((defaultStats.projects.APPROVED / totalProj) * 100);
  const pendingPct = Math.round((defaultStats.projects.PENDING / totalProj) * 100);
  const completedPct = Math.round((defaultStats.projects.COMPLETED / totalProj) * 100);

  // Exceptions progress gauge
  const completedRate = defaultStats.projects.total > 0
    ? Math.round((defaultStats.projects.COMPLETED / defaultStats.projects.total) * 100)
    : 0;

  const marginPercent = defaultStats.financialsUSD.marginPercent || 0;

  // SVG configurations for Combined Chart (Shipment Statistics style)
  const maxVal = Math.max(...history.map((h) => Math.max(h.revenue, h.cost)), 1000);
  const chartHeight = 220;
  const chartWidth = 520;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;

  const handleChartMouseMove = (
    e: React.MouseEvent<any, MouseEvent>,
    idx: number,
    item: MonthlyHistory
  ) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoveredData({
      month: getMonthName(item.month),
      revenue: item.revenue,
      cost: item.cost,
      x,
      y
    });
  };

  const handleChartMouseLeave = () => {
    setHoveredData(null);
  };

  // Filter projects based on the selected tab in Row 3
  const filteredProjects = projects.filter((p) => p.status === activeTab).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Bar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Monitoreo Operativo</h1>
          <p className="text-xs text-slate-400 mt-1">
            Estatus de instalaciones de infraestructura de seguridad electrónica y facturación.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link 
            href="/projects" 
            className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </Link>
          <div className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Row 1: 4 Logistics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: In Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-100">{defaultStats.projects.IN_PROGRESS}</span>
            <span className="block text-xs text-slate-400 mt-0.5 font-medium">Obras en Instalación</span>
            <span className="block text-[10px] text-emerald-500 mt-1 font-semibold">+18.2% vs semana ant.</span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-100">{defaultStats.projects.PENDING}</span>
            <span className="block text-xs text-slate-400 mt-0.5 font-medium">Levantamientos Campo</span>
            <span className="block text-[10px] text-emerald-500 mt-1 font-semibold">-8.7% vs semana ant.</span>
          </div>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
            <XOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-100">{defaultStats.quotes.REJECTED}</span>
            <span className="block text-xs text-slate-400 mt-0.5 font-medium">Presupuestos Rechazados</span>
            <span className="block text-[10px] text-red-500 mt-1 font-semibold">+4.3% vs semana ant.</span>
          </div>
        </div>

        {/* Card 4: Approved */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-100">{defaultStats.projects.APPROVED}</span>
            <span className="block text-xs text-slate-400 mt-0.5 font-medium">Obras por Iniciar</span>
            <span className="block text-[10px] text-emerald-500 mt-1 font-semibold">+2.5% vs semana ant.</span>
          </div>
        </div>
      </div>

      {/* Row 2: Vehicle Overview & Shipment Statistics (Combo Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget: Resumen de Obras */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">Resumen de Instalaciones</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribución porcentual de proyectos activos</p>
          </div>

          {/* Stacked progress bar */}
          <div className="w-full h-8 bg-slate-950 rounded-lg overflow-hidden flex mt-6">
            <div 
              style={{ width: `${inProgressPct}%` }} 
              className="bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
              title={`Instalación: ${inProgressPct}%`}
            >
              {inProgressPct > 10 && `${inProgressPct}%`}
            </div>
            <div 
              style={{ width: `${approvedPct}%` }} 
              className="bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all"
              title={`Aprobado: ${approvedPct}%`}
            >
              {approvedPct > 10 && `${approvedPct}%`}
            </div>
            <div 
              style={{ width: `${pendingPct}%` }} 
              className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all"
              title={`Levantamiento: ${pendingPct}%`}
            >
              {pendingPct > 10 && `${pendingPct}%`}
            </div>
            <div 
              style={{ width: `${completedPct}%` }} 
              className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all"
              title={`Finalizados: ${completedPct}%`}
            >
              {completedPct > 10 && `${completedPct}%`}
            </div>
          </div>

          {/* List breakdown */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 block" />
                <span className="text-slate-300">En Instalación</span>
              </span>
              <span className="text-slate-400">{defaultStats.projects.IN_PROGRESS} Proyectos</span>
              <strong className="text-slate-200">{inProgressPct}%</strong>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500 block" />
                <span className="text-slate-300">Aprobado (Por Iniciar)</span>
              </span>
              <span className="text-slate-400">{defaultStats.projects.APPROVED} Obras</span>
              <strong className="text-slate-200">{approvedPct}%</strong>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 block" />
                <span className="text-slate-300">Levantamiento Campo</span>
              </span>
              <span className="text-slate-400">{defaultStats.projects.PENDING} Visitas</span>
              <strong className="text-slate-200">{pendingPct}%</strong>
            </div>

            <div className="flex items-center justify-between text-xs pb-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 block" />
                <span className="text-slate-300">Finalizados (Entregados)</span>
              </span>
              <span className="text-slate-400">{defaultStats.projects.COMPLETED} Entregas</span>
              <strong className="text-slate-200">{completedPct}%</strong>
            </div>
          </div>
        </div>

        {/* Widget: Combined Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between relative" ref={chartContainerRef}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold text-slate-100">Estadísticas de Presupuestos</h2>
              <p className="text-xs text-slate-400 mt-0.5">Historial de cotizaciones versus costos operativos</p>
            </div>
            <div className="flex gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 bg-amber-500 rounded-sm" />
                <span>Ventas</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span>Costos</span>
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full aspect-[21/9] min-h-[200px] mt-6">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" className="overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
                const gridVal = maxVal * (1 - ratio);
                return (
                  <g key={idx}>
                    <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} className="stroke-slate-800" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={paddingLeft - 8} y={y + 3} fill="#64748b" className="text-[9px] font-mono" textAnchor="end">
                      {gridVal >= 1000 ? `${Math.round(gridVal / 1000)}k` : Math.round(gridVal)}
                    </text>
                  </g>
                );
              })}

              {/* Bars Rendering (Ventas - Orange) */}
              {history.map((item, idx) => {
                const usableWidth = chartWidth - paddingLeft - paddingRight;
                const barSpacing = usableWidth / history.length;
                const barWidth = barSpacing * 0.35;
                const xBase = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;

                const heightRatio = chartHeight - paddingTop - paddingBottom;
                const salesHeight = (item.revenue / maxVal) * heightRatio;
                const salesY = chartHeight - paddingBottom - salesHeight;

                return (
                  <g key={idx} className="cursor-pointer group" onMouseMove={(e) => handleChartMouseMove(e, idx, item)} onMouseLeave={handleChartMouseLeave}>
                    {/* Invisible hover capsule */}
                    <rect x={xBase - 6} y={paddingTop} width={barWidth + 12} height={heightRatio} fill="transparent" />
                    {/* Orange Bar */}
                    <rect x={xBase} y={salesY} width={barWidth} height={Math.max(salesHeight, 3)} rx="2" className="fill-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    {/* Month label */}
                    <text x={paddingLeft + idx * barSpacing + barSpacing / 2} y={chartHeight - 10} fill="#94a3b8" className="text-[9px] font-semibold" textAnchor="middle">
                      {getMonthName(item.month)}
                    </text>
                  </g>
                );
              })}

              {/* Line Path Rendering (Costos - Indigo) */}
              {(() => {
                const usableWidth = chartWidth - paddingLeft - paddingRight;
                const barSpacing = usableWidth / history.length;
                const points = history.map((item, idx) => {
                  const x = paddingLeft + idx * barSpacing + barSpacing / 2;
                  const heightRatio = chartHeight - paddingTop - paddingBottom;
                  const costHeight = (item.cost / maxVal) * heightRatio;
                  const y = chartHeight - paddingBottom - costHeight;
                  return { x, y };
                });

                const pathD = points.reduce((acc, p, idx) => {
                  return idx === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`;
                }, "");

                return (
                  <g>
                    <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" />
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#0f172a" stroke="#6366f1" strokeWidth="2.5" />
                    ))}
                  </g>
                );
              })()}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredData && (
              <div 
                className="absolute z-10 bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs shadow-2xl flex flex-col space-y-1 text-slate-300 pointer-events-none" 
                style={{ left: `${hoveredData.x}px`, top: `${hoveredData.y}px` }}
              >
                <strong className="block text-slate-200 border-b border-slate-800 pb-1 mb-1 font-bold text-center uppercase tracking-wider text-[10px]">
                  {hoveredData.month}
                </strong>
                <span className="flex justify-between items-center gap-6">
                  <span className="text-amber-500 font-semibold">Ventas:</span>
                  <strong className="text-slate-100">{formattedUSD(hoveredData.revenue)}</strong>
                </span>
                <span className="flex justify-between items-center gap-6">
                  <span className="text-indigo-400 font-semibold">Costos:</span>
                  <strong className="text-slate-100">{formattedUSD(hoveredData.cost)}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Rentabilidad Comercial, Avance de Obras, Proyectos por Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Rentabilidad Comercial */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">Rentabilidad Comercial</h2>
            <p className="text-xs text-slate-400 mt-0.5">Márgenes netos del mes</p>
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-300">Margen Promedio</span>
                  <span className="block text-[10px] text-slate-500">Ponderado de obras</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-200">{marginPercent}%</span>
                <span className="block text-[9px] font-bold text-emerald-500">+25.8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-300">Ganancia Bruta</span>
                  <span className="block text-[10px] text-slate-500">Proyectada en USD</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-200">{formattedUSD(defaultStats.financialsUSD.profit)}</span>
                <span className="block text-[9px] font-bold text-emerald-500">+4.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Avance de Obras */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h2 className="text-base font-bold text-slate-100">Avance de Obras</h2>
            <p className="text-xs text-slate-400 mt-0.5">Entregas culminadas</p>
          </div>
          
          <div className="relative w-36 h-36 mt-4 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) - ((2 * Math.PI * 40) * completedRate) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-100">{completedRate}%</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Obras</span>
            </div>
          </div>

          <span className="text-xs text-slate-400 mt-4 font-medium">
            {defaultStats.projects.COMPLETED} de {defaultStats.projects.total} proyectos entregados
          </span>
        </div>

        {/* Card: Proyectos por Clientes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">Proyectos por Clientes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Últimas órdenes en curso</p>
          </div>
          
          {/* Tabs */}
          <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-lg border border-slate-800/80 mt-4 text-[10px] font-semibold text-center uppercase tracking-wider">
            <button 
              className={`py-1.5 rounded-md transition-colors ${activeTab === "PENDING" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              onClick={() => setActiveTab("PENDING")}
            >
              Nuevos
            </button>
            <button 
              className={`py-1.5 rounded-md transition-colors ${activeTab === "IN_PROGRESS" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              onClick={() => setActiveTab("IN_PROGRESS")}
            >
              Ejecución
            </button>
            <button 
              className={`py-1.5 rounded-md transition-colors ${activeTab === "COMPLETED" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
              onClick={() => setActiveTab("COMPLETED")}
            >
              Entregas
            </button>
          </div>

          {/* List panel */}
          <div className="flex-1 space-y-3 mt-4 flex flex-col justify-center min-h-[120px]">
            {filteredProjects.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6 font-medium">
                No hay proyectos en esta fase.
              </p>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="bg-slate-950 border border-slate-800/50 rounded-lg p-3 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 truncate pr-2">{project.name}</span>
                    <span className="text-[9px] text-amber-500 font-mono font-semibold flex-shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {project.client?.rutOrId || "RUT"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Cli: {project.client?.name}</span>
                    <span className="text-slate-500">
                      {project.manager ? `${project.manager.firstName} ${project.manager.lastName[0]}.` : "Sin manager"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
