# Manual de Usuario — SecurityNet

Bienvenido a la guía de operación del sistema de levantamiento de proyectos y cotización de seguridad. A continuación, se detallan los procedimientos para utilizar cada módulo.

---

## 🛠️ 1. Autenticación e Identidad
1. Accede a la plataforma ingresando tus credenciales en el formulario de inicio de sesión.
2. Una vez dentro, el menú lateral izquierdo te permitirá navegar entre los módulos autorizados según tu **Rol** (`ADMIN`, `SELLER`, `TECHNICIAN`, `CLIENT`).

---

## 👥 2. Registro y Gestión de Clientes
El directorio de clientes almacena la información fiscal de las empresas o particulares:
1. Navega a **Clientes** y pulsa en **Registrar Cliente**.
2. Completa los campos obligatorios: **Nombre o Razón Social**, **Identificación Fiscal (R.I.F / DNI)** y **Correo Electrónico**.
3. *Nota:* Para evitar inconsistencias de datos, el sistema no permite eliminar clientes que tengan proyectos activos asociados.

---

## 🛠️ 3. Expediente y Uniformes de Técnicos
El módulo de técnicos está especialmente diseñado para gestionar los perfiles de los instaladores, incluyendo su información fisonómica y tallas para la dotación de uniformes:
1. Ingresa a **Técnicos** (disponible para administradores y vendedores).
2. Pulsa en **Registrar Técnico** para crear tanto su cuenta de acceso como su perfil técnico.
3. Rellena los datos personales: fecha de nacimiento, profesión, nivel de instrucción y dirección residencial.
4. **Fisonomía y Uniformes:** Ingresa las tallas exactas de camisa, pantalón y zapatos, así como la estatura y peso. Esto permite automatizar los pedidos de dotación de equipos de protección personal (EPP) y ropa de trabajo.
5. **Fotografía:** Puedes cargar la foto del técnico directamente desde su perfil, la cual se guardará de forma segura en la base de datos MySQL.

---

## 📁 4. Levantamiento de Proyectos y Croquis
1. Ve a **Proyectos** y pulsa en **Nuevo Proyecto**.
2. Vincula el proyecto a un cliente y asigna un ingeniero o técnico como Technical Manager encargado del levantamiento físico.
3. **Plano / Croquis:** En la pestaña de fotos del proyecto, el instalador puede tomar fotos en terreno o subir el croquis del plano de cámaras. Estas fotos se almacenan nativamente en la base de datos y se utilizarán después como croquis visual en el presupuesto.

---

## 💰 5. Generación de Presupuestos
1. En la vista de un proyecto, haz clic en **Generar Presupuesto**.
2. **Selector de Moneda:** Elige la moneda del presupuesto (`USD`, `CLP`, `MXN`, `COP`, `EUR`). El sistema aplicará de forma automática el factor de tasa de cambio configurado.
3. **Buscador de Catálogo:** Busca productos escribiendo su nombre o SKU. Añade la cantidad requerida. El sistema calculará en tiempo real el precio de venta (costo + margen de ganancia), el subtotal, descuento, IVA y total final.
4. **Historial de Precios Protegido:** Al hacer clic en **Guardar Cotización**, los costos y precios se congelan para esa versión de cotización. De esta forma, si los precios del catálogo cambian mañana, el presupuesto ya enviado al cliente mantendrá sus valores originales intactos.

---

## ⚙️ 6. Personalización del Software (Branding)
Los administradores pueden adaptar la estética de la plataforma a la identidad de su empresa:
1. Ve a **Personalización** en el menú de navegación.
2. **Datos Corporativos:** Actualiza el nombre de tu empresa, teléfono, dirección física, correo y sitio web. Estos datos se inyectarán de forma dinámica en los encabezados de todas las cotizaciones.
3. **Subir Logo:** Carga el logo de tu empresa en formato PNG/JPG. Éste reemplazará automáticamente el logo predeterminado en la plantilla de impresión de presupuestos.
4. **Paleta de Colores:** Selecciona el color primario y el color de acento de la plataforma. La interfaz entera se adaptará a tus colores.
5. **Modo Claro / Oscuro:** Elige el tema visual por defecto o cambia de forma instantánea el tema haciendo clic en el alternador rápido del menú de usuario.

---

## 🖨️ 7. Exportación a PDF e Impresión
1. Abre la cotización que deseas exportar.
2. **Edición Pre-Impresión:** Puedes reescribir cualquier dato del cliente (Atención, RIF, dirección) o la unidad de medida de las filas directamente en la hoja de previsualización antes de imprimir. ¡Los cambios son solo para la impresión y no alteran la base de datos!
3. **Salto de Página Inteligente:** Activa los checks en la parte superior para forzar saltos de página antes de las secciones "Empotramiento", "Servicio Técnico" o "Totales" según la cantidad de ítems.
4. Pulsa en **Imprimir / Guardar PDF**. Se abrirá el diálogo del sistema. En el PDF resultante no se mostrará ningún botón, menú ni borde de formulario; solo la cotización en limpio con el logo, tablas de desglose, plano del proyecto y firmas al pie.

---

## 💻 8. Soporte Técnico y Recepción de Equipos Informáticos
El módulo de soporte gestiona el ciclo completo de revisión y reparación de equipos informáticos (ej. laptops, DVRs, switches):
1. **Registro de Ingreso (Recepción):** Navega a **Soporte Técnico** y haz clic en **Registrar Recepción de Equipo**.
2. **Campos Requeridos:** Rellena los datos obligatorios del equipo (tipo de equipo, marca, modelo, número de serie y descripción detallada de la falla).
3. **Registro Obligatorio de Fotos (Mínimo 2):** Por política de la empresa, debes adjuntar al menos 2 fotos del estado físico del equipo al momento de recibirlo. El sistema procesa y comprime automáticamente las fotos en tu navegador a formato JPEG (redimensionando a un máximo de 1200px) para ahorrar espacio y optimizar la subida.
4. **Asignación a Técnico:** Se puede asignar de inmediato un técnico de reparación o dejarlo pendiente. El técnico asignado recibirá una alerta instantánea en su panel de notificaciones.
5. **Ciclo de Servicio (Estados):**
   - El técnico asignado inicia la revisión cambiando el estado a **"En Revisión"**.
   - Al finalizar, el técnico cambia el estado a **"Reparado"** y debe rellenar un modal detallando de forma obligatoria las **Notas de Reparación / Trabajo Realizado**. Los administradores recibirán una alerta automática al instante.
   - El administrador realiza la entrega formal al cliente cambiando el estado a **"Entregado"**.

---

## 🔔 9. Notificaciones y Alertas en Tiempo Real
1. En la parte superior derecha de la plataforma, dispones de una campana de notificaciones con un indicador numérico en rojo que muestra tus alertas pendientes.
2. El sistema realiza una consulta en segundo plano de forma automática cada 10 segundos para descargar tus nuevas alertas sin necesidad de recargar la página.
3. Haz clic en la campana para abrir la lista flotante de alertas.
4. Puedes hacer clic en una alerta específica para marcarla como leída; el sistema te redireccionará automáticamente a la ficha del equipo en soporte correspondiente.
5. También puedes utilizar el botón **"Marcar todo como leído"** para limpiar tus alertas masivamente.

---

## 📊 10. Exportación de Reportes a Microsoft Excel
La plataforma te permite descargar la información operativa y financiera en archivos de formato CSV optimizados con la cabecera UTF-8 BOM, asegurando que Microsoft Excel los reconozca y abra de forma nativa manteniendo las tildes y eñes correctamente:
1. **Lista de Proyectos:** En el módulo de proyectos, haz clic en **Exportar a Excel** para descargar los proyectos filtrados actualmente.
2. **Cotizaciones del Proyecto:** En el detalle de un proyecto, exporta la lista de cotizaciones y sus estados.
3. **Presupuesto Detallado (Ítems):** En la vista de una cotización, haz clic en **Exportar Detalle a Excel** para descargar una sábana de datos completa del presupuesto, incluyendo SKU, producto, cantidades, precios unitarios, costos unitarios, márgenes aplicados, totales y, para administradores, un desglose detallado de la rentabilidad del proyecto.
