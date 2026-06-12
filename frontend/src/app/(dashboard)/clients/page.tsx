// d:\github\proyects_master\frontend\src\app\(dashboard)\clients\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string; // RUT/RFC/DNI
  projects?: any[];
  _count?: {
    projects: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        const data = await api.get<Client[]>("/clients");
        setClients(data);
      } catch (err: any) {
        console.error("Error fetching clients:", err);
        setError("No se pudo cargar la lista de clientes.");
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.taxId.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="fade-in">
      <div className="card-header-flex" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-primary" style={{ marginBottom: "0.25rem" }}>Directorio de Clientes</h1>
          <p className="subtitle-secondary" style={{ marginBottom: 0 }}>
            Administra la información fiscal, datos de contacto y proyectos de tus clientes
          </p>
        </div>
        <Link href="/clients/new" className="btn btn-primary">
          ➕ Registrar Cliente
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

      {/* Search Filter */}
      <div style={{
        marginBottom: "2rem",
        background: "hsla(var(--bg-secondary), 0.3)",
        padding: "1rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid hsl(var(--border-glass))"
      }}>
        <input
          type="text"
          placeholder="Buscar por Nombre, RUT/RFC/DNI o Email..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.75rem 1rem" }}
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
          <p style={{ color: "hsl(var(--text-secondary))" }}>Cargando directorio...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
          <span style={{ fontSize: "3rem" }}>👥</span>
          <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Directorio Vacío</h3>
          <p style={{ color: "hsl(var(--text-secondary))", marginBottom: "1.5rem" }}>
            No se encontraron clientes registrados en este momento.
          </p>
          <Link href="/clients/new" className="btn btn-secondary" style={{ margin: "0 auto" }}>
            Registrar Primer Cliente
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre / Razón Social</th>
                <th>Identificación Fiscal (RUT/RFC/DNI)</th>
                <th>Contacto</th>
                <th>Proyectos</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const projectCount = client._count?.projects ?? client.projects?.length ?? 0;
                
                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "var(--radius-sm)",
                          background: "hsla(var(--primary), 0.1)",
                          border: "1px solid hsla(var(--primary), 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "hsl(var(--primary-hover))"
                        }}>
                          {client.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-weight-medium">{client.name}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{
                        background: "hsla(var(--bg-secondary), 0.5)",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.85rem",
                        border: "1px solid hsl(var(--border-glass))"
                      }}>
                        {client.taxId}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                        <span style={{ fontSize: "0.85rem" }}>📧 {client.email}</span>
                        <span style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>📞 {client.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${projectCount > 0 ? "status-approved" : "status-pending"}`}>
                        📂 {projectCount} {projectCount === 1 ? "Proyecto" : "Proyectos"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/clients/${client.id}`} className="btn btn-secondary btn-sm" style={{ display: "inline-flex" }}>
                        ✏️ Editar
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
  );
}
