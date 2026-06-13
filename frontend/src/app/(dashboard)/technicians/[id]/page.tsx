// d:\github\proyects_master\frontend\src\app\(dashboard)\technicians\[id]\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getApiUrl } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TechnicianForm({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const isNew = id === "new";

  // Basic User states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Profile states
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [profession, setProfession] = useState("");
  const [trade, setTrade] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [shirtSize, setShirtSize] = useState("");
  const [pantsSize, setPantsSize] = useState("");
  const [shoeSize, setShoeSize] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [photoId, setPhotoId] = useState<string | null>(null);

  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // UI status states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load technician details if editing
  useEffect(() => {
    if (isNew) return;

    async function loadTechnician() {
      try {
        setFetching(true);
        const data = await api.get(`/technicians/${id}`);
        
        // Populate User fields
        setEmail(data.email || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");

        // Populate Profile fields
        const profile = data.technicianProfile;
        if (profile) {
          setDocumentNumber(profile.documentNumber || "");
          if (profile.birthDate) {
            setBirthDate(profile.birthDate.split("T")[0]);
          }
          setAcademicLevel(profile.academicLevel || "");
          setProfession(profile.profession || "");
          setTrade(profile.trade || "");
          setAddress(profile.address || "");
          setLandmark(profile.landmark || "");
          setShirtSize(profile.shirtSize || "");
          setPantsSize(profile.pantsSize || "");
          setShoeSize(profile.shoeSize || "");
          setWeight(profile.weight ? profile.weight.toString() : "");
          setHeight(profile.height ? profile.height.toString() : "");
          setPhotoId(profile.photoId || null);
        }
      } catch (err: any) {
        console.error("Error loading technician:", err);
        setError("No se pudo cargar la información del técnico.");
      } finally {
        setFetching(false);
      }
    }
    loadTechnician();
  }, [id, isNew]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async (techId: string) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(getApiUrl(`/technicians/${techId}/photo`), {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error("No se pudo subir la foto de perfil.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic Validations
    if (!email || !firstName || !lastName || !documentNumber) {
      setError("El correo, nombres, apellidos y número de documento son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email,
        password: password || undefined,
        firstName,
        lastName,
        phone,
        documentNumber,
        birthDate: birthDate || undefined,
        academicLevel,
        profession,
        trade,
        address,
        landmark,
        shirtSize,
        pantsSize,
        shoeSize,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
      };

      let techId = id;

      if (isNew) {
        const saved = await api.post("/technicians", payload);
        techId = saved.id;
      } else {
        await api.patch(`/technicians/${id}`, payload);
      }

      // If photo is selected, upload it
      if (selectedFile) {
        await handlePhotoUpload(techId);
      }

      setSuccess(`¡Técnico ${isNew ? "registrado" : "actualizado"} con éxito!`);
      
      setTimeout(() => {
        router.push("/technicians");
      }, 1500);

    } catch (err: any) {
      console.error("Error saving technician:", err);
      setError(err.message || "Ocurrió un error al intentar guardar los datos.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loader-container">
        <div className="spinner" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p>Cargando información del técnico...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/technicians" style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          ⬅️ Volver a Técnicos
        </Link>
        <h1 className="title-primary">{isNew ? "Registrar Nuevo Técnico" : `Editar Perfil de Técnico`}</h1>
        <p className="subtitle-secondary">
          Completa la ficha detallada, credenciales de acceso y tallas físicas de equipamiento del técnico.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "2rem" }}>
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* FOTO DE PERFIL */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            background: "hsla(var(--bg-secondary), 0.2)",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid hsl(var(--border-glass))"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid hsla(var(--primary), 0.4)",
              background: "hsla(var(--bg-secondary), 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem"
            }}>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Previsualización" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : photoId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getApiUrl(`/images/${photoId}`)} alt="Técnico" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                "👨‍🔧"
              )}
            </div>
            <div>
              <label htmlFor="tech-photo" className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", marginBottom: "0.5rem" }}>
                📷 {previewUrl || photoId ? "Cambiar Foto de Perfil" : "Subir Foto de Perfil"}
              </label>
              <input
                id="tech-photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={loading}
              />
              <p style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", margin: 0 }}>
                Formatos permitidos: JPG, PNG. Máximo 5MB. Se almacena directamente en la base de datos.
              </p>
            </div>
          </div>

          {/* SECCIÓN 1: DATOS DE USUARIO */}
          <div>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem", marginBottom: "1.25rem", color: "hsl(var(--primary-hover))" }}>
              1. Credenciales y Contacto (Usuario)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="firstName">Nombres</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Ej. Juan Andrés"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="lastName">Apellidos</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Ej. Pérez Gómez"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="email">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  placeholder="juan.perez@securitynet.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="phone">Número de Teléfono</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Ej. +56987654321"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                <label className="input-label" htmlFor="password">
                  Contraseña {isNew ? "" : "(dejar en blanco para no cambiarla)"}
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={isNew ? "Ingresa la contraseña de acceso" : "••••••••"}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required={isNew}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS PERSONALES */}
          <div>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem", marginBottom: "1.25rem", color: "hsl(var(--primary-hover))" }}>
              2. Datos Personales y Profesionales
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="doc">Número de Documento (RUT / DNI / RFC)</label>
                <input
                  id="doc"
                  type="text"
                  placeholder="Ej. 18.765.432-1 o DNI: 09876543"
                  className="input-field"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="birth">Fecha de Nacimiento</label>
                <input
                  id="birth"
                  type="date"
                  className="input-field"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="academy">Nivel Académico</label>
                <select
                  id="academy"
                  className="input-field"
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona...</option>
                  <option value="Secundaria Completa">Secundaria Completa</option>
                  <option value="Técnico Medio">Técnico Medio</option>
                  <option value="Técnico Superior / Tecnólogo">Técnico Superior / Tecnólogo</option>
                  <option value="Universitario Incompleto">Universitario Incompleto</option>
                  <option value="Universitario Graduado">Universitario Graduado</option>
                  <option value="Postgrado">Postgrado</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="profession">Profesión / Título</label>
                <input
                  id="profession"
                  type="text"
                  placeholder="Ej. Ingeniero de Telecomunicaciones"
                  className="input-field"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                <label className="input-label" htmlFor="trade">Oficio / Especialidad Operativa</label>
                <input
                  id="trade"
                  type="text"
                  placeholder="Ej. Especialista en Fibra Óptica, Fusionador, Instalador CCTV Senior"
                  className="input-field"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: TALLAS Y MEDIDAS */}
          <div>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem", marginBottom: "1.25rem", color: "hsl(var(--primary-hover))" }}>
              3. Tallas de Uniforme e Indicadores Físicos
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="shirt">Talla Camisa</label>
                <select
                  id="shirt"
                  className="input-field"
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona...</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="pants">Talla Pantalón</label>
                <input
                  id="pants"
                  type="text"
                  placeholder="Ej. 32 / 42"
                  className="input-field"
                  value={pantsSize}
                  onChange={(e) => setPantsSize(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="shoes">Talla Calzado (Zapato)</label>
                <input
                  id="shoes"
                  type="text"
                  placeholder="Ej. 40 / 41 / 8"
                  className="input-field"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ gridColumn: "span 1.5", marginBottom: 0 }}>
                <label className="input-label" htmlFor="weight">Peso Corporal (Kg)</label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ej. 75.5"
                  className="input-field"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ gridColumn: "span 1.5", marginBottom: 0 }}>
                <label className="input-label" htmlFor="height">Estatura / Altura (metros)</label>
                <input
                  id="height"
                  type="number"
                  step="0.01"
                  placeholder="Ej. 1.76"
                  className="input-field"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: DIRECCIÓN */}
          <div>
            <h3 style={{ fontSize: "1.1rem", borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem", marginBottom: "1.25rem", color: "hsl(var(--primary-hover))" }}>
              4. Dirección y Ubicación
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="address">Dirección Particular</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Calle, Número, Departamento, Ciudad"
                  className="input-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="landmark">Punto de Referencia</label>
                <textarea
                  id="landmark"
                  placeholder="Ej. Frente a Plaza Central, Edificio Amarillo segundo piso"
                  className="input-field"
                  rows={2}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  disabled={loading}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/technicians" className="btn btn-secondary" style={{ pointerEvents: loading ? "none" : "auto" }}>
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              <span>{isNew ? "Registrar Técnico" : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
