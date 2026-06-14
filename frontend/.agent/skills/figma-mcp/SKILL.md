---
name: figma-mcp
description: Habilidad para extraer contexto de diseño desde Figma. Permite mapear componentes, leer layouts y facilitar el flujo de diseño a código.
---

# Figma MCP Skill

Permite integrar el contexto visual y técnico de Figma directamente en el flujo de desarrollo.

## Capacidades

- **Extracción de Contexto**: Obtener información detallada de frames, componentes y capas seleccionadas.
- **Mapeo de Variables**: Leer tokens de diseño (colores, tipografías, espaciados) definidos en Figma.
- **Generación Orientada**: Generar código (HTML/CSS/React) basado en la estructura técnica del diseño en lugar de solo en la apariencia visual.
- **Comentarios**: Leer y responder a comentarios en el archivo de Figma para coordinar cambios.

## Instrucciones de Uso

Utiliza esta habilidad cuando el usuario proporcione un enlace de Figma o mencione que quiere implementar un diseño específico:

1. Obtén el mapa del archivo con `get_file_nodes`.
2. Analiza las propiedades de los nodos con `get_node_properties`.
3. Traduce las variables de diseño a variables CSS o tokens en el proyecto local.

## Ejemplo de Prompt

"Implementa el componente de 'Navbar' que está en mi archivo de Figma, respetando los colores y el sistema de espaciado definido en los tokens."
