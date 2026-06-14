---
name: docx-pro
description: Habilidad avanzada para la creación, lectura, edición y manipulación exhaustiva de documentos de Word (.docx) a nivel súper senior.
---

# Manipulación y Creación Avanzada de DOCX (Nivel Súper Senior)

Esta habilidad capacita al agente para crear, editar, analizar y manipular documentos de Microsoft Word (`.docx`) aplicando las mejores prácticas, un profundo entendimiento de la estructura XML subyacente (OpenXML) y el uso de herramientas modernas (`docx-js`, `pandoc`, etc.).

## Cuándo usar esta habilidad

- Cuando el usuario solicite crear documentos profesionales (reportes, memorandos, cartas) con formatos complejos (índices, numeración, tablas, encabezados).
- Para leer, extraer o reorganizar contenido de archivos `.docx` de forma segura.
- Cuando se necesite editar archivos Word existentes manipulando el XML interno (preservando cambios en control de revisiones y el esquema de formato original).
- Al requerir conversiones (ej. de `.doc` a `.docx`, o de `.docx` a PDF e imágenes).
- En tareas de buscar y reemplazar texto avanzado, trabajar con control de cambios o manipular comentarios en Word de forma programática.
- **NOTA**: NO usar para PDFs genéricos sin relación con Word, hojas de cálculo, Google Docs, o tareas de código que no involucren generación/modificación de documentos.
- **ALINEACIÓN VISUAL**: Antes de generar, escanea los archivos de estilo del proyecto (`.css`, `.html`, `.json` de branding) para extraer la paleta de colores, logos y tipografías. Si no se encuentran, consulta al usuario.

## Arquitectura y Proceso de Trabajo

Un archivo `.docx` es inherentemente un archivo ZIP que contiene una jerarquía de archivos XML.

### 1. Referencia Rápida

| Tarea | Enfoque Recomendado |
|-------|---------|
| Leer/analizar contenido | Usar `pandoc` o descomprimir para leer el XML puro |
| Crear nuevo documento | Generación programática utilizando `docx-js` |
| Editar documento existente | Descomprimir → Editar XML `document.xml` → Volver a comprimir |

### 2. Comandos Útiles y Conversión

- **Convertir `.doc` a `.docx` (Requiere pre-procesamiento para legacy)**:

  ```bash
  python scripts/office/soffice.py --headless --convert-to docx document.doc
  ```

- **Extracción de texto (Con control de cambios integrado)**:

  ```bash
  pandoc --track-changes=all document.docx -o output.md
  ```

- **Acceso a XML puro**:

  ```bash
  python scripts/office/unpack.py document.docx unpacked/
  ```

- **Aceptar todos los cambios (Requiere LibreOffice Backend)**:

  ```bash
  python scripts/accept_changes.py input.docx output.docx
  ```

### 3. Creación de Nuevos Documentos (vía `docx-js`)

Al generar documentos desde cero, utiliza bibliotecas en JavaScript o TypeScript (`npm install -g docx`) siguiendo estas reglas críticas, pues el renderizador de Word es un ecosistema muy estricto:

#### Reglas de Validación y Renderizado (Súper Senior)

- **Tamaños de Página Explícitos**: `docx-js` usa tamaño A4 por defecto. Si interactúas con un contexto norteamericano o que requiere formato estándar de carta, fuerza "US Letter" definiendo `width: 12240` y `height: 15840` en unidades DXA (1440 DXA = 1 pulgada).
- **Manejo de Landscape (Apaisado)**: Invierta las medidas pasando el lado corto como `width` y el largo como `height`, junto con `orientation: PageOrientation.LANDSCAPE`. El parser interno swap-eará las medidas correctamente.
- **Listas Libres de Caracteres Unicode**: **JAMÁS** escriba viñetas manualmente en texto (`•` o `\u2022`). Utilice la configuración de numeración interna estableciendo un `numbering config` con `LevelFormat.BULLET`.
- **Anchos de Tablas Duales (Definición Crítica)**: Las tablas en `.docx` requieren configurar de forma simultánea los `columnWidths` a nivel de la tabla (y asegurar que la suma es el ancho exacto del bloque) **Y** la propiedad `width` detallada en cada uno de los `TableCell`. Ambos deben usar `WidthType.DXA` (NUNCA usar `PERCENTAGE` para evitar romper la retrocompatibilidad con procesadores como Google Docs). Use siempre `ShadingType.CLEAR` para evitar colisiones de fondo.
- **Tipografía, Índices y Estilos**: Inyecte estilos base sobreescribiendo identificadores predefinidos exactos (ej. `id: "Heading1"`, `id: "Heading2"`) e inyecte siempre la propiedad `outlineLevel` apropiada (0, 1, etc.) a nivel del párrafo. Este es el prerrequisito para que herramientas algorítmicas de índice y `TableOfContents` funcionen adecuadamente y de forma hipervinculada sin generar una tabla estática corrupta.

### 4. Edición de Documentos Existentes (Nivel Archivo/XML)

La alteración o inyección en un `.docx` empresarial preexistente requiere utilizar la técnica Unpack -> Edit -> Repack. Evita usar librerías de terceros que intenten parsear el archivo completo en memoria si se requiere retener propiedades avanzadas originarias del autor de la plantilla.

#### Paso 1: Acción de Descomprimir

```bash
python scripts/office/unpack.py document.docx unpacked/
```

*(Este script asume la abstracción de extraer el XML, indentarlo, fusionar etiquetas `<w:r>` adyacentes para limpieza cognitiva y asegurar que símbolos complejos como comillas inteligentes sean convertidos inmediatamente a entidades XML).*

#### Paso 2: Edición Estructural Avanzada (XML)

Navega e inyecta la lógica en los archivos bajo `unpacked/word/` (como `document.xml`).

- **Inyección y Control de Cambios (Tracked Changes)**: Nunca introduzcas metadatos o etiquetas de control de revisión en el scope interno de una etiqueta `<w:r>`. El estándar obliga a reemplazar o envolver todo el componente dentro del pipeline como nodos hermanos de inserción y borrado:
  - **Inserciones**: `<w:ins w:id="X" w:author="Nombre" w:date="..."><w:r><w:t>texto nuevo</w:t></w:r></w:ins>`
  - **Borrado**: `<w:del w:id="Y" w:author="Nombre" w:date="..."><w:r><w:delText>texto borrado</w:delText></w:r></w:del>`
- **Comentarios en Flujo de Lectura**: Los marcadores de delimitación (tags `<w:commentRangeStart>` y `<w:commentRangeEnd>`) deben insertarse siempre como HIJOS DIRECTOS a nivel de la raíz de bloque del párrafo `<w:p>`, y jamás rompiendo la continuidad interna del `<w:r>`. Se recomienda valerse de `scripts/comment.py` para abstraer correctamente el enlazamiento iterativo.
- **Convenciones Tipográficas (Comillas Inteligentes e idions)**: Si vas a añadir texto que incluye comillas y apóstrofes ingleses, usa entidades XML preescaneadas explícitamente para impedir que Word las interprete como caracteres incompatibles en diferentes 'locales': Usa `&#x201C;` para “, `&#x201D;` para ”, y `&#x2019;` para ’.
- **Borrado de Párrafos Enteros**: Para remover enteramente la estructura de lista o viñetas heredada al eliminar el contenido, en la estructura XML es imperativo que apliques un inserto `<w:del/>` al inicio de `<w:pPr><w:rPr>` para purgar el "metamarker" del párrafo (Paragraph Mark), evitando que quede colgada una línea invisible o vacía que deteriore el formato al ejecutar un "Aceptar todos los cambios".

#### Paso 3: Volver a Comprimir

```bash
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```

*(El proceso de validación final revalida IDs para prevenir conflictos léxicos como el ID `0x7FFFFFFF`, preserva espacios y reconstruye el estándar ZIP con la máxima compresión).*

### 5. Dependencias Fundacionales del Ecosistema Local

- **`pandoc`**: Principal parser y extractor CLI para ingestas unidireccionales de texto estructurado.
- **`docx` (vía NPM)**: Responsable de la generación declarativa pura en verde.
- **`LibreOffice`**: Utilizado como backend subyacente de abstracción perimetral (headless) para conversiones fiables de `.doc` y a `PDF`.
- **`poppler-utils` (`pdftoppm`)**: Única herramienta válida para garantizar rasterizado `pixel-perfect` a la hora de manipular imágenes de páginas para previews precalculadas.

## Directrices de Ejecución para el Agente (Checklist)

1. **Verificación de Origen Constante**: Cuando se te solicite confeccionar un reporte Word desde cero y en lote, estructura la entrega de valor utilizando un script robusto en JavaScript soportado enteramente por `docx-js`. No intentes inyectar archivos desde pandoc si el destino requiere tipografías exactas.
2. **Modificación Limpia**: Para cualquier tarea que requiera retener márgenes corporativos, pie de páginas, logos en plantillas .docx, recurre INMEDIATAMENTE al algoritmo sistemático `Unpack -> Edit (en document.xml) -> Repack`.
3. **Validación Preventiva**: Nunca emitas un trabajo XML directo si no te aseguras de las restricciones mayores: Ningún uso del `%` en anchos en tablas ni inyección de viñetas en formato plano (Unicode `\u2022`).
