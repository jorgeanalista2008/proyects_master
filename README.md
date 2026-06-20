# Nexxos.pro — Sistema de Gestión de Proyectos y Presupuestos

Plataforma premium para la gestión y control operativo de proyectos de instalación tecnológica (CCTV, redes, alarmas, etc.), presupuestos, cotizaciones, roles de usuario, y documentación técnica personalizada.

Este repositorio está organizado como un monorepositorio con dos partes principales:
*   **Backend**: API REST robusta construida con NestJS, Prisma ORM y bases de datos relacionales (MariaDB).
*   **Frontend**: Interfaz de usuario premium y reactiva construida con Next.js (App Router), TailwindCSS y Material-UI (MUI).

---

## 🛠️ Tecnologías Principales

### Backend
*   **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
*   **Base de datos**: MariaDB
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Autenticación**: JSON Web Tokens (JWT) & bcrypt
*   **Documentación**: Swagger UI (disponible en `/api/docs`)

### Frontend
*   **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
*   **Estilos**: TailwindCSS & Material-UI (MUI v6)
*   **Iconografía**: Material Design Icons (MDI) a través de Iconify
*   **Estado**: React Context (Auth, Config)

---

## 🚀 Inicio Rápido (Desarrollo)

### Requisitos Previos
*   [Node.js](https://nodejs.org/) (v18 o superior)
*   [npm](https://www.npmjs.com/)
*   Una instancia de MariaDB activa.

### 1. Clonar el repositorio
```bash
git clone https://github.com/jorgeanalista2008/proyects_master.git
cd proyects_master
```

### 2. Instalar Dependencias
Instala todas las dependencias del backend y frontend de manera automática usando el script de la raíz:
```bash
npm run install:all
```

### 3. Configuración de Variables de Entorno

#### Backend
Crea un archivo `.env` dentro de la carpeta `/backend` y define la conexión a tu base de datos y la clave secreta JWT:
```env
DATABASE_URL="mysql://usuario:password@localhost:3306/nexxos_db"
JWT_SECRET="tu_super_secreto_aqui"
PORT=3000
```

#### Frontend
Crea un archivo `.env.development` dentro de la carpeta `/frontend` para definir la URL del API de backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Inicializar Base de Datos (Backend)
Genera el cliente de Prisma, ejecuta las migraciones iniciales y aplica las semillas (seeds) para poblar el sistema con roles y usuarios por defecto:
```bash
cd backend
npx prisma db push
npx prisma db seed
cd ..
```

### 5. Ejecutar la Aplicación en Desarrollo
Puedes correr ambos servidores (NestJS y Next.js) simultáneamente desde la raíz del proyecto usando:
```bash
npm run dev
```

*   **Frontend**: Corriendo en [http://localhost:4000](http://localhost:4000)
*   **Backend**: Corriendo en [http://localhost:3000](http://localhost:3000)
*   **Documentación API (Swagger)**: Disponible en [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 📁 Estructura del Proyecto

```
proyects_master/
├── backend/
│   ├── prisma/             # Esquema de la Base de datos y Semillas (Seed)
│   ├── src/
│   │   ├── auth/           # Gestión de autenticación JWT y control de accesos
│   │   ├── users/          # Controlador y servicio de gestión de usuarios
│   │   ├── projects/       # Flujo de proyectos y tareas
│   │   ├── quotes/         # Gestión de cotizaciones y productos
│   │   ├── equipments/     # Módulo de Soporte y Recepción de Equipos Informáticos
│   │   ├── suppliers/      # Módulo de Gestión de Proveedores
│   │   ├── settings/       # Configuración global del sistema
│   │   └── main.ts         # Punto de entrada NestJS
│   └── package.json
│
├── frontend/
│   ├── public/             # Recursos estáticos e imágenes generadas
│   ├── src/
│   │   ├── app/            # Rutas Next.js (Dashboard, Proyectos, Equipos, Proveedores, etc.)
│   │   ├── components/     # Componentes interactivos reutilizables (selectores de iconos, etc.)
│   │   ├── context/        # ConfigContext (personalización de marca) y AuthContext
│   │   ├── hooks/          # Custom hooks para peticiones y sesión
│   │   └── lib/            # Cliente API e integraciones de compresión
│   └── package.json
│
├── package.json            # Scripts globales de ejecución
└── README.md               # Este archivo de documentación
```

---

## ✨ Características Destacadas

1.  **Personalización de Marca en Caliente**: El sistema reemplaza de forma dinámica el título del sistema (`document.title`) y las referencias en la documentación técnica con el nombre de marca por defecto (`Nexxos.pro`).
2.  **Selector Dinámico de Iconos de Material Design**: Integración directa con Iconify para buscar y seleccionar cualquier icono oficial de Material Design para cada módulo de la plataforma.
3.  **Métricas Basadas en Roles (RBAC)**: Los paneles del dashboard están optimizados. Los técnicos solo visualizan métricas, estados de instalación y proyectos asignados directamente, ocultando de forma segura la información y gráficos financieros reservados para administradores.
4.  **Generación de Facturas y Cotizaciones**: Permite cambiar el estado de las cotizaciones a `APPROVED` o `REJECTED`, ofreciendo una visualización estructurada e impresión limpia y optimizada para PDFs de facturas.
5.  **Módulo de Soporte Técnico (Recepción de Equipos)**: Ciclo completo para el soporte de equipos informáticos (Recibido -> Asignado -> En Revisión -> Reparado -> Entregado).
    *   **Registro Obligatorio de Fotos**: Exige subir al menos 2 fotos del equipo al recibirlo, mostrando alertas del lado del cliente.
    *   **Procesamiento de Imágenes en el Cliente**: Convierte y comprime automáticamente las imágenes seleccionadas a JPEG a través de un Canvas de HTML5 en el navegador (redimensionando a un máximo de 1200px y calidad del 80%) antes de enviarse por red. Esto evita el error de red `write ECONNRESET` y ahorra espacio de base de datos.
    *   **Reportes de Trabajo**: Obliga al técnico a detallar mediante notas técnicas el trabajo realizado para poder marcar el equipo como Reparado.
6.  **Sistema de Alertas y Notificaciones (Bell Menu)**:
    *   Icono de campana con badge dinámico de notificaciones no leídas en el encabezado del panel superior.
    *   Polling de fondo cada 10 segundos para descargar alertas del usuario autenticado.
    *   Acción de marcado individual como leído (redireccionando automáticamente a la ficha del equipo en soporte) y de marcado masivo.
    *   Alertas automáticas: notifica al técnico al ser asignado y a los administradores al completarse la reparación.
7.  **Exportación a Microsoft Excel**:
    *   Botones de descarga integrados en la lista de proyectos, cotizaciones por proyecto e ítems presupuestarios de cotizaciones individuales.
    *   Genera archivos CSV codificados con la cabecera UTF-8 BOM (`\ufeff`) para garantizar que Microsoft Excel abra los archivos y renderice tildes y caracteres especiales de forma nativa e inmediata.
    *   El reporte de ítems incluye costos, cantidades, SKU, márgenes, totales de cotización y métricas de rentabilidad total.
