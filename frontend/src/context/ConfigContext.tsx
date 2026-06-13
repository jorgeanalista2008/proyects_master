"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface SystemConfig {
  id: string;
  appName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoId: string | null;
  website: string | null;
  primaryColor: string;
  accentColor: string;
  defaultTheme: string;
}

interface ConfigContextProps {
  config: SystemConfig | null;
  theme: "dark" | "light";
  loading: boolean;
  toggleTheme: () => void;
  updateConfig: (newConfig: Partial<SystemConfig>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

// Helper to convert hex to HSL space format
function hexToHslSpace(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      case b: hue = (r - g) / d + 4; break;
    }
    hue /= 6;
  }

  const hVal = Math.round(hue * 360);
  const sVal = Math.round(sat * 100);
  const lVal = Math.round(light * 100);

  return `${hVal} ${sVal}% ${lVal}%`;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);

  // Load config on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.get<SystemConfig>("/settings");
        setConfig(data);
        
        // Initial theme from defaultTheme or localStorage
        const savedTheme = localStorage.getItem("theme") as "dark" | "light";
        const targetTheme = savedTheme || (data.defaultTheme as "dark" | "light") || "dark";
        setTheme(targetTheme);
      } catch (err) {
        console.error("Failed to load global config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Apply color and theme variables to document root
  useEffect(() => {
    if (config) {
      try {
        const primaryHsl = hexToHslSpace(config.primaryColor);
        const accentHsl = hexToHslSpace(config.accentColor);
        document.documentElement.style.setProperty("--primary", primaryHsl);
        document.documentElement.style.setProperty("--accent", accentHsl);
      } catch (err) {
        console.error("Error setting custom CSS variables:", err);
      }
    }
  }, [config]);

  // Apply theme class to html/document
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const updateConfig = async (newConfig: Partial<SystemConfig>) => {
    const updated = await api.patch<SystemConfig>("/settings", newConfig);
    setConfig(updated);
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    
    const response = await fetch("http://localhost:3000/api/settings/logo", {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el logo corporativo.");
    }

    const data = await response.json();
    
    // Update local state config
    if (config) {
      setConfig({
        ...config,
        logoId: data.logoId
      });
    }
    return data.logoId;
  };

  return (
    <ConfigContext.Provider value={{ config, theme, loading, toggleTheme, updateConfig, uploadLogo }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
