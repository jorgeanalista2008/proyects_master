'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '@/context/ConfigContext';
import { api } from '../../lib/api';
import { 
  Home, 
  Folder, 
  Package, 
  Users, 
  Wrench, 
  BookOpen, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';

const iconMap: { [key: string]: React.ComponentType<any> } = {
  '📊': Home,
  '📁': Folder,
  '📦': Package,
  '👥': Users,
  '🛠️': Wrench,
  '📚': BookOpen,
  '⚙️': Settings,
};

function getIcon(iconStr: string) {
  const IconComponent = iconMap[iconStr] || Folder;
  return <IconComponent className="w-5 h-5 flex-shrink-0" />;
}

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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load dynamic menus from backend
  useEffect(() => {
    async function fetchMenu() {
      try {
        setMenuLoading(true);
        const data = await api.get<any[]>('/roles/my-menu');
        setMenuItems(data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        // Fallback menu list
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-sm text-slate-400 font-medium">Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayAppName = config?.appName || 'SecurityNet';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      {/* Sidebar for Desktop */}
      <aside 
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-slate-800 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            {sidebarExpanded && (
              <span className="font-bold text-slate-100 text-sm tracking-wide whitespace-nowrap">
                {displayAppName}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            {sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            </div>
          ) : (
            menuItems.map((link) => {
              const isActive = pathname === link.route || (link.route !== '/' && pathname.startsWith(link.route));
              return (
                <Link
                  key={link.route}
                  href={link.route}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                  title={!sidebarExpanded ? link.label : undefined}
                >
                  {getIcon(link.icon)}
                  {sidebarExpanded && <span className="whitespace-nowrap">{link.label}</span>}
                </Link>
              );
            })
          )}
        </nav>

        {/* Footer Section */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all ${
              sidebarExpanded ? '' : 'justify-center'
            }`}
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
            {sidebarExpanded && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-50 md:hidden transition-transform duration-300 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold text-slate-100 text-sm tracking-wide">
              {displayAppName}
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((link) => {
            const isActive = pathname === link.route || (link.route !== '/' && pathname.startsWith(link.route));
            return (
              <Link
                key={link.route}
                href={link.route}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                {getIcon(link.icon)}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarExpanded ? 'md:pl-64' : 'md:pl-16'
        }`}
      >
        {/* Top Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Plataforma</span>
              <span>/</span>
              <span className="text-slate-300">
                {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all"
              title="Alternar tema claro/oscuro"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile badge */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md shadow-amber-500/10">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Dev Environment Indicator */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 z-40 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 shadow-xl flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Local Dev Mode</span>
        </div>
      )}
    </div>
  );
}
