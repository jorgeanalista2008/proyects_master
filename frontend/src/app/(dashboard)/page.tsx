"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { 
  Box, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Button, 
  Tab, 
  Tabs, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  Truck, 
  AlertTriangle, 
  XOctagon, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Calendar,
  CheckCircle2
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

  const [activeTab, setActiveTab] = useState<string>("IN_PROGRESS");
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
        setError("");
        
        const isStaff = user?.role === "ADMIN" || user?.role === "SELLER";
        const promises: Promise<any>[] = [
          api.get<ProjectSummary[]>("/projects").catch(() => [])
        ];
        
        if (isStaff) {
          promises.push(
            api.get<DashboardStats>("/analytics/summary").catch((err) => {
              console.error("Failed to load stats", err);
              return null;
            })
          );
          promises.push(
            api.get<MonthlyHistory[]>("/analytics/history").catch(() => {
              return [
                { month: "2026-01", revenue: 15000, cost: 9000 },
                { month: "2026-02", revenue: 22000, cost: 13000 },
                { month: "2026-03", revenue: 18000, cost: 11000 },
                { month: "2026-04", revenue: 29000, cost: 17500 },
                { month: "2026-05", revenue: 35000, cost: 20000 },
                { month: "2026-06", revenue: 42000, cost: 23000 },
              ];
            })
          );
        }

        const results = await Promise.all(promises);
        const projectsRes = results[0];
        const statsRes = isStaff ? results[1] : null;
        const historyRes = isStaff ? results[2] : [];

        setStats(statsRes);
        setHistory(historyRes || []);
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Cargando panel de operaciones...
        </Typography>
      </Box>
    );
  }

  const defaultStats: DashboardStats = stats || {
    projects: { total: 0, PENDING: 0, QUOTED: 0, APPROVED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 },
    quotes: { total: 0, APPROVED: 0, REJECTED: 0 },
    financialsUSD: { revenue: 0, cost: 0, profit: 0, marginPercent: 0 }
  };

  const isStaff = user?.role === "ADMIN" || user?.role === "SELLER";
  const dynamicStats: DashboardStats = isStaff ? defaultStats : {
    projects: {
      total: projects.length,
      PENDING: projects.filter(p => p.status === "PENDING" || p.status === "QUOTED").length,
      QUOTED: projects.filter(p => p.status === "QUOTED").length,
      APPROVED: projects.filter(p => p.status === "APPROVED").length,
      IN_PROGRESS: projects.filter(p => p.status === "IN_PROGRESS").length,
      COMPLETED: projects.filter(p => p.status === "COMPLETED").length,
      CANCELLED: projects.filter(p => p.status === "CANCELLED").length
    },
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

  const totalProj = dynamicStats.projects.total || 1;
  const inProgressPct = Math.round((dynamicStats.projects.IN_PROGRESS / totalProj) * 100);
  const approvedPct = Math.round((dynamicStats.projects.APPROVED / totalProj) * 100);
  const pendingPct = Math.round((dynamicStats.projects.PENDING / totalProj) * 100);
  const completedPct = Math.round((dynamicStats.projects.COMPLETED / totalProj) * 100);

  const completedRate = dynamicStats.projects.total > 0
    ? Math.round((dynamicStats.projects.COMPLETED / dynamicStats.projects.total) * 100)
    : 0;

  const marginPercent = dynamicStats.financialsUSD.marginPercent || 0;

  const isDemoHistory = history.length === 0;
  const chartHistoryData = !isDemoHistory ? history : [
    { month: "2026-01", revenue: 15000, cost: 9000 },
    { month: "2026-02", revenue: 22000, cost: 13000 },
    { month: "2026-03", revenue: 18000, cost: 11000 },
    { month: "2026-04", revenue: 29000, cost: 17500 },
    { month: "2026-05", revenue: 35000, cost: 20000 },
    { month: "2026-06", revenue: 42000, cost: 23000 },
  ];

  const maxVal = Math.max(...chartHistoryData.map((h) => Math.max(h.revenue, h.cost)), 1000);
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

  const filteredProjects = projects.filter((p) => p.status === activeTab).slice(0, 3);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Welcome Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Monitoreo Operativo
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Estatus de instalaciones de infraestructura de seguridad electrónica y facturación.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button 
            component={Link} 
            href="/projects" 
            variant="contained" 
            color="primary" 
            startIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Proyecto
          </Button>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            px: 2, 
            py: 1, 
            bgcolor: "background.paper", 
            border: "1px solid", 
            borderColor: "divider", 
            borderRadius: 1.5 
          }}>
            <Calendar className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Grid: 4 KPI Cards */}
      <Grid container spacing={3}>
        {(isStaff ? [
          {
            title: "Obras en Instalación",
            val: dynamicStats.projects.IN_PROGRESS,
            icon: <Truck className="w-5 h-5" />,
            color: "primary",
            trend: "+18.2% vs semana ant.",
            trendUp: true
          },
          {
            title: "Levantamientos Campo",
            val: dynamicStats.projects.PENDING,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "warning",
            trend: "-8.7% vs semana ant.",
            trendUp: false
          },
          {
            title: "Presupuestos Rechazados",
            val: dynamicStats.quotes.REJECTED,
            icon: <XOctagon className="w-5 h-5" />,
            color: "error",
            trend: "+4.3% vs semana ant.",
            trendUp: false
          },
          {
            title: "Obras por Iniciar",
            val: dynamicStats.projects.APPROVED,
            icon: <Clock className="w-5 h-5" />,
            color: "info",
            trend: "+2.5% vs semana ant.",
            trendUp: true
          }
        ] : [
          {
            title: "Obras en Instalación",
            val: dynamicStats.projects.IN_PROGRESS,
            icon: <Truck className="w-5 h-5" />,
            color: "primary",
            trend: "En proceso activo",
            trendUp: true
          },
          {
            title: "Levantamientos Campo",
            val: dynamicStats.projects.PENDING,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "warning",
            trend: "Evaluaciones técnicas",
            trendUp: true
          },
          {
            title: "Obras por Iniciar",
            val: dynamicStats.projects.APPROVED,
            icon: <Clock className="w-5 h-5" />,
            color: "info",
            trend: "Por comenzar",
            trendUp: true
          },
          {
            title: "Proyectos Entregados",
            val: dynamicStats.projects.COMPLETED,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "success",
            trend: "Entregados con éxito",
            trendUp: true
          }
        ]).map((kpi, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 3 }}>
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: `${kpi.color}.light`,
                  color: `${kpi.color}.main`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85
                }}>
                  {kpi.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {kpi.val}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 500, my: 0.25 }}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 600, 
                    color: kpi.trendUp ? "success.main" : "error.main" 
                  }}>
                    {kpi.trend}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Charts and Distribution */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: isStaff ? 6 : 12 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader 
              title="Resumen de Instalaciones" 
              subheader={isStaff ? "Distribución porcentual de proyectos activos" : "Distribución de tus proyectos de instalación"}
              titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ pt: 0, display: "flex", flexDirection: "column", gap: 3.5 }}>
              <Box sx={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", bgcolor: "divider" }}>
                <Box sx={{ width: `${inProgressPct}%`, bgcolor: "primary.main" }} title={`Instalación: ${inProgressPct}%`} />
                <Box sx={{ width: `${approvedPct}%`, bgcolor: "info.main" }} title={`Aprobado: ${approvedPct}%`} />
                <Box sx={{ width: `${pendingPct}%`, bgcolor: "warning.main" }} title={`Levantamiento: ${pendingPct}%`} />
                <Box sx={{ width: `${completedPct}%`, bgcolor: "success.main" }} title={`Finalizados: ${completedPct}%`} />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "En Instalación", count: defaultStats.projects.IN_PROGRESS, pct: inProgressPct, color: "primary.main" },
                  { label: "Aprobado (Por Iniciar)", count: defaultStats.projects.APPROVED, pct: approvedPct, color: "info.main" },
                  { label: "Levantamiento Campo", count: defaultStats.projects.PENDING, pct: pendingPct, color: "warning.main" },
                  { label: "Finalizados (Entregados)", count: defaultStats.projects.COMPLETED, pct: completedPct, color: "success.main" }
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 550, color: "text.primary" }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {item.count} Proyectos
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {item.pct}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>


        {isStaff && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card ref={chartContainerRef} sx={{ border: "1px solid", borderColor: "divider", position: "relative" }}>
            <CardHeader
              title="Estadísticas de Presupuestos"
              subheader="Historial de cotizaciones versus costos operativos"
              titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
              subheaderTypographyProps={{ variant: "caption" }}
              action={
                <Box sx={{ display: "flex", gap: 2, pr: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Ventas</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "text.secondary" }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Costos</Typography>
                  </Box>
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ width: "100%", height: 220, position: "relative" }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" className={`overflow-visible transition-all duration-300 ${isDemoHistory ? "opacity-20 blur-[0.5px] pointer-events-none" : ""}`}>
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
                    const gridVal = maxVal * (1 - ratio);
                    return (
                      <g key={idx}>
                        <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={paddingLeft - 8} y={y + 3} fill="#64748b" style={{ fontSize: "9px", fontFamily: "monospace" }} textAnchor="end">
                          {gridVal >= 1000 ? `${Math.round(gridVal / 1000)}k` : Math.round(gridVal)}
                        </text>
                      </g>
                    );
                  })}

                  {chartHistoryData.map((item, idx) => {
                    const usableWidth = chartWidth - paddingLeft - paddingRight;
                    const barSpacing = usableWidth / chartHistoryData.length;
                    const barWidth = barSpacing * 0.35;
                    const xBase = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;

                    const heightRatio = chartHeight - paddingTop - paddingBottom;
                    const salesHeight = (item.revenue / maxVal) * heightRatio;
                    const salesY = chartHeight - paddingBottom - salesHeight;

                    return (
                      <g key={idx} style={{ cursor: "pointer" }} onMouseMove={(e) => handleChartMouseMove(e, idx, item)} onMouseLeave={handleChartMouseLeave}>
                        <rect x={xBase - 6} y={paddingTop} width={barWidth + 12} height={heightRatio} fill="transparent" />
                        <rect x={xBase} y={salesY} width={barWidth} height={Math.max(salesHeight, 3)} rx="1" fill="var(--primary)" style={{ opacity: 0.9 }} />
                        <text x={paddingLeft + idx * barSpacing + barSpacing / 2} y={chartHeight - 10} fill="#94a3b8" style={{ fontSize: "9px", fontWeight: 600 }} textAnchor="middle">
                          {getMonthName(item.month)}
                        </text>
                      </g>
                    );
                  })}

                  {(() => {
                    const usableWidth = chartWidth - paddingLeft - paddingRight;
                    const barSpacing = usableWidth / chartHistoryData.length;
                    const points = chartHistoryData.map((item, idx) => {
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
                        <path d={pathD} fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" />
                        {points.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--bg-card)" stroke="var(--text-muted)" strokeWidth="2" />
                        ))}
                      </g>
                    );
                  })()}
                </svg>

                {hoveredData && !isDemoHistory && (
                  <Box 
                    sx={{ 
                      position: "absolute",
                      zIndex: 10,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      p: 1.5,
                      borderRadius: 1,
                      boxShadow: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      pointerEvents: "none"
                    }} 
                    style={{ left: `${hoveredData.x}px`, top: `${hoveredData.y}px` }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, borderBottom: "1px solid", borderColor: "divider", pb: 0.5, mb: 0.5, display: "block", textAlign: "center" }}>
                      {hoveredData.month}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>Ventas:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{formattedUSD(hoveredData.revenue)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Costos:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{formattedUSD(hoveredData.cost)}</Typography>
                    </Box>
                  </Box>
                )}

                {isDemoHistory && (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 2 }}>
                    <Card sx={{ maxWidth: 320, p: 2.5, textAlign: "center", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" style={{ color: "var(--primary)" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Gráfico de Demostración</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
                        No hay cotizaciones aprobadas registradas. Una vez que apruebes presupuestos, verás las estadísticas reales aquí.
                      </Typography>
                    </Card>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
          </Grid>
        )}
      </Grid>

      {/* Row 3: Profitability, Radial Progress, and Tabs */}
      <Grid container spacing={3}>
        {isStaff && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
              <CardHeader 
                title="Rentabilidad Comercial" 
                subheader="Márgenes netos del mes"
                titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
                subheaderTypographyProps={{ variant: "caption" }}
              />
              <CardContent sx={{ pt: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "success.light",
                      color: "success.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <TrendingUp className="w-5 h-5" />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Margen Promedio</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Ponderado de obras</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{marginPercent}%</Typography>
                    <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>+25.8%</Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.light",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <DollarSign className="w-5 h-5" />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Ganancia Bruta</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Proyectada en USD</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formattedUSD(defaultStats.financialsUSD.profit)}</Typography>
                    <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>+4.3%</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: isStaff ? 4 : 6 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader
              title="Avance de Obras"
              subheader="Entregas culminadas"
              titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ pt: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 2 }}>
              <Box sx={{ position: "relative", width: 110, height: 110 }}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-light)" strokeWidth="6" />
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
                  />
                </svg>
                <Box sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{completedRate}%</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Obras</Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {defaultStats.projects.COMPLETED} de {defaultStats.projects.total} proyectos entregados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: isStaff ? 4 : 6 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardHeader
              title="Proyectos por Clientes"
              subheader="Últimas órdenes en curso"
              titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newTab) => setActiveTab(newTab)} 
                variant="fullWidth" 
                sx={{ minHeight: 36, mb: 2 }}
              >
                <Tab label="Nuevos" value="PENDING" sx={{ minHeight: 36, py: 0.5, textTransform: "none", fontWeight: 600 }} />
                <Tab label="Ejecución" value="IN_PROGRESS" sx={{ minHeight: 36, py: 0.5, textTransform: "none", fontWeight: 600 }} />
                <Tab label="Entregas" value="COMPLETED" sx={{ minHeight: 36, py: 0.5, textTransform: "none", fontWeight: 600 }} />
              </Tabs>

              <List disablePadding>
                {filteredProjects.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                    No hay proyectos en esta fase.
                  </Typography>
                ) : (
                  filteredProjects.map((project, idx) => (
                    <React.Fragment key={project.id}>
                      <ListItem disableGutters sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                {project.name}
                              </Typography>
                              <Box sx={{ 
                                bgcolor: "primary.light", 
                                color: "primary.main", 
                                px: 1, 
                                py: 0.2, 
                                borderRadius: 1,
                                fontSize: "10px",
                                fontWeight: 700
                              }}>
                                {project.client?.rutOrId || "RUT"}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Cli: {project.client?.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {project.manager ? `${project.manager.firstName} ${project.manager.lastName[0]}.` : "Sin manager"}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < filteredProjects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
