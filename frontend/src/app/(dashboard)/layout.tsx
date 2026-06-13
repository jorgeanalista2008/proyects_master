'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '@/context/ConfigContext';
import { api } from '../../lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const { config, theme, toggleTheme } = useConfig();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Cargar menús dinámicos desde el backend
  useEffect(() => {
    async function fetchMenu() {
      try {
        setMenuLoading(true);
        const data = await api.get<any[]>('/roles/my-menu');
        setMenuItems(data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        // Fallback en caso de error
        setMenuItems([
          { label: 'Inicio', route: '/', icon: '📊' },
          { label: 'Proyectos', route: '/projects', icon: '📁' },
          { label: 'Catálogo e Inventario', route: '/catalog', icon: '📦' },
          { label: 'Clientes', route: '/clients', icon: '👥' },
          { label: 'Técnicos', route: '/technicians', icon: '🛠️' },
          { label: 'Documentación', route: '/documentation', icon: '📚' },
        ]);
      } finally {
        setMenuLoading(false);
      }
    }
    if (user) {
      fetchMenu();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayAppName = config?.appName || 'SecurityNet';

  return (
    <div className="dashboard-container">
      {/* Sidebar para desktop */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>{displayAppName}</h2>
          <span className="logo-badge">{user.role}</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((link) => {
            const isActive = pathname === link.route || (link.route !== '/' && pathname.startsWith(link.route));
            return (
              <Link
                key={link.route}
                href={link.route}
                onClick={() => setMobileMenuOpen(false)}
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="btn btn-danger btn-block logout-btn">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          <div className="header-breadcrumbs">
            <span className="breadcrumb-parent">Plataforma</span> /{' '}
            <span className="breadcrumb-current">
              {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]}
            </span>
          </div>

          {/* Theme Switcher and User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <button
              onClick={toggleTheme}
              style={{
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                border: '1px solid hsl(var(--border-glass))',
                background: 'hsla(var(--bg-secondary), 0.5)',
                cursor: 'pointer',
                padding: 0
              }}
              title="Alternar tema claro/oscuro"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="header-user-profile" style={{ marginLeft: 0 }}>
              <div className="user-info">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-role-badge" data-role={user.role}>
                  {user.role}
                </span>
              </div>
              <div className="user-avatar">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-main-content">
          <div className="glass-panel-content">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para móviles */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Indicador de entorno de desarrollo */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="dev-environment-badge">
          🛠️ Modo Local (Desarrollo)
        </div>
      )}
    </div>
  );
}
