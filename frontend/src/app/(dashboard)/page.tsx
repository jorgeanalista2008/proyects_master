// d:\github\proyects_master\frontend\src\app\(dashboard)\page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

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
  client: { name: string };
  manager?: { firstName: string; lastName: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<MonthlyHistory[]>([]);
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States for interactive SVG bar chart tooltip
  const [hoveredBar, setHoveredBar] = useState<{
    idx: number;
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
        // Load summary stats
        const statsRes = await api.get<DashboardStats>("/analytics/summary").catch((err) => {
          console.error("Failed to load stats, using simulated default stats", err);
          return null;
        });

        // Load monthly history
        const historyRes = await api.get<MonthlyHistory[]>("/analytics/history").catch(() => {
          return [
            { month: "2026-01", revenue: 15000, cost: 9000 },
            { month: "2026-02", revenue: 22000, cost: 13000 },
            { month: "2026-03", revenue: 18000, cost: 11000 },
            { month: "2026-04", revenue: 29000, cost: 17500 },
            { month: "2026-05", revenue: 35000, cost: 20000 },
            { month: "2026-06", revenue: 42000, cost: 23000 },
          ];
        });

        // Load projects
        const projectsRes = await api.get<ProjectSummary[]>("/projects").catch(() => []);
        const sorted = (projectsRes || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setStats(statsRes);
        setHistory(historyRes);
        setRecentProjects(sorted);
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
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando panel de inicio (CRM)...</p>
      </div>
    );
  }

  // --- Fallbacks for statistics in case of empty DB ---
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

  // Calculations
  const activeProjectsCount = defaultStats.projects.APPROVED + defaultStats.projects.IN_PROGRESS;
  const quotesTotal = defaultStats.quotes.total || 0;
  const quotesApproved = defaultStats.quotes.APPROVED || 0;
  const approvalRate = quotesTotal > 0 ? Math.round((quotesApproved / quotesTotal) * 100) : 0;
  const marginPercent = defaultStats.financialsUSD.marginPercent || 0;
  const completedRate = defaultStats.projects.total > 0
    ? Math.round((defaultStats.projects.COMPLETED / defaultStats.projects.total) * 100)
    : 0;

  // Star ratings representation (0 to 5 stars) based on approval rate
  const starsCount = Math.round((approvalRate / 100) * 5);

  // SVG configurations for Double Bar Chart
  const maxVal = Math.max(...history.map((h) => Math.max(h.revenue, h.cost)), 1000);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const handleBarMouseMove = (
    e: React.MouseEvent<SVGRectElement, MouseEvent>,
    idx: number,
    item: MonthlyHistory
  ) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoveredBar({
      idx,
      month: getMonthName(item.month),
      revenue: item.revenue,
      cost: item.cost,
      x,
      y
    });
  };

  const handleBarMouseLeave = () => {
    setHoveredBar(null);
  };

  // Helper for generating custom client initials avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Welcome & Dashboard header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="title-primary" style={{ margin: 0, fontSize: "1.75rem" }}>Panel CRM</h1>
          <p className="subtitle-secondary" style={{ margin: 0, fontSize: "0.875rem" }}>
            Gestión de relaciones con clientes, cotizaciones y rendimiento operativo.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/projects" className="btn btn-primary btn-sm">
            + Nuevo Presupuesto
          </Link>
          <div className="date-badge" style={{ display: "flex", alignItems: "center" }}>
            📅 {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Row 1: CRM Header Cards Grid (Ratings/Sessions/Transactions) */}
      <div className="vuexy-grid-row">
        
        {/* Widget 1: Presupuestos (Ratings style) */}
        <div className="vuexy-col-3">
          <div className="vuexy-card" style={{ padding: "1.25rem", justifyContent: "space-between", minHeight: "155px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="stats-title" style={{ fontSize: "0.95rem" }}>Presupuestos</span>
              <span className="stats-subtitle" style={{ fontSize: "0.75rem" }}>Tasa de Aprobación</span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.35rem 0" }}>
                {quotesTotal} <span style={{ fontSize: "0.75rem", color: "hsl(var(--success))", fontWeight: 700 }}>+{approvalRate}%</span>
              </h2>
              <div className="crm-stars-container">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} style={{ opacity: s <= starsCount ? 1 : 0.2 }}>★</span>
                ))}
                <span style={{ fontSize: "0.725rem", color: "hsl(var(--text-muted))", marginLeft: "0.25rem" }}>({quotesApproved} Aprobados)</span>
              </div>
            </div>
            
            {/* Sparkline line chart */}
            <div className="crm-sparkline-container">
              <svg width="100%" height="100%" viewBox="0 0 90 35">
                <path
                  d="M0,30 Q15,10 30,22 T60,5 T90,15"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="90" cy="15" r="3" fill="hsl(var(--primary))" />
              </svg>
            </div>
          </div>
        </div>

        {/* Widget 2: Levantamientos (Sessions style) */}
        <div className="vuexy-col-3">
          <div className="vuexy-card" style={{ padding: "1.25rem", justifyContent: "space-between", minHeight: "155px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="stats-title" style={{ fontSize: "0.95rem" }}>Levantamientos</span>
              <span className="stats-subtitle" style={{ fontSize: "0.75rem" }}>Pendientes por cotizar</span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.35rem 0" }}>
                {defaultStats.projects.PENDING} <span style={{ fontSize: "0.725rem", color: "hsl(var(--text-muted))", fontWeight: 500 }}>obras activas</span>
              </h2>
              <span className="crm-badge-grow success" style={{ marginTop: "0.15rem" }}>
                En Campo
              </span>
            </div>

            {/* Sparkline bar chart */}
            <div className="crm-sparkline-container" style={{ gap: "3px" }}>
              {[15, 25, 10, 30, 20, 35, 25].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: "rgba(0, 207, 221, 0.8)",
                    borderRadius: "2px"
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: General Statistics (Transactions style) */}
        <div className="vuexy-col-6">
          <div className="vuexy-card" style={{ padding: "1.25rem 1.5rem", justifyContent: "center" }}>
            <div className="stats-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <span className="stats-title">Estadísticas Comerciales</span>
                <p className="stats-subtitle" style={{ margin: 0 }}>Ventas netas y conversión del mes</p>
              </div>
            </div>

            <div className="stats-list-grid" style={{ gap: "1rem" }}>
              {/* Stat 1: Revenue */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-primary" style={{ width: "38px", height: "38px" }}>
                  💰
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value" style={{ fontSize: "1rem" }}>{formattedUSD(defaultStats.financialsUSD.revenue)}</span>
                  <span className="stats-item-label" style={{ fontSize: "0.725rem" }}>Ingresos Netos</span>
                </div>
              </div>

              {/* Stat 2: Projects */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-warning" style={{ width: "38px", height: "38px" }}>
                  📁
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value" style={{ fontSize: "1rem" }}>{defaultStats.projects.total}</span>
                  <span className="stats-item-label" style={{ fontSize: "0.725rem" }}>Instalaciones</span>
                </div>
              </div>

              {/* Stat 3: Conversion */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-success" style={{ width: "38px", height: "38px" }}>
                  📈
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value" style={{ fontSize: "1rem" }}>{approvalRate}%</span>
                  <span className="stats-item-label" style={{ fontSize: "0.725rem" }}>Aprobación</span>
                </div>
              </div>

              {/* Stat 4: Margin */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-info" style={{ width: "38px", height: "38px" }}>
                  📊
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value" style={{ fontSize: "1rem" }}>{marginPercent}%</span>
                  <span className="stats-item-label" style={{ fontSize: "0.725rem" }}>Margen Bruto</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Revenue Growth & Earning Reports */}
      <div className="vuexy-grid-row">
        
        {/* Widget 4: Crecimiento de Margen (Revenue Growth style) */}
        <div className="vuexy-col-4">
          <div className="vuexy-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ width: "100%", textAlign: "left" }}>
              <span className="stats-title">Crecimiento de Margen</span>
              <p className="stats-subtitle">Porcentaje de utilidad consolidada</p>
            </div>
            
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", margin: "1rem 0" }}>
              <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="hsla(var(--foreground), 0.05)" strokeWidth="6" />
                {/* Active Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="url(#crmMarginGrad)"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={(2 * Math.PI * 38) - ((2 * Math.PI * 38) * marginPercent) / 100}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
                <defs>
                  <linearGradient id="crmMarginGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="#00CFDD" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "monospace" }}>{marginPercent}%</span>
                <span style={{ fontSize: "0.65rem", color: "hsl(var(--text-muted))", textTransform: "uppercase" }}>Margen</span>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", marginTop: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.4rem" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Venta Bruta:</span>
                <span style={{ fontWeight: 600 }}>{formattedUSD(defaultStats.financialsUSD.revenue)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.4rem" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Costo Total:</span>
                <span style={{ fontWeight: 600 }}>{formattedUSD(defaultStats.financialsUSD.cost)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.15rem" }}>
                <span style={{ color: "hsl(var(--text-secondary))" }}>Ganancia Neta:</span>
                <span style={{ fontWeight: 600, color: "hsl(var(--success))" }}>{formattedUSD(defaultStats.financialsUSD.profit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 5: Earning Reports (Ventas vs Costos) */}
        <div className="vuexy-col-8">
          <div className="vuexy-card" ref={chartContainerRef}>
            <div className="earning-header-flex">
              <div>
                <span className="stats-title">Reporte de Ventas vs Costos</span>
                <p className="stats-subtitle">Comparativa consolidada mensual en USD</p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.725rem", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ width: "8px", height: "8px", background: "hsl(var(--primary))", borderRadius: "2px" }} />
                  Ingresos
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ width: "8px", height: "8px", background: "hsl(var(--accent))", borderRadius: "2px" }} />
                  Costos
                </span>
              </div>
            </div>

            <div className="earning-layout-container">
              {/* Double bar chart SVG */}
              <div className="earning-chart-wrapper">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ overflow: "visible" }}>
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
                    const gridVal = maxVal * (1 - ratio);
                    return (
                      <g key={idx}>
                        <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="hsla(var(--foreground), 0.05)" strokeWidth="1" />
                        <text x={paddingLeft - 8} y={y + 4} fill="hsl(var(--text-muted))" fontSize="9" textAnchor="end" fontFamily="monospace">
                          {gridVal >= 1000 ? `${Math.round(gridVal / 1000)}k` : Math.round(gridVal)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars rendering */}
                  {history.map((item, idx) => {
                    const usableWidth = chartWidth - paddingLeft - paddingRight;
                    const barGroupSpacing = usableWidth / history.length;
                    const groupX = paddingLeft + idx * barGroupSpacing + barGroupSpacing * 0.15;
                    const barWidth = barGroupSpacing * 0.32;

                    const heightRatio = chartHeight - paddingTop - paddingBottom;
                    const salesHeight = (item.revenue / maxVal) * heightRatio;
                    const costHeight = (item.cost / maxVal) * heightRatio;

                    const salesY = chartHeight - paddingBottom - salesHeight;
                    const costY = chartHeight - paddingBottom - costHeight;

                    return (
                      <g key={idx} className="chart-bar-group">
                        {/* Hover detector */}
                        <rect
                          x={groupX - 4}
                          y={paddingTop}
                          width={barWidth * 2 + 12}
                          height={heightRatio}
                          fill="transparent"
                          onMouseMove={(e) => handleBarMouseMove(e, idx, item)}
                          onMouseLeave={handleBarMouseLeave}
                        />
                        {/* Revenue Bar */}
                        <rect x={groupX} y={salesY} width={barWidth} height={Math.max(salesHeight, 3)} rx="2" fill="url(#crmRevenueBarGrad)" style={{ pointerEvents: "none" }} />
                        {/* Cost Bar */}
                        <rect x={groupX + barWidth + 4} y={costY} width={barWidth} height={Math.max(costHeight, 3)} rx="2" fill="url(#crmCostBarGrad)" style={{ pointerEvents: "none" }} />
                        {/* Month text label */}
                        <text x={groupX + barWidth + 2} y={chartHeight - 12} fill="hsl(var(--text-secondary))" fontSize="10" fontWeight="600" textAnchor="middle" style={{ pointerEvents: "none" }}>
                          {getMonthName(item.month)}
                        </text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="crmRevenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsla(var(--primary), 0.4)" />
                    </linearGradient>
                    <linearGradient id="crmCostBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" />
                      <stop offset="100%" stopColor="hsla(var(--accent), 0.3)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Tooltip HTML overlay */}
                {hoveredBar && (
                  <div className="chart-tooltip-box" style={{ left: `${hoveredBar.x}px`, top: `${hoveredBar.y}px` }}>
                    <strong style={{ borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "2px", marginBottom: "2px" }}>
                      {hoveredBar.month}
                    </strong>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                      <span style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>Ventas:</span>
                      <strong>{formattedUSD(hoveredBar.revenue)}</strong>
                    </span>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                      <span style={{ color: "hsl(var(--accent))", fontWeight: 600 }}>Costos:</span>
                      <strong>{formattedUSD(hoveredBar.cost)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Side panel */}
              <div className="earning-side-panel">
                <div className="side-panel-metric">
                  <div className="side-panel-header">Ventas</div>
                  <span className="side-panel-value">{formattedUSD(defaultStats.financialsUSD.revenue)}</span>
                  <div className="side-panel-progress-track">
                    <div className="side-panel-progress-bar" style={{ width: "100%", background: "hsl(var(--primary))" }} />
                  </div>
                </div>
                <div className="side-panel-metric">
                  <div className="side-panel-header">Costos</div>
                  <span className="side-panel-value">{formattedUSD(defaultStats.financialsUSD.cost)}</span>
                  <div className="side-panel-progress-track">
                    <div
                      className="side-panel-progress-bar"
                      style={{
                        width: `${defaultStats.financialsUSD.revenue > 0 ? (defaultStats.financialsUSD.cost / defaultStats.financialsUSD.revenue) * 100 : 0}%`,
                        background: "hsl(var(--accent))"
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Control de Obras, Especialidades & Proyectos Recientes */}
      <div className="vuexy-grid-row">
        
        {/* Widget 6: Control de Obras (Project Status style) */}
        <div className="vuexy-col-4">
          <div className="vuexy-card">
            <span className="stats-title">Control de Obras</span>
            <p className="stats-subtitle">Avance de proyectos finalizados</p>
            
            <div className="support-tracker-layout" style={{ marginTop: "0.5rem" }}>
              <div className="gauge-chart-container" style={{ width: "130px", height: "130px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="hsla(var(--foreground), 0.05)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="url(#crmRadialGrad)"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={(2 * Math.PI * 38) - ((2 * Math.PI * 38) * completedRate) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                  <defs>
                    <linearGradient id="crmRadialGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--success))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="gauge-text-overlay">
                  <span className="gauge-percentage" style={{ fontSize: "1.5rem" }}>{completedRate}%</span>
                  <span className="gauge-label" style={{ fontSize: "0.65rem" }}>Entregados</span>
                </div>
              </div>

              <div className="support-tracker-footer-grid" style={{ paddingTop: "1rem" }}>
                <div className="support-footer-item">
                  <span className="support-footer-value">{defaultStats.projects.IN_PROGRESS}</span>
                  <span className="support-footer-label">Instalación</span>
                </div>
                <div className="support-footer-item" style={{ borderLeft: "1px solid hsl(var(--border-glass))", borderRight: "1px solid hsl(var(--border-glass))" }}>
                  <span className="support-footer-value" style={{ color: "hsl(var(--warning))" }}>{defaultStats.projects.QUOTED}</span>
                  <span className="support-footer-label">Cotizados</span>
                </div>
                <div className="support-footer-item">
                  <span className="support-footer-value" style={{ color: "hsl(var(--success))" }}>{defaultStats.projects.COMPLETED}</span>
                  <span className="support-footer-label">Finalizados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 7: Especialidades */}
        <div className="vuexy-col-4">
          <div className="vuexy-card">
            <span className="stats-title">Especialidades de Instalación</span>
            <p className="stats-subtitle">Distribución del catálogo contratado</p>
            
            <div className="specialty-list" style={{ marginTop: "0.75rem" }}>
              <div className="specialty-item">
                <div className="specialty-icon-wrapper" style={{ borderColor: "hsla(250, 95%, 68%, 0.2)", width: "34px", height: "34px", fontSize: "0.95rem" }}>
                  📹
                </div>
                <div className="specialty-details">
                  <div className="specialty-name-flex" style={{ fontSize: "0.8rem" }}>
                    <span>CCTV y Monitoreo IP</span>
                    <span className="text-glow-primary">45%</span>
                  </div>
                  <div className="specialty-progress-track" style={{ height: "4px" }}>
                    <div className="specialty-progress-bar" style={{ width: "45%", background: "hsl(var(--primary))" }} />
                  </div>
                </div>
              </div>

              <div className="specialty-item">
                <div className="specialty-icon-wrapper" style={{ borderColor: "hsla(30, 100%, 63%, 0.2)", width: "34px", height: "34px", fontSize: "0.95rem" }}>
                  ⚡
                </div>
                <div className="specialty-details">
                  <div className="specialty-name-flex" style={{ fontSize: "0.8rem" }}>
                    <span>Cercos y Perímetros</span>
                    <span style={{ color: "hsl(var(--warning))" }}>30%</span>
                  </div>
                  <div className="specialty-progress-track" style={{ height: "4px" }}>
                    <div className="specialty-progress-bar" style={{ width: "30%", background: "hsl(var(--warning))" }} />
                  </div>
                </div>
              </div>

              <div className="specialty-item">
                <div className="specialty-icon-wrapper" style={{ borderColor: "hsla(147, 66%, 47%, 0.2)", width: "34px", height: "34px", fontSize: "0.95rem" }}>
                  🔌
                </div>
                <div className="specialty-details">
                  <div className="specialty-name-flex" style={{ fontSize: "0.8rem" }}>
                    <span>Redes y Conectividad</span>
                    <span style={{ color: "hsl(var(--success))" }}>25%</span>
                  </div>
                  <div className="specialty-progress-track" style={{ height: "4px" }}>
                    <div className="specialty-progress-bar" style={{ width: "25%", background: "hsl(var(--success))" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 8: Proyectos Recientes (CrmRecentProjects style) */}
        <div className="vuexy-col-4">
          <div className="vuexy-card">
            <span className="stats-title">Proyectos Recientes</span>
            <p className="stats-subtitle">Últimos levantamientos registrados</p>
            
            {recentProjects.length === 0 ? (
              <p className="empty-text" style={{ fontSize: "0.8rem", padding: "1.5rem 0" }}>No hay obras registradas.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
                {recentProjects.map((project) => (
                  <div key={project.id} className="crm-project-item-flex">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div className="crm-client-avatar">
                        {getInitials(project.client?.name || "C")}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <Link href={`/projects/${project.id}`} className="font-weight-medium" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
                          {project.name}
                        </Link>
                        <span style={{ fontSize: "0.725rem", color: "hsl(var(--text-muted))" }}>{project.client?.name}</span>
                      </div>
                    </div>
                    
                    <span className={`status-badge status-${project.status.toLowerCase()}`} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
                      {project.status === "PENDING" && "Levantamiento"}
                      {project.status === "QUOTED" && "Cotizado"}
                      {project.status === "APPROVED" && "Aprobado"}
                      {project.status === "IN_PROGRESS" && "Instalación"}
                      {project.status === "COMPLETED" && "Completado"}
                      {project.status === "CANCELLED" && "Cancelado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
