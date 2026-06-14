---
name: magic-ui-mcp
description: Habilidad para generar componentes UI premium y gestionar librerías de iconos (200k+) utilizando los servidores MCP de 21st.dev y Better Icons.
---

# Magic UI & Icons Skill

Enfocada en la excelencia visual y la velocidad de desarrollo frontend.

## Capacidades

- **Magic (21st.dev)**: Recuperar componentes UI modernos y listos para producción basados en descripciones de lenguaje natural.
- **Better Icons**: Acceso a +200,000 iconos de +150 colecciones. Búsqueda semántica de iconos y obtención de código SVG preciso.
- **Consistencia Visual**: Garantizar que los iconos y componentes sigan las mismas guías de estilo.

## Instrucciones de Uso

Utiliza estas herramientas para "wowear" al usuario con diseños premium:

1. **Componentes**: Cuando el usuario pida un componente complejo (ej: "un sistema de login con glassmorfismo"), consulta a `magic_get_component`.
2. **Iconografía**: Busca el icono perfecto usando `icons_search` y obtén su SVG con `icons_get_svg`.

## Ejemplo de Prompt

"Necesito un componente de 'Testimonios' con un diseño minimalista. Además, busca iconos de redes sociales que tengan una estética de línea fina para acompañarlos."
