# Secure-Fast .htaccess Generator

> **Creado por Diego Bravo (<https://github.com/Eghost1>)**

## Índice de Contenidos

- [Descripción y Propósito](#descripción-y-propósito)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Casos de Uso](#casos-de-uso)
- [Requisitos Operativos](#requisitos-operativos)

## Descripción y Propósito

Esta habilidad instruye a Antigravity para actuar como un Senior DevOps Engineer y Especialista en Ciberseguridad Web, enfocado en generar archivos `.htaccess` de nivel profesional para servidores Apache 2.4+. Está específicamente diseñada y optimizada para proyectos donde la seguridad estricta institucional y la alta velocidad de carga en zonas remotas o de conectividad inestable son absolutamente críticas.

## Funcionalidades Principales

1. **Máxima Ciberseguridad**:
   - Redirección forzada a HTTPS y Strict-Transport-Security (HSTS).
   - Cabeceras de seguridad avanzadas (X-Frame-Options, X-XSS-Protection, CSP, Referrer-Policy).
   - Bloqueo estricto a archivos sensibles (`.env`, `.git`, `.sql`, etc.).
   - Prevención de listado de directorios (Anti-Sniffing).
2. **Rendimiento Extremo (Zonas 3G/4G)**:
   - Compresión avanzada (Gzip/Brotli vía `mod_deflate`).
   - Caché agresiva de navegadores (Browser Caching vía `mod_expires`).
   - Mantenimiento proactivo de conexiones (Connection Keep-Alive) para reducir latencia.
3. **Estructura Amigable de URLs**:
   - Supresión automática de extensiones `.html` (Clean URLs).
   - Enrutamiento personalizado para páginas de error (404, 500).

## Casos de Uso

### Ejemplo Práctico 1: Configurar servidor de producción para entorno crítico

- **Usuario**: "Necesito el archivo .htaccess de producción para un sistema gubernamental o logístico usando la habilidad de Secure-Fast .htaccess Generator".
- **Comportamiento**: La IA generará el código exacto de Apache en un bloque limpio, configurando todas las políticas de seguridad y optimizaciones de caché requeridas para este entorno.

### Ejemplo Práctico 2: Auditar un archivo existente

- **Usuario**: "Tengo este .htaccess actual de mi proyecto web, ¿puedes reescribirlo siguiendo la habilidad del generador seguro?".
- **Comportamiento**: La IA tomará la base actual pero inyectará todas las cabeceras CSP, HSTS, compresiones Brotli y limpieza de URL estipuladas por la habilidad, eliminando las redundancias.

## Requisitos Operativos

- Actúa sobre infraestructuras y servidores **Apache 2.4+**.
- Es necesario asegurar que los módulos `mod_rewrite`, `mod_headers`, `mod_deflate` y `mod_expires` estén habilitados en el host.
- Salida garantizada como bloque de código limpio, documentado con comentarios técnicos en español, sin preámbulos extensos o explicaciones innecesarias fuera del bloque.
