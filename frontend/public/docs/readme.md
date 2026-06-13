# SecurityNet — Guía Técnica y Arquitectura del Sistema

Esta documentación detalla los aspectos técnicos de la arquitectura del software de la plataforma para la gestión de proyectos de seguridad y generación de presupuestos.

---

## 🚀 Ficha Técnica de la Tecnología

La plataforma está construida utilizando un esquema desacoplado compuesto por:

1. **Base de Datos:** MySQL / MariaDB como motor relacional primario.
2. **Capa ORM:** Prisma ORM (v7.8.0), proporcionando un mapeo de tipos TypeScript estricto, migraciones automáticas y consultas transaccionales.
3. **Servidor API Backend:** NestJS (v11), estructurado con módulos independientes, controladores anotados con Swagger, y guardas de autenticación por Roles.
4. **Cliente Frontend:** Next.js (v16) utilizando App Router, TypeScript, comunicación de APIs mediante cliente asíncrono y estilos con Vanilla CSS premium.

---

## 📂 Estructura General del Proyecto

El código está organizado en dos subproyectos independientes (Backend y Frontend):

```text
proyects_master/
├── backend/                     # Servidor NestJS
│   ├── prisma/                  # Esquema Prisma y scripts de sembrado (seed)
│   ├── src/
│   │   ├── auth/                # Guardas RBAC, JWT, encriptación bcrypt
│   │   ├── catalog/             # Gestión de inventario de equipos y mano de obra
│   │   ├── clients/             # Directorio y datos de clientes
│   │   ├── database/            # Conexión global de base de datos
│   │   ├── images/              # Almacenamiento binario LONGBLOB en MySQL
│   │   ├── projects/            # Fichas de levantamiento técnico
│   │   ├── quotes/              # Motor de cotizaciones y versionamiento
│   │   ├── settings/            # Ajustes globales de personalización corporativa
│   │   └── technicians/         # CRUD de perfiles y tallas de técnicos
│   └── package.json
│
└── frontend/                    # Cliente Next.js (App Router)
    ├── public/                  # Imágenes estáticas y documentos markdown
    │   └── docs/                # Archivos markdown cargados dinámicamente
    ├── src/
    │   ├── app/                 # Layouts y pantallas principales
    │   ├── components/          # Componentes reutilizables
    │   ├── context/             # Proveedores globales de sesión y estilos
    │   └── lib/                 # Cliente de conexión API HTTP
    └── package.json
```

---

## 🔑 Credenciales de Acceso por Defecto

Al ejecutar las migraciones y el comando de sembrado inicial, se generan las siguientes credenciales para realizar pruebas:

* **Administrador (Acceso Total):**
  * **Email:** `admin@securitysystem.com`
  * **Contraseña:** `AdminPassword123`
* **Vendedor / Cotizador:**
  * **Email:** `vendedor@securitysystem.com` (Si se crea a través del panel)
* **Técnico:**
  * **Email:** `tecnico@securitysystem.com` (Si se crea a través del panel de técnicos)

---

## 💻 Comandos de Ejecución Local

Para levantar el entorno completo de desarrollo en tu máquina local:

1. **Configurar Base de Datos MySQL:** Asegura que MySQL esté activo en el puerto local `3306`.
2. **Generar base de datos y migrar:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```
3. **Poblar datos iniciales:**
   ```bash
   npx ts-node prisma/seed.ts
   ```
4. **Correr servidores de desarrollo (Frontend + Backend concurrentes):**
   Regresa a la raíz del repositorio (`proyects_master/`) y ejecuta:
   ```bash
   npm run dev
   ```

El backend se levantará en [http://localhost:3000/api](http://localhost:3000/api) y el frontend en [http://localhost:4000](http://localhost:4000). Puedes consultar la documentación Swagger de los endpoints en [http://localhost:3000/api/docs](http://localhost:3000/api/docs).
