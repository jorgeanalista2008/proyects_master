"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

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

interface MenuItem {
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
  const [menus, setMenus] = useState<MenuItem[]>([]);

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
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuLabel, setMenuLabel] = useState("");
  const [menuRoute, setMenuRoute] = useState("");
  const [menuIcon, setMenuIcon] = useState("");
  const [menuOrder, setMenuOrder] = useState<number>(0);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [usersData, rolesData, permissionsData, menusData] = await Promise.all([
        api.get<User[]>("/users"),
        api.get<Role[]>("/roles"),
        api.get<Permission[]>("/roles/permissions"),
        api.get<MenuItem[]>("/roles/menus"),
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
      <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
        <h3 style={{ color: "hsl(var(--danger))" }}>Acceso Denegado</h3>
        <p style={{ marginTop: "1rem", color: "hsl(var(--text-secondary))" }}>
          Solo los administradores del sistema pueden gestionar usuarios, perfiles y permisos.
        </p>
      </div>
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
  const handleOpenMenuModal = (menu: MenuItem | null = null) => {
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

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="title-primary">Administración del Sistema</h1>
        <p className="subtitle-secondary">
          Gestiona los usuarios de la plataforma, crea perfiles (roles) personalizados, asigna permisos del sistema y configura menús dinámicos.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{
          background: "hsla(359, 80%, 63%, 0.15)",
          border: "1px solid hsl(var(--danger))",
          color: "hsl(var(--danger))",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "hsla(147, 66%, 47%, 0.15)",
          border: "1px solid hsl(var(--success))",
          color: "hsl(var(--success))",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem"
        }}>
          ✓ {success}
        </div>
      )}

      {/* Tabs Vuexy Style */}
      <div style={{
        display: "flex",
        gap: "1.5rem",
        borderBottom: "1px solid hsl(var(--border-glass))",
        marginBottom: "2rem",
        overflowX: "auto"
      }}>
        <button
          onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
          style={{
            padding: "0.8rem 1rem",
            background: "transparent",
            color: activeTab === "users" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
            border: "none",
            borderBottom: activeTab === "users" ? "2px solid hsl(var(--primary))" : "2px solid transparent",
            fontWeight: activeTab === "users" ? 600 : 500,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
        >
          👥 Usuarios y Roles
        </button>

        <button
          onClick={() => { setActiveTab("roles"); setSearchQuery(""); }}
          style={{
            padding: "0.8rem 1rem",
            background: "transparent",
            color: activeTab === "roles" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
            border: "none",
            borderBottom: activeTab === "roles" ? "2px solid hsl(var(--primary))" : "2px solid transparent",
            fontWeight: activeTab === "roles" ? 600 : 500,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
        >
          🔑 Perfiles y Permisos
        </button>

        <button
          onClick={() => { setActiveTab("menus"); setSearchQuery(""); }}
          style={{
            padding: "0.8rem 1rem",
            background: "transparent",
            color: activeTab === "menus" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
            border: "none",
            borderBottom: activeTab === "menus" ? "2px solid hsl(var(--primary))" : "2px solid transparent",
            fontWeight: activeTab === "menus" ? 600 : 500,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
        >
          📂 Menús de Navegación
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner" />
          <p style={{ color: "hsl(var(--text-secondary))" }}>Cargando datos del sistema...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: USERS */}
          {activeTab === "users" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o correo electrónico..."
                  className="input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: "450px" }}
                />
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Asignar Perfil / Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.6 }}>
                        <td>
                          <div style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>
                            {u.firstName} {u.lastName}
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: u.isActive ? "hsla(147, 66%, 47%, 0.15)" : "hsla(359, 80%, 63%, 0.15)",
                            color: u.isActive ? "hsl(var(--success))" : "hsl(var(--danger))"
                          }}>
                            {u.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>
                          <select
                            value={u.role.name}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            className="input-field"
                            style={{ width: "200px", padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                            disabled={u.email === "admin@securitysystem.com"} // Protege cuenta inicial
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === "roles" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
                <button onClick={() => handleOpenRoleModal()} className="btn btn-primary">
                  ➕ Crear Perfil Personalizado
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                {roles.map((r) => (
                  <div key={r.id} className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "hsl(var(--primary))" }}>{r.name}</h3>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                          {r.permissions.length} permisos
                        </span>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))", marginBottom: "1rem", minHeight: "40px" }}>
                        {r.description || "Sin descripción de perfil."}
                      </p>

                      <div style={{ marginBottom: "1.5rem" }}>
                        <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "hsl(var(--text-muted))", marginBottom: "0.5rem", fontWeight: 600 }}>
                          Accesos de Menú
                        </h4>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                          {r.menus.map((rm) => (
                            <span key={rm.menuItem.id} style={{
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.4rem",
                              borderRadius: "var(--radius-sm)",
                              background: "hsla(var(--primary), 0.08)",
                              color: "hsl(var(--primary))",
                              border: "1px solid hsla(var(--primary), 0.15)"
                            }}>
                              {rm.menuItem.label}
                            </span>
                          ))}
                          {r.menus.length === 0 && <span style={{ fontSize: "0.8rem", color: "hsl(var(--text-muted))" }}>Ninguno</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", borderTop: "1px solid hsl(var(--border-glass))", paddingTop: "1rem" }}>
                      <button onClick={() => handleOpenRoleModal(r)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        ✏️ Editar Accesos
                      </button>
                      {r.name !== "ADMIN" && (
                        <button onClick={() => handleDeleteRole(r.id, r.name)} className="btn btn-danger btn-sm" style={{ background: "transparent", color: "hsl(var(--danger))", border: "1px solid hsl(var(--danger))", flex: 0.3 }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MENUS */}
          {activeTab === "menus" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
                <button onClick={() => handleOpenMenuModal()} className="btn btn-primary">
                  ➕ Crear Nuevo Menú
                </button>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>Orden</th>
                      <th>Menú</th>
                      <th>Ruta / Link</th>
                      <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600, color: "hsl(var(--text-muted))" }}>{m.order}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                            <span style={{ fontSize: "1.2rem" }}>{m.icon}</span>
                            <span>{m.label}</span>
                          </div>
                        </td>
                        <td>
                          <code style={{ background: "hsla(0, 0%, 100%, 0.05)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                            {m.route}
                          </code>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <button onClick={() => handleOpenMenuModal(m)} className="btn btn-secondary btn-sm" style={{ padding: "0.4rem 0.6rem" }}>
                              ✏️
                            </button>
                            <button onClick={() => handleDeleteMenu(m.id, m.label)} className="btn btn-danger btn-sm" style={{ padding: "0.4rem 0.6rem" }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ROLE MODAL */}
      {roleModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "650px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem"
          }}>
            <h2 style={{ marginBottom: "1.5rem", color: "hsl(var(--primary))" }}>
              {editingRole ? `Editar Perfil: ${roleName}` : "Crear Nuevo Perfil de Acceso"}
            </h2>
            <form onSubmit={handleSaveRole}>
              <div className="input-group">
                <label className="input-label">Nombre del Perfil (Mayúsculas sin espacios)</label>
                <input
                  type="text"
                  className="input-field"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="E.g. SUPERVISOR"
                  disabled={editingRole?.name === "ADMIN"}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Descripción del Rol</label>
                <input
                  type="text"
                  className="input-field"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="E.g. Supervisor de instaladores y proyectos técnicos"
                />
              </div>

              {/* Menus Checklist */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="input-label" style={{ marginBottom: "0.5rem", display: "block" }}>
                  Menús autorizados a visualizar en barra lateral
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  background: "hsla(0, 0%, 100%, 0.02)",
                  border: "1px solid hsl(var(--border-glass))",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)"
                }}>
                  {menus.map((m) => (
                    <label key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={selectedMenus.includes(m.id)}
                        onChange={() => toggleMenuSelection(m.id)}
                        style={{ width: "16px", height: "16px" }}
                      />
                      <span>{m.icon} {m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Permissions Checklist */}
              <div style={{ marginBottom: "2rem" }}>
                <label className="input-label" style={{ marginBottom: "0.5rem", display: "block" }}>
                  Permisos funcionales de lectura/escritura en plataforma
                </label>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  background: "hsla(0, 0%, 100%, 0.02)",
                  border: "1px solid hsl(var(--border-glass))",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  maxHeight: "220px",
                  overflowY: "auto"
                }}>
                  {permissions.map((p) => (
                    <label key={p.id} style={{ display: "flex", alignItems: "start", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                        style={{ width: "16px", height: "16px", marginTop: "2px" }}
                        disabled={editingRole?.name === "ADMIN"} // ADMIN siempre tiene todo
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>{p.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>{p.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" onClick={() => setRoleModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENU MODAL */}
      {menuModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "500px",
            padding: "2rem"
          }}>
            <h2 style={{ marginBottom: "1.5rem", color: "hsl(var(--primary))" }}>
              {editingMenu ? `Editar Menú: ${menuLabel}` : "Crear Nuevo Menú de Barra Lateral"}
            </h2>
            <form onSubmit={handleSaveMenu}>
              <div className="input-group">
                <label className="input-label">Etiqueta del Menú (Label)</label>
                <input
                  type="text"
                  className="input-field"
                  value={menuLabel}
                  onChange={(e) => setMenuLabel(e.target.value)}
                  placeholder="E.g. Inventario"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Ruta (Route / Link)</label>
                <input
                  type="text"
                  className="input-field"
                  value={menuRoute}
                  onChange={(e) => setMenuRoute(e.target.value)}
                  placeholder="E.g. /inventory"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div className="input-group">
                  <label className="input-label">Icono (Emoji o SVG)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={menuIcon}
                    onChange={(e) => setMenuIcon(e.target.value)}
                    placeholder="E.g. 📦"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Orden de Despliegue</label>
                  <input
                    type="number"
                    className="input-field"
                    value={menuOrder}
                    onChange={(e) => setMenuOrder(Number(e.target.value))}
                    placeholder="E.g. 5"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setMenuModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Menú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
