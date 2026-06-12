// d:\github\proyects_master\frontend\src\app\(dashboard)\clients\[id]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load client data if editing
  useEffect(() => {
    if (isNew) return;

    async function loadClient() {
      try {
        setFetching(true);
        const data = await api.get(`/clients/${id}`);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setTaxId(data.taxId || "");
      } catch (err: any) {
        console.error("Error loading client:", err);
        setError("No se pudo cargar la información del cliente.");
      } finally {
        setFetching(false);
      }
    }
    loadClient();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !email || !taxId) {
      setError("Nombre, Correo e Identificación Fiscal son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone,
        taxId
      };

      if (isNew) {
        await api.post("/clients", payload);
      } else {
        await api.put(`/clients/${id}`, payload);
      }

      setSuccess(`¡Cliente ${isNew ? "registrado" : "actualizado"} con éxito!`);
      
      // Redirect back
      setTimeout(() => {
        router.push("/clients");
      }, 1500);

    } catch (err: any) {
      console.error("Error saving client:", err);
      setError(err.message || "Ocurrió un error al intentar guardar los datos del cliente.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando información del cliente...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/clients" style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          ⬅️ Volver a Clientes
        </Link>
        <h1 className="title-primary">{isNew ? "Registrar Nuevo Cliente" : `Editar Cliente`}</h1>
        <p className="subtitle-secondary">
          {isNew ? "Ingresa la información fiscal y datos de contacto del cliente" : "Actualiza la información fiscal y de contacto."}
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="input-group">
            <label className="input-label" htmlFor="name">Nombre / Razón Social</label>
            <input
              id="name"
              type="text"
              placeholder="Ej. Distribuidora de Alimentos S.A."
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="taxId">Identificación Fiscal (RUT / RFC / DNI)</label>
            <input
              id="taxId"
              type="text"
              placeholder="Ej. 76.543.210-K o RFC: ORE660421-H54"
              className="input-field"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="cliente@dominio.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="phone">Teléfono de Contacto</label>
              <input
                id="phone"
                type="tel"
                placeholder="+56 9 8765 4321"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/clients" className="btn btn-secondary" style={{ pointerEvents: loading ? "none" : "auto" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              <span>{isNew ? "Registrar Cliente" : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
