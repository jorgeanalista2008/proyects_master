// d:\github\proyects_master\frontend\src\app\(dashboard)\technicians\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface TechnicianProfile {
  id: string;
  documentNumber: string;
  birthDate?: string;
  academicLevel?: string;
  profession?: string;
  trade?: string;
  address?: string;
  landmark?: string;
  shirtSize?: string;
  pantsSize?: string;
  shoeSize?: string;
  weight?: number;
  height?: number;
  photoId?: string;
}

interface Technician {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  technicianProfile?: TechnicianProfile;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setLoading(true);
        const data = await api.get<Technician[]>("/technicians");
        setTechnicians(data);
      } catch (err: any) {
        console.error("Error fetching technicians:", err);
        setError("No se pudo cargar la lista de técnicos.");
      } finally {
        setLoading(false);
      }
    }
    fetchTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter((tech) => {
    const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase();
    const query = search.toLowerCase();
    const doc = tech.technicianProfile?.documentNumber?.toLowerCase() || "";
    const trade = tech.technicianProfile?.trade?.toLowerCase() || "";
    const profession = tech.technicianProfile?.profession?.toLowerCase() || "";
    const email = tech.email.toLowerCase();

    return (
      fullName.includes(query) ||
      doc.includes(query) ||
      trade.includes(query) ||
      profession.includes(query) ||
      email.includes(query)
    );
  });

  return (
    <div className="fade-in">
      <div className="card-header-flex" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-primary" style={{ marginBottom: "0.25rem" }}>Directorio de Técnicos</h1>
          <p className="subtitle-secondary" style={{ marginBottom: 0 }}>
            Administra los datos personales, fisonomía, tallas de uniforme y contacto del personal técnico
          </p>
        </div>
        <Link href="/technicians/new" className="btn btn-primary">
          ➕ Registrar Técnico
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
          placeholder="Buscar técnico por Nombre, RUT/DNI, Correo, Especialidad u Oficio..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.75rem 1rem" }}
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
          <p style={{ color: "hsl(var(--text-secondary))" }}>Cargando directorio de técnicos...</p>
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
          <span style={{ fontSize: "3rem" }}>🛠️</span>
          <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Directorio Vacío</h3>
          <p style={{ color: "hsl(var(--text-secondary))", marginBottom: "1.5rem" }}>
            No se encontraron técnicos registrados que coincidan con la búsqueda.
          </p>
          <Link href="/technicians/new" className="btn btn-secondary" style={{ margin: "0 auto" }}>
            Registrar Primer Técnico
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}>
          {filteredTechnicians.map((tech) => {
            const profile = tech.technicianProfile;
            return (
              <div key={tech.id} className="glass-card" style={{
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem",
                position: "relative",
                transition: "transform 0.2s",
                cursor: "default"
              }}>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid hsla(var(--primary), 0.3)",
                    background: "hsla(var(--bg-secondary), 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.2rem"
                  }}>
                    {profile?.photoId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`http://localhost:3000/api/images/${profile.photoId}`}
                        alt={`${tech.firstName} ${tech.lastName}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "👨‍🔧"
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                      {tech.firstName} {tech.lastName}
                    </h3>
                    <span style={{
                      fontSize: "0.8rem",
                      color: "hsl(var(--primary-hover))",
                      fontWeight: 600,
                      marginTop: "0.15rem"
                    }}>
                      💼 {profile?.trade || profile?.profession || "Sin Oficio Definido"}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  fontSize: "0.85rem",
                  color: "hsl(var(--text-secondary))",
                  borderTop: "1px solid hsl(var(--border-glass))",
                  paddingTop: "0.75rem",
                  marginBottom: "1rem",
                  flex: 1
                }}>
                  <div>📄 <strong>Doc:</strong> {profile?.documentNumber || "No registrado"}</div>
                  <div>📧 <strong>Correo:</strong> {tech.email}</div>
                  <div>📞 <strong>Tel:</strong> {tech.phone || "No registrado"}</div>
                  {profile?.academicLevel && (
                    <div>🎓 <strong>Estudios:</strong> {profile.academicLevel}</div>
                  )}
                  {profile && (profile.shirtSize || profile.pantsSize || profile.shoeSize) && (
                    <div style={{
                      marginTop: "0.4rem",
                      display: "flex",
                      gap: "0.5rem",
                      background: "hsla(var(--bg-secondary), 0.4)",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem",
                      width: "fit-content"
                    }}>
                      👕 {profile.shirtSize || "-"} | 👖 {profile.pantsSize || "-"} | 👟 {profile.shoeSize || "-"}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Link href={`/technicians/${tech.id}`} className="btn btn-secondary btn-sm" style={{ width: "100%", textAlign: "center" }}>
                    ✏️ Editar Perfil Completo
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
