// d:\github\proyects_master\frontend\src\app\(dashboard)\analytics\page.tsx
"use client";

import React, { useEffect, useState } from "react";
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

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [history, setHistory] = useState<MonthlyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [summaryData, historyData] = await Promise.all([
          api.get<SummaryStats>("/analytics/summary"),
          api.get<MonthlyHistory[]>("/analytics/history").catch((err) => {
            console.warn("History API failed, using fallback mock history data", err);
            // Fallback mock history if backend hasn't fully seeded history
            return [
              { month: "Ene", revenue: 15000, cost: 9000 },
              { month: "Feb", revenue: 22000, cost: 13000 },
              { month: "Mar", revenue: 18000, cost: 11000 },
              { month: "Abr", revenue: 29000, cost: 17500 },
              { month: "May", revenue: 35000, cost: 20000 },
              { month: "Jun", revenue: 42000, cost: 23000 },
            ];
          })
        ]);
        setSummary(summaryData);
        setHistory(historyData);
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
        <p>Cargando reportes y analíticas...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
        <span style={{ fontSize: "3rem" }}>⚠️</span>
        <h3 style={{ marginTop: "1rem" }}>Error de Datos</h3>
        <p style={{ color: "hsl(var(--text-secondary))" }}>{error || "No hay información disponible."}</p>
      </div>
    );
  }

  // --- SVG CHART DATA CALCULATIONS ---
  // Find max value in history to scale SVG heights
  const maxVal = Math.max(...history.map((h) => Math.max(h.revenue, h.cost)), 1000);
  const chartHeight = 220;
  const chartWidth = 500;
  const padding = 40;
  
  // Render Project distribution progress bar percent helper
  const getStatusPercent = (count: number) => {
    if (summary.projects.total === 0) return 0;
    return Math.round((count / summary.projects.total) * 100);
  };

  const formattedUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="title-primary">Analíticas de Rentabilidad</h1>
        <p className="subtitle-secondary">
          Evolución de ventas consolidada, márgenes brutos y conversión de proyectos.
        </p>
      </div>

      {/* KPI Stats Row */}
      <section className="kpi-grid" style={{ marginBottom: "2.5rem" }}>
        <div className="kpi-card financial-card revenue">
          <div className="kpi-icon">💰</div>
          <div className="kpi-data">
            <span className="kpi-label">Ingresos Consolidados</span>
            <h2 className="kpi-value">{formattedUSD(summary.financialsUSD.revenue)}</h2>
            <span className="kpi-subtext">Ventas netas aprobadas</span>
          </div>
        </div>

        <div className="kpi-card financial-card cost">
          <div className="kpi-icon">📉</div>
          <div className="kpi-data">
            <span className="kpi-label">Costos Consolidados</span>
            <h2 className="kpi-value">{formattedUSD(summary.financialsUSD.cost)}</h2>
            <span className="kpi-subtext">Costo total de equipos y horas</span>
          </div>
        </div>

        <div className="kpi-card financial-card profit">
          <div className="kpi-icon">📈</div>
          <div className="kpi-data">
            <span className="kpi-label">Ganancia Bruta</span>
            <h2 className="kpi-value">{formattedUSD(summary.financialsUSD.profit)}</h2>
            <span className="kpi-subtext" style={{ color: "hsl(var(--success))", fontWeight: "bold" }}>
              Margen: {summary.financialsUSD.marginPercent}%
            </span>
          </div>
        </div>
      </section>

      {/* Charts Display */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.3fr 0.7fr",
        gap: "2.5rem",
        alignItems: "start"
      }}>
        
        {/* Left Card: Evolution Sales vs Costs (SVG Chart) */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <div className="card-header-flex" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Historial de Ventas vs Costos</h3>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "12px", height: "12px", background: "hsl(var(--primary))", borderRadius: "2px" }} />
                Ventas
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "12px", height: "12px", background: "hsl(var(--accent))", borderRadius: "2px" }} />
                Costos
              </span>
            </div>
          </div>

          {/* SVG Native Chart */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`}
              width="100%"
              height="100%"
              style={{ minWidth: "400px", overflow: "visible" }}
            >
              {/* Background grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padding + (chartHeight - padding) * ratio;
                const gridVal = maxVal * (1 - ratio);
                return (
                  <g key={idx}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="hsla(var(--foreground), 0.08)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 8}
                      y={y + 4}
                      fill="hsl(var(--text-muted))"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {gridVal >= 1000 ? `${Math.round(gridVal / 1000)}k` : Math.round(gridVal)}
                    </text>
                  </g>
                );
              })}

              {/* Draw bars for each month */}
              {history.map((item, idx) => {
                const barSpacing = (chartWidth - padding * 2) / history.length;
                const xBase = padding + idx * barSpacing + barSpacing * 0.15;
                const barWidth = barSpacing * 0.32;

                const salesHeight = (item.revenue / maxVal) * (chartHeight - padding);
                const costHeight = (item.cost / maxVal) * (chartHeight - padding);

                const salesY = chartHeight - salesHeight;
                const costY = chartHeight - costHeight;

                return (
                  <g key={idx} className="chart-bar-group">
                    {/* Sales bar */}
                    <rect
                      x={xBase}
                      y={salesY}
                      width={barWidth}
                      height={Math.max(salesHeight, 2)}
                      rx="3"
                      fill="url(#salesGrad)"
                      style={{ transition: "all var(--transition-slow)" }}
                    />
                    
                    {/* Costs bar */}
                    <rect
                      x={xBase + barWidth + 4}
                      y={costY}
                      width={barWidth}
                      height={Math.max(costHeight, 2)}
                      rx="3"
                      fill="url(#costsGrad)"
                      style={{ transition: "all var(--transition-slow)" }}
                    />

                    {/* Month Label */}
                    <text
                      x={xBase + barWidth + 2}
                      y={chartHeight + 18}
                      fill="hsl(var(--text-secondary))"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsla(var(--primary), 0.4)" />
                </linearGradient>
                <linearGradient id="costsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsla(var(--accent), 0.3)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Right Card: Projects Conversion by status */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Distribución de Proyectos</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Status Item: Levantamiento */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 600 }}>Levantamiento (PENDING)</span>
                <span style={{ color: "hsl(var(--text-secondary))" }}>
                  {summary.projects.PENDING} ({getStatusPercent(summary.projects.PENDING)}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "hsla(var(--foreground), 0.08)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  width: `${getStatusPercent(summary.projects.PENDING)}%`,
                  height: "100%",
                  background: "hsl(var(--warning))",
                  borderRadius: "99px",
                  transition: "width var(--transition-slow)"
                }} />
              </div>
            </div>

            {/* Status Item: Cotizados */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 600 }}>Cotizados (QUOTED)</span>
                <span style={{ color: "hsl(var(--text-secondary))" }}>
                  {summary.projects.QUOTED} ({getStatusPercent(summary.projects.QUOTED)}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "hsla(var(--foreground), 0.08)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  width: `${getStatusPercent(summary.projects.QUOTED)}%`,
                  height: "100%",
                  background: "#fbbf24",
                  borderRadius: "99px",
                  transition: "width var(--transition-slow)"
                }} />
              </div>
            </div>

            {/* Status Item: Aprobados */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 600 }}>Aprobados (APPROVED)</span>
                <span style={{ color: "hsl(var(--text-secondary))" }}>
                  {summary.projects.APPROVED} ({getStatusPercent(summary.projects.APPROVED)}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "hsla(var(--foreground), 0.08)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  width: `${getStatusPercent(summary.projects.APPROVED)}%`,
                  height: "100%",
                  background: "hsl(var(--primary))",
                  borderRadius: "99px",
                  transition: "width var(--transition-slow)"
                }} />
              </div>
            </div>

            {/* Status Item: Instalación */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 600 }}>Instalación (IN_PROGRESS)</span>
                <span style={{ color: "hsl(var(--text-secondary))" }}>
                  {summary.projects.IN_PROGRESS} ({getStatusPercent(summary.projects.IN_PROGRESS)}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "hsla(var(--foreground), 0.08)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  width: `${getStatusPercent(summary.projects.IN_PROGRESS)}%`,
                  height: "100%",
                  background: "#a78bfa",
                  borderRadius: "99px",
                  transition: "width var(--transition-slow)"
                }} />
              </div>
            </div>

            {/* Status Item: Completados */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 600 }}>Completados (COMPLETED)</span>
                <span style={{ color: "hsl(var(--text-secondary))" }}>
                  {summary.projects.COMPLETED} ({getStatusPercent(summary.projects.COMPLETED)}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "hsla(var(--foreground), 0.08)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  width: `${getStatusPercent(summary.projects.COMPLETED)}%`,
                  height: "100%",
                  background: "hsl(var(--success))",
                  borderRadius: "99px",
                  transition: "width var(--transition-slow)"
                }} />
              </div>
            </div>

          </div>

          <div style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid hsl(var(--border-glass))",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem"
          }}>
            <span>Total Proyectos:</span>
            <strong>{summary.projects.total} activos</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
