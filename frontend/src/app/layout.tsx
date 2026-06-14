import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { MuiThemeProvider } from "@/context/MuiThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexxos.pro - Plataforma de Gestión e Instalaciones",
  description: "Plataforma premium para el monitoreo operativo, cotización de proyectos y catálogo de seguridad electrónica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ConfigProvider>
          <AuthProvider>
            <MuiThemeProvider>
              {children}
            </MuiThemeProvider>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

