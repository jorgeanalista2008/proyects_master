// d:\github\proyects_master\frontend\src\app\(dashboard)\roles\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { Icon } from "@iconify/react";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: { permission: { id: string; name: string } }[];
  menus: { menuItem: { id: string; route: string; label: string } }[];
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface MenuItemData {
  id: string;
  label: string;
  route: string;
  icon: string;
  order: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
}

export default function AdministrationPage() {
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "menus">("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [menus, setMenus] = useState<MenuItemData[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / Form states
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemData | null>(null);
  const [menuLabel, setMenuLabel] = useState("");
  const [menuRoute, setMenuRoute] = useState("");
  const [menuIcon, setMenuIcon] = useState("");
  const [menuOrder, setMenuOrder] = useState<number>(0);

  // Icon Selector states
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [iconSearchResults, setIconSearchResults] = useState<string[]>([]);
  const [iconSearching, setIconSearching] = useState(false);

  const POPULAR_ICONS = [
    "mdi:view-dashboard", "mdi:view-dashboard-outline",
    "mdi:briefcase", "mdi:briefcase-outline",
    "mdi:account-group", "mdi:account-group-outline",
    "mdi:account-wrench", "mdi:account-wrench-outline",
    "mdi:cctv", "mdi:shield-key", "mdi:shield-key-outline",
    "mdi:settings", "mdi:settings-outline",
    "mdi:database", "mdi:database-outline",
    "mdi:archive", "mdi:archive-outline",
    "mdi:chart-bar", "mdi:chart-line",
    "mdi:currency-usd", "mdi:wallet",
    "mdi:bell", "mdi:bell-outline",
    "mdi:book-open", "mdi:book-open-outline",
    "mdi:key", "mdi:key-outline",
    "mdi:home", "mdi:home-outline",
    "mdi:email", "mdi:email-outline",
    "mdi:phone", "mdi:wrench",
    "mdi:cog", "mdi:alert-circle",
    "mdi:check-circle", "mdi:clock-outline",
    "mdi:file-document", "mdi:file-document-outline"
  ];

  const handleSearchIcons = async (query: string) => {
    if (!query.trim()) {
      setIconSearchResults([]);
      return;
    }
    setIconSearching(true);
    try {
      const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=mdi&limit=60`);
      if (res.ok) {
        const data = await res.json();
        setIconSearchResults(data.icons || []);
      }
    } catch (err) {
      console.error("Error searching icons:", err);
    } finally {
      setIconSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (iconSearchQuery) {
        handleSearchIcons(iconSearchQuery);
      } else {
        setIconSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [iconSearchQuery]);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [usersData, rolesData, permissionsData, menusData] = await Promise.all([
        api.get<User[]>("/users"),
        api.get<Role[]>("/roles"),
        api.get<Permission[]>("/roles/permissions"),
        api.get<MenuItemData[]>("/roles/menus"),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setMenus(menusData);
    } catch (err: any) {
      console.error(err);
      setError("Error al cargar la información de administración.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchData();
    }
  }, [currentUser]);

  // Deny access if not admin
  if (currentUser && currentUser.role !== "ADMIN") {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
        <Card sx={{ bgcolor: "var(--bg-card)", border: "1px solid var(--border-light)", p: 4, borderRadius: "6px", textAlign: "center" }}>
          <Typography variant="h5" sx={{ color: "#ea5455", fontWeight: 600, mb: 2 }}>
            Acceso Denegado
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
            Solo los administradores del sistema pueden gestionar usuarios, perfiles y permisos.
          </Typography>
        </Card>
      </Box>
    );
  }

  // --- ACTIONS: USERS ---
  const handleUserRoleChange = async (userId: string, newRoleName: string) => {
    try {
      setError("");
      setSuccess("");
      await api.patch(`/users/${userId}`, { roleName: newRoleName });
      setSuccess("Rol de usuario actualizado con éxito.");
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al actualizar el rol de usuario.");
    }
  };

  // --- ACTIONS: ROLES ---
  const handleOpenRoleModal = (role: Role | null = null) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description || "");
      setSelectedPermissions(role.permissions.map((rp) => rp.permission.id));
      setSelectedMenus(role.menus.map((rm) => rm.menuItem.id));
    } else {
      setEditingRole(null);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
      setSelectedMenus([]);
    }
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    try {
      setError("");
      setSuccess("");
      const payload = {
        name: roleName.toUpperCase(),
        description: roleDescription,
        permissions: selectedPermissions,
        menus: selectedMenus,
      };

      if (editingRole) {
        await api.patch(`/roles/${editingRole.id}`, payload);
        setSuccess(`Perfil "${roleName}" actualizado con éxito.`);
      } else {
        await api.post("/roles", payload);
        setSuccess(`Perfil "${roleName}" creado con éxito.`);
      }

      setRoleModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al guardar el perfil.");
    }
  };

  const handleDeleteRole = async (roleId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el perfil "${name}"? Esta acción borrará todas las asociaciones.`)) return;

    try {
      setError("");
      setSuccess("");
      await api.delete(`/roles/${roleId}`);
      setSuccess(`Perfil "${name}" eliminado con éxito.`);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al eliminar el perfil.");
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleMenuSelection = (id: string) => {
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // --- ACTIONS: MENUS ---
  const handleOpenMenuModal = (menu: MenuItemData | null = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuLabel(menu.label);
      setMenuRoute(menu.route);
      setMenuIcon(menu.icon);
      setMenuOrder(menu.order);
    } else {
      setEditingMenu(null);
      setMenuLabel("");
      setMenuRoute("");
      setMenuIcon("");
      setMenuOrder(menus.length + 1);
    }
    setMenuModalOpen(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuLabel || !menuRoute || !menuIcon) return;

    try {
      setError("");
      setSuccess("");
      const payload = {
        label: menuLabel,
        route: menuRoute,
        icon: menuIcon,
        order: Number(menuOrder),
      };

      if (editingMenu) {
        await api.patch(`/roles/menus/${editingMenu.id}`, payload);
        setSuccess(`Menú "${menuLabel}" actualizado con éxito.`);
      } else {
        await api.post("/roles/menus", payload);
        setSuccess(`Menú "${menuLabel}" creado con éxito.`);
      }

      setMenuModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al guardar el menú.");
    }
  };

  const handleDeleteMenu = async (menuId: string, label: string) => {
    if (!confirm(`¿Estás seguro de eliminar el menú "${label}"?`)) return;

    try {
      setError("");
      setSuccess("");
      await api.delete(`/roles/menus/${menuId}`);
      setSuccess(`Menú "${label}" eliminado con éxito.`);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al eliminar el menú.");
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
      "& fieldset": { borderColor: "var(--border-light)" },
      "&.Mui-focused fieldset": { borderColor: "var(--primary)" }
    },
    "& .MuiInputLabel-root": { color: "var(--text-muted)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
    "& .MuiInputBase-input": { color: "var(--text-main)" }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 650, color: "var(--text-main)", mb: 0.5 }}>
          Administración del Sistema
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
          Gestiona los usuarios de la plataforma, crea perfiles (roles) personalizados, asigna permisos del sistema y configura menús dinámicos.
        </Typography>
      </Box>

      {/* Notifications */}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "6px" }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "6px" }}>{success}</Alert>}

      {/* Tabs Layout */}
      <Box sx={{ borderBottom: 1, borderColor: "var(--border-light)", mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, val) => { setActiveTab(val); setSearchQuery(""); }}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem", px: 3 },
            "& .Mui-selected": { color: "var(--primary) !important" },
            "& .MuiTabs-indicator": { bgcolor: "var(--primary)" }
          }}
        >
          <Tab label="👥 Usuarios y Roles" value="users" />
          <Tab label="🔑 Perfiles y Permisos" value="roles" />
          <Tab label="📂 Menús de Navegación" value="menus" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
          <CircularProgress size={40} sx={{ color: "var(--primary)" }} />
          <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>Cargando datos del sistema...</Typography>
        </Box>
      ) : (
        <Box>
          {/* TAB 1: USERS */}
          {activeTab === "users" && (
            <Box>
              <Box sx={{ mb: 3, maxWidth: 450 }}>
                <TextField
                  fullWidth
                  placeholder="Buscar usuario por nombre o correo electrónico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={fieldStyle}
                />
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "6px", borderColor: "var(--border-light)", bgcolor: "var(--bg-card)" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "rgba(115, 103, 240, 0.02)" }}>
                    <TableRow>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Usuario</TableCell>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Estado</TableCell>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Asignar Perfil / Rol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} sx={{ opacity: u.isActive ? 1 : 0.6 }}>
                        <TableCell sx={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell sx={{ color: "var(--text-main)" }}>{u.email}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            bgcolor: u.isActive ? "rgba(40, 199, 111, 0.15)" : "rgba(234, 84, 85, 0.15)",
                            color: u.isActive ? "#28c76f" : "#ea5455"
                          }}>
                            {u.isActive ? "Activo" : "Inactivo"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ width: 200, ...fieldStyle }}>
                            <Select
                              value={u.role.name}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                              disabled={u.email === "admin@securitysystem.com"}
                              sx={{ borderRadius: "6px" }}
                            >
                              {roles.map((r) => (
                                <MenuItem key={r.id} value={r.name}>
                                  {r.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === "roles" && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleOpenRoleModal()}
                  sx={{ 
                    textTransform: "none", 
                    borderRadius: "6px", 
                    bgcolor: "var(--primary)",
                    "&:hover": { bgcolor: "var(--primary-hover)" }
                  }}
                >
                  ➕ Crear Perfil Personalizado
                </Button>
              </Box>

              <Grid container spacing={3}>
                {roles.map((r) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={r.id}>
                    <Card sx={{ 
                      bgcolor: "var(--bg-card)", 
                      borderRadius: "6px", 
                      border: "1px solid var(--border-light)", 
                      boxShadow: "var(--shadow-sm)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--primary)" }}>
                            {r.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "var(--text-muted)", fontWeight: 500 }}>
                            {r.permissions.length} permisos
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: "var(--text-muted)", minHeight: 48, mb: 3 }}>
                          {r.description || "Sin descripción de perfil."}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", mb: 1 }}>
                            Accesos de Menú
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {r.menus.map((rm) => (
                              <Box 
                                key={rm.menuItem.id} 
                                sx={{
                                  fontSize: "0.7rem",
                                  px: 1,
                                  py: 0.3,
                                  borderRadius: "4px",
                                  bgcolor: "rgba(115, 103, 240, 0.08)",
                                  color: "var(--primary)",
                                  border: "1px solid rgba(115, 103, 240, 0.15)"
                                }}
                              >
                                {rm.menuItem.label}
                              </Box>
                            ))}
                            {r.menus.length === 0 && <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>Ninguno</Typography>}
                          </Box>
                        </Box>
                      </CardContent>

                      <Box sx={{ p: 2, borderTop: "1px solid var(--border-light)", display: "flex", gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          fullWidth 
                          onClick={() => handleOpenRoleModal(r)}
                          sx={{ 
                            textTransform: "none", 
                            borderRadius: "6px",
                            borderColor: "var(--border-light)",
                            color: "var(--text-muted)"
                          }}
                        >
                          ✏️ Editar Accesos
                        </Button>
                        {r.name !== "ADMIN" && (
                          <IconButton 
                            onClick={() => handleDeleteRole(r.id, r.name)} 
                            sx={{ 
                              color: "#ea5455", 
                              border: "1px solid rgba(234, 84, 85, 0.2)", 
                              borderRadius: "6px" 
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 3: MENUS */}
          {activeTab === "menus" && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleOpenMenuModal()}
                  sx={{ 
                    textTransform: "none", 
                    borderRadius: "6px", 
                    bgcolor: "var(--primary)",
                    "&:hover": { bgcolor: "var(--primary-hover)" }
                  }}
                >
                  ➕ Crear Nuevo Menú
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "6px", borderColor: "var(--border-light)", bgcolor: "var(--bg-card)" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "rgba(115, 103, 240, 0.02)" }}>
                    <TableRow>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Orden</TableCell>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Menú</TableCell>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }}>Ruta / Link</TableCell>
                      <TableCell sx={{ color: "var(--text-muted)", fontWeight: 700 }} align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {menus.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell sx={{ fontWeight: 600, color: "var(--text-muted)" }}>{m.order}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "var(--text-main)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ color: "var(--primary)", display: "flex", alignItems: "center" }}>
                              <Icon icon={m.icon.includes(":") ? m.icon : `mdi:${m.icon}`} width="20" height="20" />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.label}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", color: "var(--text-main)" }}>
                          {m.route}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "inline-flex", gap: 1 }}>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleOpenMenuModal(m)}
                              sx={{ minWidth: 32, p: 0.5, borderColor: "var(--border-light)", color: "var(--text-muted)" }}
                            >
                              ✏️
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleDeleteMenu(m.id, m.label)}
                              sx={{ minWidth: 32, p: 0.5, borderColor: "rgba(234, 84, 85, 0.2)", color: "#ea5455" }}
                            >
                              🗑️
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}

      {/* ROLE MODAL */}
      <Dialog 
        open={roleModalOpen} 
        onClose={() => setRoleModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: "var(--bg-card)", borderRadius: "6px", border: "1px solid var(--border-light)", p: 2 }
          }
        }}
      >
        <DialogTitle sx={{ color: "var(--primary)", fontWeight: 700 }}>
          {editingRole ? `Editar Perfil: ${roleName}` : "Crear Nuevo Perfil de Acceso"}
        </DialogTitle>
        <form onSubmit={handleSaveRole}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Nombre del Perfil (Mayúsculas sin espacios)"
              placeholder="E.g. SUPERVISOR"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s/g, ""))}
              disabled={editingRole?.name === "ADMIN"}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Descripción del Rol"
              placeholder="E.g. Supervisor de instaladores y proyectos técnicos"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--text-muted)", display: "block", mb: 1 }}>
                Menús autorizados a visualizar en barra lateral
              </Typography>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(2, 1fr)", 
                gap: 1, 
                p: 2, 
                borderRadius: "6px", 
                border: "1px solid var(--border-light)",
                bgcolor: "rgba(115, 103, 240, 0.01)" 
              }}>
                {menus.map((m) => (
                  <FormControlLabel
                    key={m.id}
                    control={
                      <Checkbox
                        checked={selectedMenus.includes(m.id)}
                        onChange={() => toggleMenuSelection(m.id)}
                        sx={{ color: "var(--border-light)", "&.Mui-checked": { color: "var(--primary)" } }}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ color: "var(--primary)", display: "flex", alignItems: "center" }}>
                          <Icon icon={m.icon.includes(":") ? m.icon : `mdi:${m.icon}`} width="18" height="18" />
                        </Box>
                        <Typography variant="body2" sx={{ color: "var(--text-main)" }}>{m.label}</Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--text-muted)", display: "block", mb: 1 }}>
                Permisos funcionales de lectura/escritura en plataforma
              </Typography>
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 1.5, 
                p: 2, 
                borderRadius: "6px", 
                border: "1px solid var(--border-light)",
                bgcolor: "rgba(115, 103, 240, 0.01)",
                maxHeight: 220,
                overflowY: "auto"
              }}>
                {permissions.map((p) => (
                  <Box key={p.id} sx={{ display: "flex", alignItems: "start", gap: 1 }}>
                    <Checkbox
                      checked={selectedPermissions.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                      disabled={editingRole?.name === "ADMIN"}
                      sx={{ color: "var(--border-light)", "&.Mui-checked": { color: "var(--primary)" }, p: 0.5 }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--text-main)" }}>{p.name}</Typography>
                      <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>{p.description}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => setRoleModalOpen(false)}
              sx={{ 
                borderRadius: "6px", 
                textTransform: "none", 
                borderColor: "var(--border-light)", 
                color: "var(--text-muted)" 
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                borderRadius: "6px", 
                textTransform: "none", 
                bgcolor: "var(--primary)",
                "&:hover": { bgcolor: "var(--primary-hover)" }
              }}
            >
              Guardar Perfil
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* MENU MODAL */}
      <Dialog 
        open={menuModalOpen} 
        onClose={() => setMenuModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: "var(--bg-card)", borderRadius: "6px", border: "1px solid var(--border-light)", p: 2 }
          }
        }}
      >
        <DialogTitle sx={{ color: "var(--primary)", fontWeight: 700 }}>
          {editingMenu ? `Editar Menú: ${menuLabel}` : "Crear Nuevo Menú de Barra Lateral"}
        </DialogTitle>
        <form onSubmit={handleSaveMenu}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Etiqueta del Menú (Label)"
              placeholder="E.g. Inventario"
              value={menuLabel}
              onChange={(e) => setMenuLabel(e.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Ruta (Route / Link)"
              placeholder="E.g. /inventory"
              value={menuRoute}
              onChange={(e) => setMenuRoute(e.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <TextField
                    fullWidth
                    label="Icono (Código Material Design / Iconify)"
                    placeholder="Ej: mdi:home, mdi:cctv, mdi:key-outline, mdi:shield"
                    value={menuIcon}
                    onChange={(e) => setMenuIcon(e.target.value)}
                    required
                    helperText="Puedes usar cualquier identificador de icono de Material Design (mdi). Usa el selector para buscar de forma interactiva."
                    slotProps={{ 
                      inputLabel: { shrink: true },
                      input: {
                        startAdornment: menuIcon ? (
                          <InputAdornment position="start">
                            <Box sx={{ color: "var(--primary)", display: "flex", alignItems: "center" }}>
                              <Icon icon={menuIcon.includes(":") ? menuIcon : `mdi:${menuIcon}`} width="20" height="20" />
                            </Box>
                          </InputAdornment>
                        ) : null
                      }
                    }}
                    sx={fieldStyle}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIconSearchQuery("");
                      setIconSearchResults([]);
                      setIconSelectorOpen(true);
                    }}
                    sx={{
                      height: "56px",
                      px: 2.5,
                      minWidth: "120px",
                      borderRadius: "6px",
                      textTransform: "none",
                      borderColor: "var(--border-light)",
                      color: "var(--text-muted)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      "&:hover": {
                        borderColor: "var(--primary)",
                        color: "var(--primary)"
                      }
                    }}
                  >
                    <Icon icon="mdi:palette-outline" width="20" height="20" />
                    Buscar
                  </Button>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Orden de Despliegue"
                  type="number"
                  placeholder="E.g. 5"
                  value={menuOrder}
                  onChange={(e) => setMenuOrder(Number(e.target.value))}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => setMenuModalOpen(false)}
              sx={{ 
                borderRadius: "6px", 
                textTransform: "none", 
                borderColor: "var(--border-light)", 
                color: "var(--text-muted)" 
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                borderRadius: "6px", 
                textTransform: "none", 
                bgcolor: "var(--primary)",
                "&:hover": { bgcolor: "var(--primary-hover)" }
              }}
            >
              Guardar Menú
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Selector de Iconos de Material Design */}
      <Dialog
        open={iconSelectorOpen}
        onClose={() => setIconSelectorOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "var(--bg-card)",
              backgroundImage: "none",
              border: "1px solid var(--border-light)",
              borderRadius: "8px",
              color: "var(--text-main)"
            }
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text-main)" }}>
            Seleccionar Icono (Material Design)
          </Typography>
          <IconButton onClick={() => setIconSelectorOpen(false)} sx={{ color: "var(--text-muted)" }}>
            <Icon icon="mdi:close" width="20" height="20" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Buscar iconos de Material Design (ej: home, lock, user, chart, setting, project...)"
              placeholder="Escribe para buscar..."
              value={iconSearchQuery}
              onChange={(e) => setIconSearchQuery(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "var(--text-muted)" }}>
            {iconSearchQuery ? "Resultados de la búsqueda" : "Iconos recomendados populares"}
          </Typography>

          {iconSearching ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={30} sx={{ color: "var(--primary)" }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 1.5,
                maxHeight: "350px",
                overflowY: "auto",
                p: 1
              }}
            >
              {(iconSearchQuery ? iconSearchResults : POPULAR_ICONS).map((iconName) => (
                <Button
                  key={iconName}
                  onClick={() => {
                    setMenuIcon(iconName);
                    setIconSelectorOpen(false);
                  }}
                  variant="outlined"
                  sx={{
                    flexDirection: "column",
                    minHeight: "80px",
                    borderRadius: "6px",
                    p: 1,
                    textTransform: "none",
                    borderColor: "var(--border-light)",
                    color: "var(--text-main)",
                    gap: 1,
                    "&:hover": {
                      borderColor: "var(--primary)",
                      bgcolor: "rgba(115, 103, 240, 0.05)",
                      transform: "translateY(-2px)"
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  <Icon icon={iconName} width="28" height="28" style={{ color: "var(--primary)" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      textAlign: "center",
                      wordBreak: "break-all",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {iconName.replace("mdi:", "")}
                  </Typography>
                </Button>
              ))}
              {iconSearchQuery && iconSearchResults.length === 0 && (
                <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 3 }}>
                  <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                    No se encontraron iconos para "{iconSearchQuery}"
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setIconSelectorOpen(false)}
            sx={{
              borderRadius: "6px",
              textTransform: "none",
              borderColor: "var(--border-light)",
              color: "var(--text-muted)"
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
