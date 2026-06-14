# Manipulación y Creación Avanzada de DOCX (Nivel Súper Senior)

> **Firma de autoría**: Creado por Diego Bravo (<https://github.com/Eghost1>).

## Índice de Contenidos

1. [Descripción y Propósito](#descripción-y-propósito)
2. [Funcionalidades Principales](#funcionalidades-principales)
3. [Casos de Uso](#casos-de-uso)
4. [Requisitos o Directrices Operativas](#requisitos-o-directrices-operativas)

---

## Descripción y Propósito

La habilidad **DOCX Pro** proporciona las directrices necesarias para crear, analizar, editar y manipular de manera quirúrgica y a nivel de producción documentos de Microsoft Word (`.docx`). Evadiendo soluciones pre-fabricadas ineficientes, se aprovecha del conocimiento subyacente del esquema XML (OpenXML) para mantener formatos estables y evitar corrupciones de archivo.

## Funcionalidades Principales

- **Creación Programática Compleja**: Renderizado de documentos desde cero con `docx-js`, configurando tipografías, alineaciones de red (Norteamericano/Pulgadas a DXA), tablas avanzadas e índices.
- **Edición Estructural de XML Puro**: Dominio de la técnica de empaquetado/desempaquetado ZIP-XML ("Unpack -> Edit document.xml -> Repack") para modificar documentos corporativos con layouts existentes sin afectar configuraciones del formato.
- **Lógica de "Control de Cambios" (Track Changes)**: Inserción directa de sintaxis de autor, inserciones (`<w:ins>`), eliminaciones (`<w:del>`) y bloques de comentarios programáticos.
- **Conversiones Nativas Robustas**: Instrucciones para orquestar motores híbridos (`pandoc`, scripts headless de `LibreOffice` y utilidades de Poppler) asegurando extracción de texto limpio y rastreable.

## Casos de Uso

### Caso 1: Generación de Facturas Complejas desde Cero

* **Contexto**: Un script requiere generar dinámicamente archivos DOCX de cientos de páginas con anchos de tabla súper estrictos y en formato A4 con índices generados.
- **Acción**: El sistema orquesta `docx-js`, declarando variables en DXA para los `columnWidths`, creando mallas de tablas que no se corrompen y configurando el nivel de contorno (`outlineLevel`) para la autogeneración de los *TableOfContents*.

### Caso 2: Alteración de un Contrato Preexistente

* **Contexto**: Insertar cláusulas y firmas dentro de una plantilla `.docx` que tiene macros, marcas de agua avanzadas y márgenes de diseño institucional rígidos.
- **Acción**: Mediante el flujo "Unpack → Editar XML subyacente (`document.xml`) → Repack", se esquiva el parser genérico inyectando la nueva etiqueta `<w:p>` logrando preservar 100% el Layout original del creador.

### Caso 3: Intervención de Revisión (Inserción Visual)

* **Contexto**: Dejar comentarios editoriales interactivos y control de cambios visual sobre una propuesta de proyecto enviada en `.docx`.
- **Acción**: Escribir en el esquema XML interno inserciones `<w:ins>` o envolver pasajes borrados con `<w:del>` emulando la estructura nativa para que el humano las procese desde Microsoft Word o Google Docs nativamente.

## Requisitos o Directrices Operativas

- NUNCA editar propiedades o envolturas XML con heurísticas ciegas (como regex simple); se debe considerar o validar el cierre de tags de Párrafos (`<w:p>`) y Segmentos de Texto (`<w:r>`).
- En creación `docx-js`, no inyectar "bullet points" como caracteres Unicode sueltos, se debe usar siempre los "numbering configs" nativos.
- Utilizar Entidades XML pre-computadas para el manejo de caracteres especiales tipográficos norteamericanos o localizados.
