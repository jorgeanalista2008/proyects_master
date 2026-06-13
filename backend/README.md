# NestJS Backend: Sistema de Gestión de Proyectos y Presupuestos

Este es el backend modular del sistema de presupuestos y gestión de proyectos para empresas de seguridad electrónica e instalación de infraestructura (CCTV, cercos eléctricos, redes). Está construido en **NestJS**, utiliza **Prisma ORM** para interactuar con la base de datos relacional **MySQL** e implementa seguridad mediante **JWT** y control de acceso dinámico basado en permisos (PBAC).

---

## 🛠️ Stack Tecnológico
* **Framework:** NestJS (modular, TypeScript).
* **ORM:** Prisma ORM v7+.
* **Base de Datos:** MySQL / MariaDB (puerto por defecto `3306`).
* **Seguridad:** Encriptación de contraseñas con `bcrypt` y firmas con tokens JWT.
* **Documentación:** Swagger OpenAPI.

---

## 📂 Estructura de Módulos
El backend está organizado de manera modular bajo el directorio `src/`:

* **`database/`:** Provee `PrismaService` como un proveedor global inyectable para interactuar con MySQL.
* **`auth/`:** Maneja el login, validación de credenciales con `bcrypt`, firmas de token JWT y expone:
  * El decorador `@Permissions(...permissions: string[])` para endpoints.
  * La guarda `PermissionsGuard` que verifica dinámicamente en base de datos si el perfil asignado al usuario cuenta con la autorización requerida.
* **`users/`:** Registro, edición y listado de cuentas de usuario del sistema.
* **`roles/`:** Core de administración del sistema RBAC/PBAC. Permite la creación y actualización dinámica de Perfiles (Roles), Permisos del sistema y estructura dinámica de la barra de navegación lateral. Expone el endpoint crucial `/roles/my-menu`.
* **`clients/`:** Directorio de clientes con control de integridad referencial.
* **`catalog/`:** CRUD de equipos y servicios. Calcula de forma automática tres tipos de precio de venta recomendados (Al Contado, A Crédito, Preferencial) en base al costo y márgenes independientes definidos.
* **`projects/`:** Control de fichas técnicas de obras, planos y control de privacidad según el rol asignado.
* **`quotes/`:** Motor transaccional de cotizaciones. Permite congelar los precios del inventario, soporta el versionado incremental de presupuestos por proyecto, multimoneda con tasas de cambio (`exchangeRate`), desglose por IVA e indicador de rentabilidad comercial.
* **`images/`:** Gestor de almacenamiento binario nativo. Guarda las fotos de técnicos y planos de levantamiento directamente en base de datos en formato `LONGBLOB` (`Bytes`), sirviéndolas con tipo de cabecera MIME dinámico.
* **`analytics/`:** Módulo de agregación de métricas de rentabilidad consolidada y cálculo de conversiones a moneda base USD para visualización en dashboards.

---

## ⚙️ Configuración e Inicialización

### 1. Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz de la carpeta `backend/` con los siguientes parámetros:

```env
DATABASE_URL="mysql://root:password@localhost:3306/projects_master_db"
JWT_SECRET="super-secret-key-change-in-production"
PORT=3000
```

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Sincronización de Base de Datos
Ejecuta el siguiente comando para crear las tablas en tu servidor MySQL local y regenerar el Prisma Client de forma automática:
```bash
npx prisma db push
```

### 4. Poblamiento de Base de Datos (Seeding)
Inserta los permisos del sistema, los elementos de navegación iniciales, perfiles por defecto (`ADMIN`, `SELLER`, `TECHNICIAN`, `CLIENT`), el usuario administrador principal y productos de muestra ejecutando:
```bash
npx prisma db seed
```

---

## 🚀 Ejecución del Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Compilación para producción
npm run build

# Modo producción
npm run start:prod
```

---

## 📚 Documentación de API (Swagger)
El backend cuenta con Swagger interactivo configurado de forma nativa. Una vez que el servidor esté en marcha, puedes acceder a la documentación interactiva y probar los endpoints en:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

> **Nota:** Para consumir endpoints protegidos, realiza login en el endpoint `/api/auth/login`, copia el token `access_token` retornado e inyéctalo usando el botón **Authorize** en la interfaz de Swagger.
