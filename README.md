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
│   │   ├── settings/       # Configuración global del sistema
│   │   └── main.ts         # Punto de entrada NestJS
│   └── package.json
│
├── frontend/
│   ├── public/             # Recursos estáticos e imágenes generadas
│   ├── src/
│   │   ├── app/            # Rutas de Next.js (Dashboard, Autenticación, Proyectos, etc.)
│   │   ├── components/     # Componentes interactivos reutilizables (selectores de iconos, etc.)
│   │   ├── context/        # ConfigContext (personalización de marca) y AuthContext
│   │   ├── hooks/          # Custom hooks para peticiones y sesión
│   │   └── lib/            # Cliente API e integraciones
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
