"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useConfig, FONT_OPTIONS } from "@/context/ConfigContext";

interface ThemeProviderProps {
  children: ReactNode;
}

export function MuiThemeProvider({ children }: ThemeProviderProps) {
  const { theme: currentTheme, config } = useConfig();

  // Create custom MUI theme mirroring Vuexy styling choices
  const muiTheme = React.useMemo(() => {
    const isDark = currentTheme === "dark";
    
    // Resolve primary and accent colors (fallbacks: Vuexy primary/secondary)
    const primaryHex = config?.primaryColor || "#7367f0";
    const accentHex = config?.accentColor || "#00cfe8";

    let theme = createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: {
          main: primaryHex,
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#8a8d93",
          contrastText: "#ffffff",
        },
        background: {
          default: isDark ? "#25293c" : "#f8f7fa",
          paper: isDark ? "#2f3349" : "#ffffff",
        },
        text: {
          primary: isDark ? "#cfd3ec" : "#2f2b3d",
          secondary: isDark ? "#b0b5dd" : "#797686",
        },
        divider: isDark ? "#434968" : "#dbdade",
      },
      shape: {
        borderRadius: 6,
      },
      typography: {
        fontFamily: (() => {
          const fontKey = config?.fontStyle || "public-sans";
          const found = FONT_OPTIONS.find(f => f.id === fontKey);
          return found ? found.value : "'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        })(),
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 6,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              boxShadow: isDark 
                ? "0 4px 12px 0 rgba(15, 20, 34, 0.6)" 
                : "0 4px 8px -2px rgba(165, 163, 174, 0.3), 0 2px 4px -1px rgba(165, 163, 174, 0.2)",
            },
          },
        },
      },
    });

    return responsiveFontSizes(theme);
  }, [currentTheme, config]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
