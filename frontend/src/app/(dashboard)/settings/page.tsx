"use client";

import React, { useState, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/hooks/useAuth";

const PRESET_PALETTES = [
  { name: "Vuexy Corporate (Recomendado)", primary: "#7367F0", accent: "#82868B" },
  { name: "Cyber-Sentinel", primary: "#00F2FE", accent: "#8A2BE2" },
  { name: "Classic Navy / Slate", primary: "#1e3a8a", accent: "#94a3b8" },
  { name: "Cyberpunk Neon", primary: "#8b5cf6", accent: "#ec4899" },
  { name: "Emerald Garden", primary: "#10b981", accent: "#06b6d4" },
  { name: "Crimson Metal", primary: "#b91c1c", accent: "#f59e0b" },
  { name: "Ocean Breeze", primary: "#0ea5e9", accent: "#10b981" }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { config, updateConfig, uploadLogo } = useConfig();

  const [appName, setAppName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e3a8a");
  const [accentColor, setAccentColor] = useState("#94a3b8");
  const [defaultTheme, setDefaultTheme] = useState("dark");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync state with global config
  useEffect(() => {
    if (config) {
      setAppName(config.appName || "");
      setPhone(config.phone || "");
      setEmail(config.email || "");
      setAddress(config.address || "");
      setWebsite(config.website || "");
      setPrimaryColor(config.primaryColor || "#1e3a8a");
      setAccentColor(config.accentColor || "#94a3b8");
      setDefaultTheme(config.defaultTheme || "dark");

      if (config.logoId) {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        setLogoPreviewUrl(`${base}/images/${config.logoId}`);
      }
    }
  }, [config]);

  // Deny access if not admin
  if (user && user.role !== "ADMIN") {
    return (
      <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
        <h3 style={{ color: "hsl(var(--danger))" }}>Acceso Denegado</h3>
        <p style={{ marginTop: "1rem", color: "hsl(var(--text-secondary))" }}>
          Solo los administradores del sistema pueden acceder al panel de personalización.
        </p>
      </div>
    );
  }

  const handleApplyPalette = (palette: typeof PRESET_PALETTES[0]) => {
    setPrimaryColor(palette.primary);
    setAccentColor(palette.accent);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setError("");
    setSuccess("");
    setUploadingLogo(true);
    try {
      const newLogoId = await uploadLogo(logoFile);
      setLogoFile(null);
      
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
      setLogoPreviewUrl(`${base}/images/${newLogoId}`);
      
      setSuccess("Logo corporativo actualizado con éxito.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al subir el logo corporativo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    if (!appName) {
      setError("El nombre de la aplicación es obligatorio.");
      setSaving(false);
      return;
    }

    try {
      await updateConfig({
        appName,
        phone: phone || null,
        email: email || null,
        address: address || null,
        website: website || null,
        primaryColor,
        accentColor,
        defaultTheme
      });
      setSuccess("¡Configuración de personalización guardada con éxito!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al intentar guardar los ajustes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="title-primary">Personalización del Software</h1>
        <p className="subtitle-secondary">
          Modifica los colores, logo e identidad del software aplicables en toda la plataforma.
        </p>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem", alignItems: "start" }}>
        {/* Left Side: Logo Uploader */}
        <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Logo Corporativo</h3>
          
          <div style={{
            background: "hsla(0, 0%, 100%, 0.05)",
            border: "1px solid hsl(var(--border-glass))",
            borderRadius: "var(--radius-md)",
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            padding: "1rem",
            overflow: "hidden"
          }}>
            {logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreviewUrl} alt="Logo Corporativo" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: "0.85rem", color: "hsl(var(--text-muted))" }}>Sin Logo Cargado</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="file"
              accept="image/*"
              id="settings-logo-upload"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="settings-logo-upload" className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
              📁 Elegir Archivo Logo
            </label>
            {logoFile && (
              <button
                onClick={handleUploadLogo}
                disabled={uploadingLogo}
                className="btn btn-primary btn-sm"
              >
                {uploadingLogo ? "Subiendo..." : "✓ Subir Logo"}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Settings fields */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem", margin: 0 }}>
              Identidad de Marca
            </h3>

            <div className="input-group">
              <label className="input-label" htmlFor="appName">Nombre Comercial (App)</label>
              <input
                id="appName"
                type="text"
                className="input-field"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="phone">Teléfono Empresa</label>
                <input
                  id="phone"
                  type="text"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="email">Correo Empresa</label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="address">Dirección Principal</label>
              <input
                id="address"
                type="text"
                className="input-field"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="website">Página Web</label>
              <input
                id="website"
                type="text"
                className="input-field"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={saving}
              />
            </div>

            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, borderBottom: "1px solid hsl(var(--border-glass))", paddingBottom: "0.5rem", marginTop: "0.5rem", margin: 0 }}>
              Estética & Temas
            </h3>

            {/* Presets */}
            <div className="input-group">
              <label className="input-label">Paletas de Colores Predeterminadas</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {PRESET_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => handleApplyPalette(palette)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.75rem",
                      padding: "0.3rem 0.6rem"
                    }}
                  >
                    <span style={{ display: "flex", gap: "2px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: palette.primary, display: "inline-block" }}></span>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: palette.accent, display: "inline-block" }}></span>
                    </span>
                    {palette.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Color Primario (Hex)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ border: "none", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", background: "transparent" }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1, marginBottom: 0 }}
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Color de Acento (Hex)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{ border: "none", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", background: "transparent" }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1, marginBottom: 0 }}
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="defaultTheme">Tema Predeterminado</label>
              <select
                id="defaultTheme"
                className="input-field"
                value={defaultTheme}
                onChange={(e) => setDefaultTheme(e.target.value)}
                disabled={saving}
              >
                <option value="dark">Tema Oscuro (Moderno)</option>
                <option value="light">Tema Claro (Limpio)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : null}
                <span>Guardar Personalización</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
