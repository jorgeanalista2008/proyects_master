// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\[id]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Client {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ProjectImage {
  id: string;
  filename: string;
  createdAt: string;
}

interface Quote {
  id: string;
  version: number;
  total: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "PENDING" | "QUOTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  client: Client;
  manager?: User;
  quotes?: Quote[];
  images?: ProjectImage[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailOrForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  // Form states (Create)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [managerId, setManagerId] = useState("");

  // Details states (View)
  const [project, setProject] = useState<Project | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>("");

  // Directory lists
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // General states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadFormDirectories() {
      try {
        const clientsData = await api.get<Client[]>("/clients");
        setClients(clientsData);
        
        try {
          const usersData = await api.get<User[]>("/users");
          setUsers(usersData);
        } catch {
          // If /users fails or doesn't exist, we fallback to empty list
          console.warn("Could not load users directory");
        }
      } catch (err) {
        console.error("Error loading form directories:", err);
      }
    }

    async function loadProjectDetails() {
      try {
        setFetching(true);
        const data = await api.get<Project>(`/projects/${id}`);
        setProject(data);
        setProjectStatus(data.status);
      } catch (err: any) {
        console.error("Error loading project details:", err);
        setError("No se pudo cargar el detalle del proyecto.");
      } finally {
        setFetching(false);
      }
    }

    if (isNew) {
      loadFormDirectories().then(() => setFetching(false));
    } else {
      loadProjectDetails();
    }
  }, [id, isNew]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !clientId) {
      setError("Nombre del Proyecto y Cliente son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        description,
        clientId,
        managerId: managerId || undefined
      };

      const saved = await api.post<any>("/projects", payload);
      setSuccess("¡Proyecto registrado exitosamente!");
      setTimeout(() => {
        router.push(`/projects/${saved.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Error al intentar registrar el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    setError("");
    setSuccess("");
    try {
      await api.put(`/projects/${project.id}`, { status: newStatus });
      setProjectStatus(newStatus);
      setSuccess("Estado del proyecto actualizado.");
      // Reload project to sync
      const updated = await api.get<Project>(`/projects/${id}`);
      setProject(updated);
    } catch (err: any) {
      console.error("Error changing status:", err);
      setError("No se pudo actualizar el estado del proyecto.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !project) return;
    setUploadingImage(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const response = await fetch(`http://localhost:3000/api/images/project/${project.id}`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar la imagen del levantamiento.");
      }

      setSuccess("Foto del levantamiento cargada con éxito.");
      setSelectedFile(null);
      
      // Reload project details to show new image in gallery
      const data = await api.get<Project>(`/projects/${id}`);
      setProject(data);
    } catch (err: any) {
      console.error("Error uploading survey image:", err);
      setError(err.message || "Error al cargar el archivo de imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (fetching) {
    return (
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando información...</p>
      </div>
    );
  }

  // --- RENDERING CREATION FORM ---
  if (isNew) {
    return (
      <div className="fade-in" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/projects" style={{
            color: "hsl(var(--text-secondary))",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem"
          }}>
            ⬅️ Volver a Proyectos
          </Link>
          <h1 className="title-primary">Registrar Nuevo Proyecto</h1>
          <p className="subtitle-secondary">
            Crea la ficha de un nuevo proyecto, asócialo a un cliente y asigna el personal técnico de soporte.
          </p>
        </div>

        <div className="glass-card">
          {error && (
            <div style={{
              background: "hsla(0, 84.2%, 60.2%, 0.15)",
              border: "1px solid hsl(var(--danger))",
              color: "#ff8888",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "hsla(142.1, 70.6%, 45.3%, 0.15)",
              border: "1px solid hsl(var(--success))",
              color: "#a3e635",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem"
            }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="input-group">
              <label className="input-label" htmlFor="pname">Nombre del Proyecto</label>
              <input
                id="pname"
                type="text"
                placeholder="Ej. Instalación CCTV Bodega Central"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="pdesc">Descripción y Objetivos</label>
              <textarea
                id="pdesc"
                placeholder="Detalla el alcance del proyecto de seguridad, cámaras deseadas, sensores..."
                className="input-field"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="pclient">Cliente Asociado</label>
                <select
                  id="pclient"
                  className="input-field"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={loading}
                  required
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Selecciona un Cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="pmanager">Technical Manager / Técnico</label>
                <select
                  id="pmanager"
                  className="input-field"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  disabled={loading}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Selecciona un Manager (Opcional)...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
              <Link href="/projects" className="btn btn-secondary" style={{ pointerEvents: loading ? "none" : "auto" }}>
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                <span>Registrar Proyecto</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDERING DETAIL VIEW ---
  if (!project) return null;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/projects" style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          ⬅️ Volver a Proyectos
        </Link>
        
        <div className="card-header-flex">
          <div>
            <h1 className="title-primary" style={{ marginBottom: "0.25rem" }}>{project.name}</h1>
            <p className="subtitle-secondary" style={{ marginBottom: 0 }}>
              Ficha de control técnico, cotizaciones generadas e imágenes de levantamiento.
            </p>
          </div>
          
          {/* Status updater */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))", fontWeight: 600 }}>Estado:</span>
            <select
              className="input-field"
              value={projectStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                width: "180px",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid hsla(var(--primary), 0.3)",
                background: "hsla(var(--bg-secondary), 0.8)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <option value="PENDING">Levantamiento</option>
              <option value="QUOTED">Cotizado</option>
              <option value="APPROVED">Aprobado</option>
              <option value="IN_PROGRESS">Instalación</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: "hsla(0, 84.2%, 60.2%, 0.15)",
          border: "1px solid hsl(var(--danger))",
          color: "#ff8888",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "hsla(142.1, 70.6%, 45.3%, 0.15)",
          border: "1px solid hsl(var(--success))",
          color: "#a3e635",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem"
        }}>
          ✓ {success}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1.8fr",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* Left Column: Tech Info & survey photo gallery */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Card: Ficha Técnica */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem" }}>
              Ficha Técnica
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}>
              <div>
                <span style={{ color: "hsl(var(--text-muted))", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Cliente</span>
                <strong>{project.client?.name}</strong>
              </div>
              <div>
                <span style={{ color: "hsl(var(--text-muted))", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Asignado A (Technical Manager)</span>
                <strong>
                  {project.manager 
                    ? `${project.manager.firstName} ${project.manager.lastName}` 
                    : "Ninguno"}
                </strong>
              </div>
              <div>
                <span style={{ color: "hsl(var(--text-muted))", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Fecha Creación</span>
                <span>{new Date(project.createdAt).toLocaleString("es-ES")}</span>
              </div>
              {project.description && (
                <div>
                  <span style={{ color: "hsl(var(--text-muted))", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Descripción</span>
                  <p style={{ color: "hsl(var(--text-secondary))", marginTop: "0.25rem" }}>{project.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card: Survey Photos Gallery */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem" }}>
              Fotos del Levantamiento
            </h2>

            {/* Gallery list */}
            {!project.images || project.images.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--text-muted))", margin: "1.5rem 0", textAlign: "center" }}>
                Aún no hay fotos registradas para este proyecto.
              </p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem"
              }}>
                {project.images.map((img) => (
                  <div key={img.id} style={{
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    border: "1px solid hsl(var(--border-glass))",
                    height: "110px",
                    background: "hsla(var(--bg-secondary), 0.5)"
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`http://localhost:3000/api/images/${img.id}`}
                      alt="Levantamiento"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div style={{
              background: "hsla(var(--bg-secondary), 0.3)",
              border: "1px dashed hsl(var(--border-glass))",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <input
                id="proj-img-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="proj-img-upload" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex" }}>
                📷 {selectedFile ? "Cambiar Imagen" : "Elegir Foto"}
              </label>
              {selectedFile && (
                <>
                  <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "0.25rem", width: "100%" }}
                  >
                    {uploadingImage ? "Subiendo..." : "Subir Foto"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Associated Quotes / Presupuestos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <div className="card-header-flex" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Cotizaciones Asociadas</h2>
              <Link href={`/projects/${project.id}/quotes/new`} className="btn btn-primary btn-sm">
                ➕ Crear Nueva Cotización
              </Link>
            </div>

            {!project.quotes || project.quotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <span style={{ fontSize: "2.5rem" }}>📄</span>
                <p style={{ marginTop: "0.5rem", color: "hsl(var(--text-secondary))" }}>
                  No hay cotizaciones para este proyecto.
                </p>
                <Link
                  href={`/projects/${project.id}/quotes/new`}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: "1rem", marginInline: "auto" }}
                >
                  Crear la primera cotización
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Versión</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th style={{ textAlign: "right" }}>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.quotes.map((q) => {
                      const totalFormatted = new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: q.currency
                      }).format(q.total);

                      return (
                        <tr key={q.id}>
                          <td>
                            <strong>v{q.version}</strong>
                          </td>
                          <td>{new Date(q.createdAt).toLocaleDateString("es-ES")}</td>
                          <td>
                            <span className={`status-badge status-${q.status.toLowerCase()}`}>
                              {q.status === "PENDING" && "Borrador"}
                              {q.status === "APPROVED" && "Aprobado"}
                              {q.status === "REJECTED" && "Rechazado"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "hsl(var(--primary-hover))" }}>{totalFormatted}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Link href={`/projects/${project.id}/quotes/${q.id}`} className="link-action" style={{ fontWeight: 600 }}>
                              Ver / Editar →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
