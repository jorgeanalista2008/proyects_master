// d:\github\proyects_master\frontend\src\app\(auth)\login\page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a full-page loading skeleton if initializing the auth state
  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "hsl(var(--bg-primary))"
      }}>
        <div className="spinner" style={{ width: "3rem", height: "3rem", borderWidth: "3px" }} />
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "1.5rem",
      position: "relative"
    }} className="fade-in">
      
      {/* Ambient background decorative glow */}
      <div style={{
        position: "absolute",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, hsla(var(--primary), 0.15) 0%, transparent 70%)",
        top: "20%",
        left: "30%",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, hsla(var(--accent), 0.1) 0%, transparent 70%)",
        bottom: "20%",
        right: "30%",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "450px",
        zIndex: 1,
        position: "relative"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 className="title-primary gradient-text">Iniciar Sesión</h1>
          <p className="subtitle-secondary" style={{ marginBottom: 0 }}>
            Ingresa tus credenciales para acceder al panel
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: "hsla(0, 84.2%, 60.2%, 0.15)",
            border: "1px solid hsl(var(--danger))",
            color: "#ff8888",
            padding: "0.875rem 1.25rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg style={{ flexShrink: 0 }} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="input-label" htmlFor="password">
                Contraseña
              </label>
              <a href="#" style={{
                fontSize: "0.75rem",
                color: "hsl(var(--primary))",
                transition: "color var(--transition-fast)"
              }} onMouseEnter={(e) => e.currentTarget.style.color = "hsl(var(--primary-hover))"}
                 onMouseLeave={(e) => e.currentTarget.style.color = "hsl(var(--primary))"}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: "100%" }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </form>

        <div style={{
          marginTop: "2rem",
          textAlign: "center",
          fontSize: "0.875rem",
          color: "hsl(var(--text-secondary))"
        }}>
          ¿No tienes una cuenta?{" "}
          <a href="#" style={{
            color: "hsl(var(--primary))",
            fontWeight: "500",
            transition: "color var(--transition-fast)"
          }} onMouseEnter={(e) => e.currentTarget.style.color = "hsl(var(--primary-hover))"}
             onMouseLeave={(e) => e.currentTarget.style.color = "hsl(var(--primary))"}>
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}
