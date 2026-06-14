---
name: obsidian-pro
description: Habilidad avanzada para la interacción con bóvedas de Obsidian a través de MCP. Permite gestionar notas, buscar contenido y automatizar el flujo de conocimiento.
---

# Obsidian-pro Skill

Esta habilidad permite a Antigravity interactuar directamente con tus notas de Obsidian utilizando el servidor MCP correspondiente.

## Capacidades

- **Gestión de Notas**: Crear, leer, editar y eliminar archivos dentro de la bóveda.
- **Búsqueda Avanzada**: Buscar texto completo o etiquetas dentro de todas las notas.
- **Estructura**: Listar directorios, mover archivos y organizar la jerarquía de la base de conocimientos.
- **Automatización**: Resumir notas, generar enlaces internos y mantener la consistencia del grafo.

## Instrucciones de Uso

Cuando el usuario solicite acciones sobre su "cerebro digital" o notas específicas de Obsidian, utiliza las herramientas del servidor MCP de Obsidian:

1. **Reading**: Usa `read_file` para obtener el contenido de una nota.
2. **Writing**: Usa `write_file` o `append_content` para capturar ideas o actualizar registros.
3. **Searching**: Usa `search_notes` para localizar información contextual relevante de conversaciones pasadas almacenadas en Obsidian.

## Ejemplo de Prompt

"Revisa mis notas sobre 'Arquitectura Hexagonal' en Obsidian y crea un resumen en una nota nueva llamada 'Resumen Arquitectura'. Estructúralo con puntos clave."
