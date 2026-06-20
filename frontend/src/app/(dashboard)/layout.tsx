'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '@/context/ConfigContext';
import { api } from '../../lib/api';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography, 
  IconButton, 
  Avatar, 
  AppBar, 
  Toolbar,
  CircularProgress,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Button
} from '@mui/material';
import { 
  ShieldAlert, 
  LogOut, 
  LayoutDashboard, 
  Briefcase, 
  Database, 
  Users, 
  Sun, 
  Moon, 
  Wrench,
  TrendingUp,
  Settings as SettingsIcon,
  BookOpen,
  Key,
  Bell,
  Wallet
} from 'lucide-react';

import { Icon } from '@iconify/react';

const DRAWER_WIDTH = 260;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { config, theme, toggleTheme } = useConfig();
  const router = useRouter();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const data = await api.get<any[]>('/roles/my-menu');
        setMenuItems(data);
      } catch (err) {
        setMenuItems([
          { label: 'Inicio', route: '/', icon: 'mdi:home-outline' },
          { label: 'Proyectos', route: '/projects', icon: 'mdi:briefcase-outline' },
          { label: 'Catálogo', route: '/catalog', icon: 'mdi:archive-outline' },
          { label: 'Clientes', route: '/clients', icon: 'mdi:account-group-outline' },
          { label: 'Proveedores', route: '/suppliers', icon: 'mdi:truck-delivery-outline' },
          { label: 'Soporte Técnico', route: '/equipments', icon: 'mdi:laptop-wrench' },
          { label: 'Técnicos', route: '/technicians', icon: 'mdi:account-wrench-outline' },
        ]);
      }
    }
    if (user) fetchMenu();
  }, [user]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const data = await api.get<any[]>('/equipments/alerts/my-alerts');
        setAlerts(data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    }

    if (user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/equipments/alerts/read-all', {});
      setAlerts([]);
      handleCloseNotifications();
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  };

  const handleMarkOneRead = async (alertId: string, equipmentId: string) => {
    try {
      await api.patch(`/equipments/alerts/${alertId}/read`, {});
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      handleCloseNotifications();
      router.push(`/equipments/${equipmentId}`);
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifycontent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const getIcon = (iconName: string) => {
    // Treat raw names as mdi icons if no prefix is set
    const finalIcon = iconName.includes(':') ? iconName : `mdi:${iconName}`;
    return <Icon icon={finalIcon} width="22" height="22" />;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo Section */}
        <Box sx={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          px: 2.5, 
          gap: 1.5, 
          borderBottom: '1px solid', 
          borderColor: 'divider' 
        }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'primary.main', 
            borderRadius: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 4px 0 rgba(115, 103, 240, 0.4)'
          }}>
            <ShieldAlert className="w-5 h-5 text-white" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.3px' }}>
            {config?.appName || 'SentinelFlow'}
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ flex: 1, px: 2, py: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <ListItem key={item.route} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.route}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    px: 2,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    boxShadow: isActive ? '0 4px 8px 0 rgba(115, 103, 240, 0.3)' : 'none',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.main' : 'rgba(115, 103, 240, 0.08)',
                      color: isActive ? 'primary.contrastText' : 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: isActive ? 'primary.contrastText' : 'primary.main',
                      }
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 32, 
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    transition: 'color 0.2s ease',
                  }}>
                    {getIcon(item.icon)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>
                        {item.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Sidebar Footer Logout Button */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 1.5,
              py: 1,
              px: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'rgba(234, 84, 85, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
              <LogOut className="w-5 h-5" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                  Cerrar Sesión
                </Typography>
              } 
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Header App Bar */}
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 650, color: 'text.primary' }}>
              Panel General
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </IconButton>

              {/* Campana de Notificaciones */}
              <IconButton onClick={handleOpenNotifications} sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={alerts.length} color="error">
                  <Bell className="w-5 h-5" />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={anchorElNotifications}
                open={Boolean(anchorElNotifications)}
                onClose={handleCloseNotifications}
                slotProps={{
                  paper: {
                    sx: {
                      width: 320,
                      maxHeight: 400,
                      mt: 1.5,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                      borderRadius: 2,
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Notificaciones ({alerts.length})
                  </Typography>
                  {alerts.length > 0 && (
                    <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '12px', textTransform: 'none' }}>
                      Marcar todo leído
                    </Button>
                  )}
                </Box>
                <Divider />
                {alerts.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No tienes notificaciones pendientes.
                    </Typography>
                  </Box>
                ) : (
                  alerts.map((alert: any) => (
                    <MenuItem
                      key={alert.id}
                      onClick={() => handleMarkOneRead(alert.id, alert.equipmentReceiptId)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        whiteSpace: 'normal',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 0 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(alert.createdAt).toLocaleString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </Menu>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.light', 
                  color: 'primary.main', 
                  fontSize: '14px', 
                  fontWeight: 700 
                }}>
                  {user.firstName[0]}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Container */}
        <Box component="main" sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
