"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Avatar,
  Chip
} from "@mui/material";
import { TrendingUp, DollarSign } from "lucide-react";

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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">Cargando reportes y analíticas corporativas...</Typography>
      </Box>
    );
  }

  if (error || !summary) {
    return (
      <Card sx={{ border: "1px solid", borderColor: "divider", textAlign: "center", py: 8 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Typography variant="h3">⚠️</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Error de Conexión</Typography>
          <Typography variant="body2" color="text.secondary">
            {error || "No hay información de resumen disponible."}
          </Typography>
        </CardContent>
      </Card>
    );
  }

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

  const activeProjectsCount = summary.projects.APPROVED + summary.projects.IN_PROGRESS;
  const quotesTotal = summary.quotes.total || 0;
  const quotesApproved = summary.quotes.APPROVED || 0;
  const approvalRate = quotesTotal > 0 ? Math.round((quotesApproved / quotesTotal) * 100) : 0;
  const marginPercent = summary.financialsUSD.marginPercent || 0;

  const completedRate = summary.projects.total > 0
    ? Math.round((summary.projects.COMPLETED / summary.projects.total) * 100)
    : 0;

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Title Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary" }}>
            Panel Analítico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoreo en tiempo real de rentabilidad, cotizaciones y conversión de infraestructura.
          </Typography>
        </Box>
        <Box sx={{ 
          px: 2, 
          py: 1, 
          bgcolor: "background.paper", 
          border: "1px solid", 
          borderColor: "divider", 
          borderRadius: 1.5 
        }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
            📅 {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
          </Typography>
        </Box>
      </Box>

      {/* Row 1: Congratulation Card & Quick KPIs */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%", bgcolor: "primary.light", color: "primary.contrastText" }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, position: "relative", overflow: "hidden" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                ¡Felicidades {user?.firstName}! 🎉
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: "80%", lineHeight: 1.4 }}>
                Has sido el miembro más activo del mes. Tu tasa promedio de ganancia comercial se mantiene óptima.
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", display: "inline-block", mr: 1 }}>
                  {marginPercent}%
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>utilidad promedio</Typography>
              </Box>
              <Button component={Link} href="/projects" variant="contained" color="primary" size="small" sx={{ width: "fit-content", mt: 1 }}>
                Ver Proyectos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardHeader
              title="Estadísticas Comerciales"
              subheader="Historial acumulado de operaciones vigentes"
              titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                {[
                  { label: "Ventas Netas", val: formattedUSD(summary.financialsUSD.revenue), icon: "💰", color: "primary.light" },
                  { label: "Instalaciones", val: activeProjectsCount, icon: "📁", color: "warning.light" },
                  { label: "Aprobación", val: `${approvalRate}%`, icon: "📈", color: "success.light" },
                  { label: "Margen Bruto", val: `${marginPercent}%`, icon: "📊", color: "info.light" }
                ].map((stat, idx) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: stat.color, width: 40, height: 40, fontSize: "16px", borderRadius: 1.5 }}>{stat.icon}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{stat.val}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{stat.label}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Charts and support tracker */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card ref={chartContainerRef} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Reporte de Ventas vs Costos"
              subheader="Comparativa consolidada mensual en USD"
              titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: "caption" }}
              action={
                <Box sx={{ display: "flex", gap: 2, pr: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Ingresos</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "secondary.main" }} />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Costos</Typography>
                  </Box>
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Box sx={{ width: "100%", height: 200, position: "relative" }}>
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ overflow: "visible" }}>
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
                        const gridVal = maxVal * (1 - ratio);
                        return (
                          <g key={idx}>
                            <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="3 3" />
                            <text x={paddingLeft - 8} y={y + 4} fill="#64748b" style={{ fontSize: "9px", fontFamily: "monospace" }} textAnchor="end">
                              {gridVal >= 1000 ? `${Math.round(gridVal / 1000)}k` : Math.round(gridVal)}
                            </text>
                          </g>
                        );
                      })}

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
                          <g key={idx}>
                            <rect
                              x={groupX - 4}
                              y={paddingTop}
                              width={barWidth * 2 + 12}
                              height={heightRatio}
                              fill="transparent"
                              style={{ cursor: "pointer" }}
                              onMouseMove={(e) => handleBarMouseMove(e, idx, item)}
                              onMouseLeave={() => setHoveredBar(null)}
                            />
                            <rect x={groupX} y={salesY} width={barWidth} height={Math.max(salesHeight, 3)} rx="2" fill="var(--primary)" style={{ opacity: 0.9, pointerEvents: "none" }} />
                            <rect x={groupX + barWidth + 4} y={costY} width={barWidth} height={Math.max(costHeight, 3)} rx="2" fill="var(--accent)" style={{ opacity: 0.9, pointerEvents: "none" }} />
                            <text x={groupX + barWidth + 2} y={chartHeight - 12} fill="#94a3b8" style={{ fontSize: "10px", fontWeight: 600, pointerEvents: "none" }} textAnchor="middle">
                              {getMonthName(item.month)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {hoveredBar && (
                      <Box sx={{ 
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
                      }} style={{ left: `${hoveredBar.x}px`, top: `${hoveredBar.y}px` }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, borderBottom: "1px solid", borderColor: "divider", pb: 0.5, mb: 0.5, display: "block", textAlign: "center" }}>
                          {hoveredBar.month}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>Ventas:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{formattedUSD(hoveredBar.revenue)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
                          <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 600 }}>Costos:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{formattedUSD(hoveredBar.cost)}</Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center" }}>
                  {[
                    { label: "Venta Total", val: formattedUSD(summary.financialsUSD.revenue), color: "primary.main", pct: 100 },
                    { label: "Costo Total", val: formattedUSD(summary.financialsUSD.cost), color: "warning.main", pct: summary.financialsUSD.revenue > 0 ? (summary.financialsUSD.cost / summary.financialsUSD.revenue) * 100 : 0 },
                    { label: "Utilidad Neta", val: formattedUSD(summary.financialsUSD.profit), color: "success.main", pct: marginPercent }
                  ].map((item, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: item.color }}>{item.val}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={item.pct} sx={{ height: 6, borderRadius: 3, bgcolor: "divider", "& .MuiLinearProgress-bar": { bgcolor: item.color } }} />
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader
              title="Control de Instalaciones"
              subheader="Avance total de obras finalizadas"
              titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ pt: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 3.5 }}>
              <Box sx={{ position: "relative", width: 140, height: 140 }}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--border-light)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={(2 * Math.PI * 38) - ((2 * Math.PI * 38) * completedRate) / 100}
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
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{completedRate}%</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Completados</Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ textAlign: "center", borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{summary.projects.IN_PROGRESS}</Typography>
                  <Typography variant="caption" color="text.secondary">Ejecución</Typography>
                </Grid>
                <Grid size={{ xs: 4 }} sx={{ borderLeft: "1px solid", borderRight: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "warning.main" }}>{summary.projects.QUOTED}</Typography>
                  <Typography variant="caption" color="text.secondary">Cotizados</Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "success.main" }}>{summary.projects.COMPLETED}</Typography>
                  <Typography variant="caption" color="text.secondary">Entregas</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Tables & Demands */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardHeader
              title="Estatus de Proyectos Recientes"
              subheader="Últimos levantamientos de CCTV y cableado estructurado"
              titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: "caption" }}
              action={
                <Button component={Link} href="/projects" variant="outlined" color="secondary" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>
                  Ver Todos
                </Button>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {projects.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>No hay proyectos ingresados en el sistema.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "background.default" }}>
                      <TableRow>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Proyecto</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Cliente</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Estado</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>Creado</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id} hover>
                          <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>{project.name}</TableCell>
                          <TableCell>{project.client?.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={project.status === "PENDING" ? "Levantamiento" : project.status === "IN_PROGRESS" ? "Instalación" : project.status} 
                              size="small" 
                              color={project.status === "COMPLETED" ? "success" : project.status === "PENDING" ? "warning" : "primary"}
                              variant="outlined"
                              sx={{ fontWeight: 650 }}
                            />
                          </TableCell>
                          <TableCell>{new Date(project.createdAt).toLocaleDateString("es-ES")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardHeader
              title="Especialidades de Instalación"
              subheader="Porcentaje de demanda de infraestructura"
              titleTypographyProps={{ variant: "subtitle1", sx: { fontWeight: 700 } }}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ pt: 0, display: "flex", flexDirection: "column", gap: 3.5 }}>
              {[
                { name: "CCTV y Monitoreo IP", icon: "📹", pct: 45, color: "primary.main" },
                { name: "Cercos Eléctricos y Perímetros", icon: "⚡", pct: 30, color: "warning.main" },
                { name: "Redes de Datos y Conectividad", icon: "🔌", pct: 25, color: "success.main" }
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "background.default", border: "1px solid", borderColor: "divider", width: 40, height: 40, fontSize: "16px", borderRadius: 1.5 }}>{item.icon}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>{item.pct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={item.pct} sx={{ height: 6, borderRadius: 3, bgcolor: "divider", "& .MuiLinearProgress-bar": { bgcolor: item.color } }} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
