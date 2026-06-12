// d:\github\proyects_master\frontend\src\app\(dashboard)\projects\page.tsx
"use client";

import React, { useEffect, useState } from "react";
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
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "PENDING" | "QUOTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  client: Client;
  manager?: User;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("ALL");

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await api.get<Project[]>("/projects");
        setProjects(data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError("No se pudo cargar la lista de proyectos.");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.manager && 
        `${project.manager.firstName} ${project.manager.lastName}`.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusTab === "ALL" || project.status === statusTab;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Levantamiento";
      case "QUOTED": return "Cotizado";
      case "APPROVED": return "Aprobado";
      case "IN_PROGRESS": return "Instalación";
      case "COMPLETED": return "Completado";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  };

  const tabs = [
    { key: "ALL", label: "Todos" },
    { key: "PENDING", label: "Levantamiento" },
    { key: "QUOTED", label: "Cotizados" },
    { key: "APPROVED", label: "Aprobados" },
    { key: "IN_PROGRESS", label: "Instalación" },
    { key: "COMPLETED", label: "Completados" },
    { key: "CANCELLED", label: "Cancelados" },
  ];

  return (
    <div className="fade-in">
      <div className="card-header-flex" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-primary" style={{ marginBottom: "0.25rem" }}>Tablero de Proyectos</h1>
          <p className="subtitle-secondary" style={{ marginBottom: 0 }}>
            Supervisa el ciclo de vida de los proyectos de seguridad y cotizaciones de clientes
          </p>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          ➕ Nuevo Proyecto
        </Link>
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

      {/* Tabs Layout */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid hsl(var(--border-glass))"
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            style={{
              padding: "0.5rem 1rem",
              background: statusTab === tab.key ? "hsla(var(--primary), 0.15)" : "transparent",
              color: statusTab === tab.key ? "hsl(var(--primary-hover))" : "hsl(var(--text-secondary))",
              border: statusTab === tab.key ? "1px solid hsla(var(--primary), 0.3)" : "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontWeight: statusTab === tab.key ? 600 : 500,
              fontSize: "0.85rem",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{
        marginBottom: "2rem",
        background: "hsla(var(--bg-secondary), 0.3)",
        padding: "1rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid hsl(var(--border-glass))"
      }}>
        <input
          type="text"
          placeholder="Buscar por Nombre del Proyecto, Cliente o Manager..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.75rem 1rem" }}
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
          <p style={{ color: "hsl(var(--text-secondary))" }}>Cargando proyectos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
          <span style={{ fontSize: "3rem" }}>📁</span>
          <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>No se encontraron proyectos</h3>
          <p style={{ color: "hsl(var(--text-secondary))", marginBottom: "1.5rem" }}>
            No hay proyectos para el estado o filtro de búsqueda seleccionado.
          </p>
          <Link href="/projects/new" className="btn btn-secondary" style={{ margin: "0 auto" }}>
            Crear un Proyecto
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Cliente</th>
                <th>Manager Asignado</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th style={{ textAlign: "right" }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <span className="font-weight-medium">{project.name}</span>
                  </td>
                  <td>{project.client?.name || "Cliente no asignado"}</td>
                  <td>
                    {project.manager 
                      ? `${project.manager.firstName} ${project.manager.lastName}` 
                      : <span style={{ color: "hsl(var(--text-muted))" }}>Sin asignar</span>}
                  </td>
                  <td>
                    <span className={`status-badge status-${project.status.toLowerCase()}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td>{new Date(project.createdAt).toLocaleDateString("es-ES")}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/projects/${project.id}`} className="link-action" style={{ fontWeight: 600 }}>
                      Ver Detalles →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
