# Diccionario de Datos — MySQL / Prisma Schema

Este documento detalla la estructura física de la base de datos relacional MySQL / MariaDB utilizada por el sistema, describiendo cada tabla, sus columnas, tipos de datos, restricciones y relaciones semánticas.

---

## 🏷️ Tabla: `Role`
Almacena los roles de seguridad de la aplicación para el control de acceso basado en roles (RBAC).

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `name` | `VARCHAR(191)` | No | Nombre del Rol (`ADMIN`, `SELLER`, `TECHNICIAN`, `CLIENT`). Único. |
| `description`| `VARCHAR(191)` | Sí | Descripción corta de los permisos del rol |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación del registro (default: `now()`) |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## 👤 Tabla: `User`
Almacena los usuarios registrados en el sistema con sus credenciales encriptadas.

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `email` | `VARCHAR(191)` | No | Correo electrónico de acceso. Único e indexado. |
| `passwordHash`| `VARCHAR(191)` | No | Hash de contraseña encriptada con `bcrypt` |
| `firstName` | `VARCHAR(191)` | No | Nombre del usuario |
| `lastName` | `VARCHAR(191)` | No | Apellido del usuario |
| `phone` | `VARCHAR(191)` | Sí | Teléfono de contacto |
| `isActive` | `TINYINT(1)` | No | Estado de activación de la cuenta (default: `true`) |
| `roleId` | `VARCHAR(191)` | No | Llave Foránea vinculada a la tabla `Role` |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## 👥 Tabla: `Client`
Almacena la información de los clientes para la generación de proyectos y presupuestos.

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `name` | `VARCHAR(191)` | No | Nombre completo o Razón Social del cliente |
| `rutOrId` | `VARCHAR(191)` | No | Cédula, R.I.F, DNI o RUT fiscal. Único. |
| `email` | `VARCHAR(191)` | No | Correo electrónico de facturación y contacto |
| `phone` | `VARCHAR(191)` | No | Teléfono de contacto |
| `address` | `TEXT` | Sí | Dirección fiscal / residencial |
| `city` | `VARCHAR(191)` | Sí | Ciudad o municipio |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## 📦 Tabla: `Product`
Catálogo maestro de productos (cámaras, cables, accesorios) y servicios (horas técnicas, traslados).

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `sku` | `VARCHAR(191)` | No | Código único de inventario / referencia de fábrica. Único. |
| `name` | `VARCHAR(191)` | No | Nombre comercial del producto o servicio |
| `description`| `TEXT` | Sí | Detalles o especificaciones técnicas |
| `category` | `VARCHAR(191)` | No | Categorías (`CAMERA`, `DVR_NVR`, `CABLE`, `TUBING`, `ACCESSORY`, `LABOR`, `SERVICE`) |
| `unitCost` | `DECIMAL(12,4)`| No | Costo neto de adquisición para la empresa sin IVA |
| `margin` | `DECIMAL(5,2)` | No | Porcentaje de utilidad / ganancia esperado (ej. `35.00` para 35%) |
| `salePrice` | `DECIMAL(12,4)`| No | Precio sugerido de venta al cliente sin IVA (calculado automáticamente) |
| `isActive` | `TINYINT(1)` | No | Habilitado para cotización (default: `true`) |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## 📁 Tabla: `Project`
Agrupa las gestiones de cotizaciones y levantamientos técnicos para un cliente específico.

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `name` | `VARCHAR(191)` | No | Nombre descriptivo del proyecto o sitio (ej. "Instalación CCTV Sucursal Centro") |
| `description`| `TEXT` | Sí | Objetivos y requerimientos detallados del cliente |
| `status` | `VARCHAR(191)` | No | Estado del flujo (`PENDING`, `QUOTED`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) |
| `clientId` | `VARCHAR(191)` | No | Llave Foránea vinculada a la tabla `Client` |
| `managerId` | `VARCHAR(191)` | Sí | Llave Foránea vinculada a `User` (Ingeniero/Técnico asignado) |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## 💰 Tabla: `Quote`
Representa una versión de cotización específica generada para un proyecto.

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `projectId` | `VARCHAR(191)` | No | Llave Foránea vinculada a `Project` (eliminación en cascada) |
| `version` | `INT` | No | Número correlativo de versión por proyecto (1, 2, 3...) |
| `status` | `VARCHAR(191)` | No | Estado de aprobación (`DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `EXPIRED`) |
| `isActive` | `TINYINT(1)` | No | Marca si es la versión activa o bajo evaluación del cliente |
| `currency` | `VARCHAR(191)` | No | Moneda del presupuesto (default: `USD`, `CLP`, `MXN`, `COP`, `EUR`) |
| `exchangeRate`| `DECIMAL(12,4)`| No | Tasa de cambio aplicada al momento de guardar (default: `1.0000`) |
| `subtotal` | `DECIMAL(12,4)`| No | Suma neta de todos los ítems cotizados |
| `taxRate` | `DECIMAL(5,2)` | No | Porcentaje de IVA/impuesto aplicado (default: `19.00` para 19%) |
| `taxAmount` | `DECIMAL(12,4)`| No | Monto calculado de IVA cobrado |
| `discount` | `DECIMAL(12,4)`| No | Descuento total deducido del subtotal |
| `total` | `DECIMAL(12,4)`| No | Monto total final en la moneda del presupuesto |
| `totalCost` | `DECIMAL(12,4)`| No | Costo total consolidado de adquisición de equipos y servicios |
| `marginAmount`| `DECIMAL(12,4)`| No | Utilidad neta proyectada en la moneda del presupuesto |
| `createdById` | `VARCHAR(191)` | No | Llave Foránea vinculada a `User` (Creador del presupuesto) |
| `validUntil` | `DATETIME(3)` | Sí | Fecha límite de validez de los precios |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## 🏷️ Tabla: `QuoteItem`
Ítems o productos individuales incluidos dentro de una versión de cotización (valores congelados).

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `quoteId` | `VARCHAR(191)` | No | Llave Foránea vinculada a `Quote` (eliminación en cascada) |
| `productId` | `VARCHAR(191)` | No | Llave Foránea vinculada a `Product` |
| `quantity` | `DECIMAL(10,2)`| No | Cantidad cotizada de unidades |
| `unitCost` | `DECIMAL(12,4)`| No | Costo unitario de inventario congelado al cotizar |
| `unitPrice` | `DECIMAL(12,4)`| No | Precio unitario de venta congelado al cotizar |
| `margin` | `DECIMAL(5,2)` | No | Margen de ganancia unitario congelado |
| `subtotal` | `DECIMAL(12,4)`| No | Subtotal de la fila (cantidad * precio unitario) |

---

## 📷 Tabla: `Image`
Almacenamiento binario unificado para fotos de catálogo, levantamientos técnicos y logos.

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `fileName` | `VARCHAR(191)` | No | Nombre original del archivo subido |
| `mimeType` | `VARCHAR(191)` | No | Tipo MIME (ej. `image/png`, `image/jpeg`) |
| `fileData` | `LONGBLOB` | No | Almacenamiento binario del archivo de imagen |
| `type` | `VARCHAR(191)` | No | Categorización (`PRODUCT_THUMBNAIL`, `PROJECT_SURVEY`, `TECHNICIAN_PHOTO`, `COMPANY_LOGO`) |
| `productId` | `VARCHAR(191)` | Sí | Llave Foránea a `Product` (nulo si es plano o foto de perfil) |
| `projectId` | `VARCHAR(191)` | Sí | Llave Foránea a `Project` (nulo si es foto de catálogo o perfil) |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación del registro |

---

## 🛠️ Tabla: `TechnicianProfile`
Almacena los perfiles específicos de dotación y personales de los técnicos del sistema.

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID) |
| `userId` | `VARCHAR(191)` | No | Llave Foránea vinculada a `User` (1:1 relación única) |
| `documentNumber`|`VARCHAR(191)`| No | Documento de identidad fiscal/RUT técnico. Único. |
| `birthDate` | `DATETIME(3)` | Sí | Fecha de nacimiento |
| `academicLevel`| `VARCHAR(191)` | Sí | Instrucción académica (Secundaria, Técnico, etc.) |
| `profession` | `VARCHAR(191)` | Sí | Profesión del instalador |
| `trade` | `VARCHAR(191)` | Sí | Especialidad u oficio del instalador |
| `address` | `TEXT` | Sí | Dirección residencial |
| `landmark` | `TEXT` | Sí | Punto de referencia de su domicilio |
| `shirtSize` | `VARCHAR(191)` | Sí | Talla de camisa del técnico (ej. S, M, L, XL) |
| `pantsSize` | `VARCHAR(191)` | Sí | Talla de pantalón (ej. 30, 32, 40) |
| `shoeSize` | `VARCHAR(191)` | Sí | Talla de calzado / zapatos (ej. 38, 40, 42) |
| `weight` | `DOUBLE` | Sí | Peso corporal del técnico en Kilogramos (Kg) |
| `height` | `DOUBLE` | Sí | Estatura/altura del técnico en metros (m) |
| `photoId` | `VARCHAR(191)` | Sí | ID de imagen de perfil del técnico (relación única) |
| `createdAt` | `DATETIME(3)` | No | Fecha de creación |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última actualización |

---

## ⚙️ Tabla: `SystemConfig`
Configuración global de branding corporativo y colores de la plataforma (una única fila `"global"`).

| Columna | Tipo de Datos | Nulo | Descripción / Restricción |
| :--- | :--- | :---: | :--- |
| `id` | `VARCHAR(191)` | No | Llave Primaria (UUID / fija en `"global"`) |
| `appName` | `VARCHAR(191)` | No | Nombre formal de la empresa instaladora |
| `phone` | `VARCHAR(191)` | Sí | Teléfono de contacto formal de la empresa |
| `email` | `VARCHAR(191)` | Sí | Correo electrónico corporativo |
| `address` | `VARCHAR(191)` | Sí | Dirección física principal de la empresa |
| `logoId` | `VARCHAR(191)` | Sí | Enlace a la imagen en la tabla `Image` |
| `website` | `VARCHAR(191)` | Sí | Sitio web corporativo |
| `primaryColor` | `VARCHAR(191)` | No | Color primario en formato hexadecimal (ej. `#1e3a8a`) |
| `accentColor` | `VARCHAR(191)` | No | Color de acento en formato hexadecimal (ej. `#94a3b8`) |
| `defaultTheme` | `VARCHAR(191)` | No | Tema predeterminado (`dark` o `light`) |
| `updatedAt` | `DATETIME(3)` | No | Fecha de última modificación |
