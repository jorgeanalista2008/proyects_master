'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

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
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Si el usuario es ADMIN o SELLER, puede ver las analíticas completas
        if (user && (user.role === 'ADMIN' || user.role === 'SELLER')) {
          const statsRes = await api.get('/analytics/summary');
          setStats(statsRes.data);
        }

        // Obtener proyectos recientes para todos los roles
        const projectsRes = await api.get('/projects');
        // Ordenar por fecha y tomar los 5 más recientes
        const sorted = projectsRes.data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentProjects(sorted);
      } catch (err: any) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudo cargar la información del panel principal.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return <div className="loading-spinner-panel">Cargando información del panel...</div>;
  }

  const isPowerUser = user && (user.role === 'ADMIN' || user.role === 'SELLER');

  return (
    <div className="dashboard-page-content">
      <div className="welcome-banner">
        <div>
          <h1>¡Hola, {user?.firstName}! 👋</h1>
          <p className="welcome-subtitle">
            {isPowerUser 
              ? 'Aquí tienes un resumen de la rentabilidad, proyectos y presupuestos actuales.'
              : 'Aquí puedes revisar el estado de tus proyectos e instalaciones de seguridad.'}
          </p>
        </div>
        <div className="date-badge">
          📅 {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tarjetas financieras y de KPIs (Solo para ADMIN y SELLER) */}
      {isPowerUser && stats && (
        <section className="kpi-grid">
          <div className="kpi-card financial-card revenue">
            <div className="kpi-icon">💰</div>
            <div className="kpi-data">
              <span className="kpi-label">Ingresos Consolidados (USD)</span>
              <h2 className="kpi-value">${stats.financialsUSD.revenue.toLocaleString()}</h2>
              <span className="kpi-subtext">Venta neta acumulada aprobada</span>
            </div>
          </div>

          <div className="kpi-card financial-card cost">
            <div className="kpi-icon">📉</div>
            <div className="kpi-data">
              <span className="kpi-label">Costos Totales (USD)</span>
              <h2 className="kpi-value">${stats.financialsUSD.cost.toLocaleString()}</h2>
              <span className="kpi-subtext">Costo total de equipos y mano de obra</span>
            </div>
          </div>

          <div className="kpi-card financial-card profit">
            <div className="kpi-icon">📈</div>
            <div className="kpi-data">
              <span className="kpi-label">Ganancia Bruta Proyectada</span>
              <h2 className="kpi-value">${stats.financialsUSD.profit.toLocaleString()}</h2>
              <span className="kpi-subtext">Rentabilidad: <strong>{stats.financialsUSD.marginPercent}%</strong></span>
            </div>
          </div>

          <div className="kpi-card stats-card font-glow">
            <div className="kpi-icon">📁</div>
            <div className="kpi-data">
              <span className="kpi-label">Proyectos Aprobados</span>
              <h2 className="kpi-value">{stats.projects.APPROVED + stats.projects.IN_PROGRESS} / {stats.projects.total}</h2>
              <span className="kpi-subtext">
                Pendientes: {stats.projects.PENDING} | Cotizados: {stats.projects.QUOTED}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Para técnicos o clientes, mostrar resumen simple de proyectos */}
      {!isPowerUser && (
        <section className="simple-stats-grid">
          <div className="kpi-card border-left-blue">
            <h3>Proyectos Totales</h3>
            <span className="huge-number">{recentProjects.length}</span>
          </div>
          <div className="kpi-card border-left-yellow">
            <h3>En Curso</h3>
            <span className="huge-number">
              {recentProjects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PENDING').length}
            </span>
          </div>
          <div className="kpi-card border-left-green">
            <h3>Completados</h3>
            <span className="huge-number">
              {recentProjects.filter(p => p.status === 'COMPLETED').length}
            </span>
          </div>
        </section>
      )}

      <div className="dashboard-lists-row">
        {/* Proyectos Recientes */}
        <div className="dashboard-list-card flex-2">
          <div className="card-header-flex">
            <h2>Proyectos Recientes</h2>
            {isPowerUser && (
              <Link href="/projects" className="btn btn-primary btn-sm">
                + Nuevo Proyecto
              </Link>
            )}
          </div>
          
          {recentProjects.length === 0 ? (
            <p className="empty-text">No hay proyectos registrados en este momento.</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Creado el</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="font-weight-medium">{project.name}</td>
                      <td>{project.client?.name}</td>
                      <td>
                        <span className={`status-badge status-${project.status.toLowerCase()}`}>
                          {project.status === 'PENDING' && 'Levantamiento'}
                          {project.status === 'QUOTED' && 'Cotizado'}
                          {project.status === 'APPROVED' && 'Aprobado'}
                          {project.status === 'IN_PROGRESS' && 'Instalación'}
                          {project.status === 'COMPLETED' && 'Completado'}
                          {project.status === 'CANCELLED' && 'Cancelado'}
                        </span>
                      </td>
                      <td>{new Date(project.createdAt).toLocaleDateString('es-ES')}</td>
                      <td>
                        <Link href={`/projects/${project.id}`} className="link-action">
                          Ver Detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Acceso Rápido */}
        <div className="dashboard-list-card flex-1">
          <h2>Acciones Rápidas</h2>
          <div className="quick-actions-list">
            <Link href="/projects" className="quick-action-button">
              <span className="action-icon">📁</span>
              <div className="action-details">
                <strong>Ver Tablero de Proyectos</strong>
                <p>Ver levantamientos y estados de instalación</p>
              </div>
            </Link>
            {isPowerUser && (
              <>
                <Link href="/catalog" className="quick-action-button">
                  <span className="action-icon">📦</span>
                  <div className="action-details">
                    <strong>Administrar Catálogo</strong>
                    <p>Agregar cámaras, sensores o mano de obra</p>
                  </div>
                </Link>
                <Link href="/analytics" className="quick-action-button">
                  <span className="action-icon">📊</span>
                  <div className="action-details">
                    <strong>Reportes Financieros</strong>
                    <p>Revisar costos vs. rentabilidad consolidada</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
