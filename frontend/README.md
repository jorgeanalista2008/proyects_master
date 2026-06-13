# Next.js Frontend: Sistema de Gestión de Proyectos y Presupuestos

Este es el frontend interactivo de la plataforma web de gestión de proyectos de seguridad electrónica e infraestructura. Está construido en **Next.js (App Router)** y está adaptado visualmente para replicar con alta fidelidad la plantilla oficial **"Vuexy - MUI Next.js Admin Template"**, utilizando un sistema de tokens de diseño moderno sobre Vanilla CSS para un rendimiento e interactividad ultra-rápidos.

---

## 🎨 Características de Diseño y Experiencia de Usuario (UX)

### 1. Panel de Inicio estilo Vuexy CRM Dashboard (Demo 2)
La pantalla de inicio (`/`) se ha diseñado siguiendo el layout corporativo de la versión CRM de Vuexy en 3 filas:
* **Fila 1 (Métricas de Venta y Tráfico):**
  * *Presupuestos:* Tarjeta de 3 columnas que muestra el volumen de presupuestos y un mini-gráfico de líneas SVG (sparkline) junto con un indicador de estrellas basado en el win-rate.
  * *Levantamientos:* Tarjeta de 3 columnas con cantidad de levantamientos en campo y un mini-gráfico de barras.
  * *Estadísticas Comerciales:* Tarjeta de 6 columnas con KPIs circulares (Ventas, Proyectos, Conversión y Margen).
* **Fila 2 (Crecimiento y Utilidades):**
  * *Crecimiento de Margen:* Gráfico de anillo circular SVG mostrando el margen neta retenido respecto a costos.
  * *Reporte de Ganancias:* Gráfico interactivo mensual de doble barra (Ingresos vs Costos) con **tooltips HTML reactivos** al hacer hover.
* **Fila 3 (Control y Avance):**
  * *Control de Obras:* Indicador radial SVG del progreso de obras culminadas.
  * *Especialidades:* Desglose de demanda técnica (CCTV 45%, Cercos 30%, Redes 25%).
  * *Proyectos Recientes:* Tabla estructurada con avatares de iniciales dinámicos de clientes y badges de estados coloreados de Vuexy.

### 2. Constructor de Presupuestos Workspace (Split-Panel)
Ubicado en `/projects/[id]/quotes/new`, el presupuestador cuenta con una pantalla dividida (45/55):
* **Panel Izquierdo (Selección de Equipos y Planos):** Pestañas para añadir cámaras, grabadores o cableado directamente en un clic, además de revisar planos de planos en caliente.
* **Panel Derecho (Hoja de Cotización):** Selector interactivo para aplicar tres niveles de precios (**Contado, Crédito, Preferencial**) por artículo, tasas de impuestos variables, y un **semáforo de rentabilidad** comercial (Verde >=35%, Amarillo >=20%, Rojo <20% de ganancia).

### 3. Ficha de Exportación en Impresión PDF
En `/projects/[id]/quotes/[quoteId]` se despliega la plantilla formal de cotización estilo TP-Link/Guslaya:
* Los ítems se agrupan de forma automática en 3 tablas: **Equipos de Tecnología**, **Empotramiento/Canalización** y **Mano de Obra**.
* Muestra imágenes de referencia visual (`Ref Visual`) consumidas directamente en binario del servidor.
* Edición interactiva directa sobre la ficha (garantías, números, validez) cuyos formularios se ocultan al presionar Ctrl+P para entregar una hoja limpia.

### 4. Gestión Dinámica de Accesos y Menús (PBAC)
El Sidebar lateral consume en tiempo real el endpoint del backend `GET /roles/my-menu` para estructurar la barra de navegación del usuario. Los administradores disponen de una sección exclusiva `/roles` para crear perfiles, marcar permisos del backend (ej. `projects:write`) y asignar qué menús ve cada rol de forma interactiva.

---

## ⚙️ Configuración y Despliegue

### 1. Variables de Entorno
Crea un archivo `.env.development` o `.env.production` en la carpeta `frontend/` indicando la ruta del backend:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 2. Desarrollo Local
Instala las dependencias y ejecuta el servidor local (configurado para correr por defecto en el puerto `4000`):

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo
npm run dev
```

Abre **[http://localhost:4000](http://localhost:4000)** en tu navegador web para acceder a la aplicación.

### 3. Compilación de Producción
Para validar los tipos estáticos de TypeScript y generar el bundle optimized de Next.js ejecuta:
```bash
npm run build
```
Las rutas dinámicas (como `/projects/[id]`) se renderizarán bajo demanda del servidor, mientras que las fijas (como `/analytics` y `/roles`) se pre-renderizan de forma estática para una velocidad máxima de carga.
