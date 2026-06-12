'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  // Links de navegación según el rol
  const navLinks = [
    { href: '/', label: 'Inicio', icon: '📊', roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CLIENT'] },
    { href: '/projects', label: 'Proyectos', icon: '📁', roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CLIENT'] },
    { href: '/catalog', label: 'Catálogo e Inventario', icon: '📦', roles: ['ADMIN', 'SELLER', 'TECHNICIAN'] },
    { href: '/clients', label: 'Clientes', icon: '👥', roles: ['ADMIN', 'SELLER'] },
    { href: '/analytics', label: 'Analíticas y Margen', icon: '📈', roles: ['ADMIN', 'SELLER'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user.role));

  return (
    <div className="dashboard-container">
      {/* Sidebar para desktop */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>SecurityNet</h2>
          <span className="logo-badge">Tech Lead</span>
        </div>
        <nav className="sidebar-nav">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
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
        <header className="dashboard-header">
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
          <div className="header-user-profile">
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
