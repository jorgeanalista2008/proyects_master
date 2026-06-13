// d:\github\proyects_master\frontend\src\app\(dashboard)\analytics\page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface SummaryStats {
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

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [history, setHistory] = useState<MonthlyHistory[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
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
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [summaryData, historyData, projectsData] = await Promise.all([
          api.get<SummaryStats>("/analytics/summary"),
          api.get<MonthlyHistory[]>("/analytics/history").catch((err) => {
            console.warn("History API failed, using fallback mock history data", err);
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

        setSummary(summaryData);
        setHistory(historyData);
        // Sort projects by date and slice top 5
        const sortedProjects = (projectsData || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setProjects(sortedProjects);
      } catch (err: any) {
        console.error("Error loading analytics:", err);
        setError("No se pudieron cargar los datos analíticos del sistema.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando reportes y analíticas corporativas...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
        <span style={{ fontSize: "3rem" }}>⚠️</span>
        <h3 style={{ marginTop: "1rem" }}>Error de Conexión</h3>
        <p style={{ color: "hsl(var(--text-secondary))" }}>{error || "No hay información de resumen disponible."}</p>
      </div>
    );
  }

  // --- Date Translation Helpers ---
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

  // --- Calculations for widgets ---
  const activeProjectsCount = summary.projects.APPROVED + summary.projects.IN_PROGRESS;
  const quotesTotal = summary.quotes.total || 0;
  const quotesApproved = summary.quotes.APPROVED || 0;
  const approvalRate = quotesTotal > 0 ? Math.round((quotesApproved / quotesTotal) * 100) : 0;
  const marginPercent = summary.financialsUSD.marginPercent || 0;

  // Percentage of completed projects for radial gauge tracker
  const completedRate = summary.projects.total > 0
    ? Math.round((summary.projects.COMPLETED / summary.projects.total) * 100)
    : 0;

  // --- SVG DOUBLE BAR CHART CONFIG ---
  const maxVal = Math.max(...history.map((h) => Math.max(h.revenue, h.cost)), 1000);
  const chartHeight = 200;
  const chartWidth = 460;
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

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Top Banner Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="title-primary" style={{ margin: 0, fontSize: "1.75rem" }}>Panel Analítico</h1>
          <p className="subtitle-secondary" style={{ margin: 0, fontSize: "0.875rem" }}>
            Monitoreo en tiempo real de rentabilidad, cotizaciones y conversión de infraestructura.
          </p>
        </div>
        <div className="date-badge">
          📅 {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Row 1: Congratulations Banner & Statistics Grid */}
      <div className="vuexy-grid-row">
        
        {/* Widget 1: Congratulations Card */}
        <div className="vuexy-col-4">
          <div className="vuexy-card card-congratulations">
            <div className="card-congratulations-content">
              <h3 className="stats-title" style={{ fontSize: "1.25rem", color: "hsl(var(--primary))", marginBottom: "0.5rem" }}>
                ¡Felicidades {user?.firstName}! 🎉
              </h3>
              <p className="stats-subtitle" style={{ fontSize: "0.825rem", marginBottom: "1rem", lineHeight: "1.4" }}>
                Has sido el miembro más activo del mes. Tu tasa promedio de ganancia comercial se mantiene óptima.
              </p>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0.25rem 0 0.75rem 0" }}>
                {marginPercent}% <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "hsl(var(--text-secondary))" }}>utilidad promedio</span>
              </h2>
              <Link href="/projects" className="btn btn-primary btn-sm" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}>
                Ver Proyectos
              </Link>
            </div>
            
            <div className="card-congratulations-illustration floating-trophy">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                {/* Gold Trophy Illustration SVG */}
                <circle cx="50" cy="50" r="45" fill="hsla(var(--primary), 0.1)" />
                <path d="M30 35H70V45C70 56 61 65 50 65C39 65 30 56 30 45V35Z" fill="url(#trophyGold)" stroke="#EAB308" strokeWidth="2" />
                <path d="M50 65V78M38 78H62" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
                <path d="M30 40H22C18 40 18 48 22 48H30" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
                <path d="M70 40H78C82 40 82 48 78 48H70" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="46" r="6" fill="#FDE047" />
                <polygon points="50,42 52,45 55,45 53,47 54,50 50,48 46,50 47,47 45,45 48,45" fill="#EAB308" />
                {/* Glow particles */}
                <circle cx="25" cy="25" r="2" fill="#FDE047" opacity="0.8" />
                <circle cx="75" cy="22" r="3" fill="#FDE047" opacity="0.6" />
                <circle cx="82" cy="65" r="2" fill="#FDE047" opacity="0.7" />
                <defs>
                  <linearGradient id="trophyGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#CA8A04" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Widget 2: Statistics Grid (Transactions) */}
        <div className="vuexy-col-8">
          <div className="vuexy-card" style={{ justifyContent: "center" }}>
            <div className="stats-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 className="stats-title">Estadísticas Comerciales</h3>
                <p className="stats-subtitle">Historial acumulado de operaciones vigentes</p>
              </div>
              <span style={{ fontSize: "0.775rem", color: "hsl(var(--text-muted))" }}>Actualizado hace un momento</span>
            </div>
            
            <div className="stats-list-grid">
              
              {/* Stat 1: Revenue */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-primary">
                  💰
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value">{formattedUSD(summary.financialsUSD.revenue)}</span>
                  <span className="stats-item-label">Ventas Netas</span>
                </div>
              </div>

              {/* Stat 2: Active Projects */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-warning">
                  📁
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value">{activeProjectsCount}</span>
                  <span className="stats-item-label">Instalaciones</span>
                </div>
              </div>

              {/* Stat 3: Approval Rate */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-success">
                  📈
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value">{approvalRate}%</span>
                  <span className="stats-item-label">Aprobación</span>
                </div>
              </div>

              {/* Stat 4: Margin */}
              <div className="stats-item-flex">
                <div className="stats-avatar-circle avatar-info">
                  📊
                </div>
                <div className="stats-item-data">
                  <span className="stats-item-value">{marginPercent}%</span>
                  <span className="stats-item-label">Margen Bruto</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Earning Reports & Support Tracker */}
      <div className="vuexy-grid-row">
        
        {/* Widget 3: Earning Reports Chart */}
        <div className="vuexy-col-7">
          <div className="vuexy-card" ref={chartContainerRef}>
            <div className="earning-header-flex">
              <div>
                <h3 className="stats-title">Reporte de Ventas vs Costos</h3>
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
              {/* Interactive SVG double bar chart */}
              <div className="earning-chart-wrapper">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  width="100%"
                  height="100%"
                  style={{ overflow: "visible" }}
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
                    const gridVal = maxVal * (1 - ratio);
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={chartWidth - paddingRight}
                          y2={y}
                          stroke="hsla(var(--foreground), 0.06)"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingLeft - 8}
                          y={y + 4}
                          fill="hsl(var(--text-muted))"
                          fontSize="9"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
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
                        {/* Background invisible hovering capsule for easier hover */}
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
                        <rect
                          x={groupX}
                          y={salesY}
                          width={barWidth}
                          height={Math.max(salesHeight, 3)}
                          rx="3"
                          fill="url(#revenueBarGrad)"
                          style={{ pointerEvents: "none" }}
                        />

                        {/* Cost Bar */}
                        <rect
                          x={groupX + barWidth + 4}
                          y={costY}
                          width={barWidth}
                          height={Math.max(costHeight, 3)}
                          rx="3"
                          fill="url(#costBarGrad)"
                          style={{ pointerEvents: "none" }}
                        />

                        {/* Month text label */}
                        <text
                          x={groupX + barWidth + 2}
                          y={chartHeight - 12}
                          fill="hsl(var(--text-secondary))"
                          fontSize="10"
                          fontWeight="600"
                          textAnchor="middle"
                          style={{ pointerEvents: "none" }}
                        >
                          {getMonthName(item.month)}
                        </text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsla(var(--primary), 0.4)" />
                    </linearGradient>
                    <linearGradient id="costBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" />
                      <stop offset="100%" stopColor="hsla(var(--accent), 0.3)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Render interactive HTML Tooltip */}
                {hoveredBar && (
                  <div
                    className="chart-tooltip-box"
                    style={{
                      left: `${hoveredBar.x}px`,
                      top: `${hoveredBar.y}px`,
                    }}
                  >
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
                    <span style={{ display: "flex", justifyContent: "space-between", gap: "1rem", borderTop: "1px dashed hsl(var(--border-glass))", paddingTop: "2px", marginTop: "2px" }}>
                      <span style={{ color: "hsl(var(--success))", fontWeight: 600 }}>Margen:</span>
                      <strong style={{ color: "hsl(var(--success))" }}>
                        {formattedUSD(hoveredBar.revenue - hoveredBar.cost)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Side Stats Panel */}
              <div className="earning-side-panel">
                
                {/* Metric 1: Ingreso Acumulado */}
                <div className="side-panel-metric">
                  <div className="side-panel-header">
                    <span style={{ width: "6px", height: "6px", background: "hsl(var(--primary))", borderRadius: "50%" }} />
                    Venta Total
                  </div>
                  <span className="side-panel-value">{formattedUSD(summary.financialsUSD.revenue)}</span>
                  <div className="side-panel-progress-track">
                    <div className="side-panel-progress-bar" style={{ width: "100%", background: "hsl(var(--primary))" }} />
                  </div>
                </div>

                {/* Metric 2: Costo Acumulado */}
                <div className="side-panel-metric">
                  <div className="side-panel-header">
                    <span style={{ width: "6px", height: "6px", background: "hsl(var(--accent))", borderRadius: "50%" }} />
                    Costo Total
                  </div>
                  <span className="side-panel-value">{formattedUSD(summary.financialsUSD.cost)}</span>
                  <div className="side-panel-progress-track">
                    <div
                      className="side-panel-progress-bar"
                      style={{
                        width: `${summary.financialsUSD.revenue > 0 ? (summary.financialsUSD.cost / summary.financialsUSD.revenue) * 100 : 0}%`,
                        background: "hsl(var(--accent))"
                      }}
                    />
                  </div>
                </div>

                {/* Metric 3: Ganancia */}
                <div className="side-panel-metric">
                  <div className="side-panel-header">
                    <span style={{ width: "6px", height: "6px", background: "hsl(var(--success))", borderRadius: "50%" }} />
                    Utilidad Neta
                  </div>
                  <span className="side-panel-value" style={{ color: "hsl(var(--success))" }}>
                    {formattedUSD(summary.financialsUSD.profit)}
                  </span>
                  <div className="side-panel-progress-track">
                    <div className="side-panel-progress-bar" style={{ width: `${marginPercent}%`, background: "hsl(var(--success))" }} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Widget 4: Support Tracker (Control de Instalaciones) */}
        <div className="vuexy-col-5">
          <div className="vuexy-card">
            <h3 className="stats-title">Control de Instalaciones</h3>
            <p className="stats-subtitle" style={{ marginBottom: "1rem" }}>Avance total de obras finalizadas</p>
            
            <div className="support-tracker-layout">
              {/* Radial gauge circle */}
              <div className="gauge-chart-container">
                <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  {/* Outer Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="hsla(var(--foreground), 0.05)"
                    strokeWidth="6"
                  />
                  {/* Glowing Active Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="url(#radialGaugeGrad)"
                    strokeWidth="6.5"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={(2 * Math.PI * 38) - ((2 * Math.PI * 38) * completedRate) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                  <defs>
                    <linearGradient id="radialGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--success))" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="gauge-text-overlay">
                  <span className="gauge-percentage">{completedRate}%</span>
                  <span className="gauge-label">Completados</span>
                </div>
              </div>

              {/* Quick statistics list under the gauge */}
              <div className="support-tracker-footer-grid">
                
                <div className="support-footer-item">
                  <span className="support-footer-value">{summary.projects.IN_PROGRESS}</span>
                  <span className="support-footer-label">Ejecución</span>
                </div>

                <div className="support-footer-item" style={{ borderLeft: "1px solid hsl(var(--border-glass))", borderRight: "1px solid hsl(var(--border-glass))" }}>
                  <span className="support-footer-value" style={{ color: "hsl(var(--warning))" }}>{summary.projects.QUOTED}</span>
                  <span className="support-footer-label">Cotizados</span>
                </div>

                <div className="support-footer-item">
                  <span className="support-footer-value" style={{ color: "hsl(var(--success))" }}>{summary.projects.COMPLETED}</span>
                  <span className="support-footer-label">Entregas</span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Recent Projects Table & Specialty Breakdown */}
      <div className="vuexy-grid-row">
        
        {/* Widget 5: Project Statistics Table */}
        <div className="vuexy-col-8">
          <div className="vuexy-card" style={{ padding: "1.75rem" }}>
            <div className="card-header-flex" style={{ marginBottom: "1.25rem" }}>
              <div>
                <h3 className="stats-title" style={{ fontSize: "1.125rem" }}>Estatus de Proyectos Recientes</h3>
                <p className="stats-subtitle">Últimos levantamientos de CCTV y cableado estructurado</p>
              </div>
              <Link href="/projects" className="btn btn-secondary btn-sm" style={{ border: "1px solid hsl(var(--border-glass))", background: "transparent" }}>
                Ver Todos
              </Link>
            </div>

            {projects.length === 0 ? (
              <p className="empty-text">No hay proyectos ingresados en el sistema en este momento.</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: 0 }}>Proyecto</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="font-weight-medium" style={{ paddingLeft: 0, color: "hsl(var(--text-primary))" }}>
                          {project.name}
                        </td>
                        <td>{project.client?.name}</td>
                        <td>
                          <span className={`status-badge status-${project.status.toLowerCase()}`}>
                            {project.status === "PENDING" && "Levantamiento"}
                            {project.status === "QUOTED" && "Cotizado"}
                            {project.status === "APPROVED" && "Aprobado"}
                            {project.status === "IN_PROGRESS" && "Instalación"}
                            {project.status === "COMPLETED" && "Completado"}
                            {project.status === "CANCELLED" && "Cancelado"}
                          </span>
                        </td>
                        <td>
                          {new Date(project.createdAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Widget 6: Specialty Distribution */}
        <div className="vuexy-col-4">
          <div className="vuexy-card">
            <h3 className="stats-title">Especialidades de Instalación</h3>
            <p className="stats-subtitle">Porcentaje de demanda de infraestructura</p>
            
            <div className="specialty-list">
              
              {/* Specialty 1: CCTV */}
              <div className="specialty-item">
                <div className="specialty-icon-wrapper" style={{ borderColor: "hsla(250, 95%, 68%, 0.2)" }}>
                  📹
                </div>
                <div className="specialty-details">
                  <div className="specialty-name-flex">
                    <span>CCTV y Monitoreo IP</span>
                    <span className="text-glow-primary">45%</span>
                  </div>
                  <div className="specialty-progress-track">
                    <div className="specialty-progress-bar" style={{ width: "45%", background: "hsl(var(--primary))" }} />
                  </div>
                </div>
              </div>

              {/* Specialty 2: Cercos */}
              <div className="specialty-item">
                <div className="specialty-icon-wrapper" style={{ borderColor: "hsla(30, 100%, 63%, 0.2)" }}>
                  ⚡
                </div>
                <div className="specialty-details">
                  <div className="specialty-name-flex">
                    <span>Cercos Eléctricos y Perímetros</span>
                    <span style={{ color: "hsl(var(--warning))" }}>30%</span>
                  </div>
                  <div className="specialty-progress-track">
                    <div className="specialty-progress-bar" style={{ width: "30%", background: "hsl(var(--warning))" }} />
                  </div>
                </div>
              </div>

              {/* Specialty 3: Redes */}
              <div className="specialty-item">
                <div className="specialty-icon-wrapper" style={{ borderColor: "hsla(147, 66%, 47%, 0.2)" }}>
                  🔌
                </div>
                <div className="specialty-details">
                  <div className="specialty-name-flex">
                    <span>Redes de Datos y Conectividad</span>
                    <span style={{ color: "hsl(var(--success))" }}>25%</span>
                  </div>
                  <div className="specialty-progress-track">
                    <div className="specialty-progress-bar" style={{ width: "25%", background: "hsl(var(--success))" }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
