"use client";

import React, { useState, useEffect } from "react";

type DocTab = "readme" | "user_manual" | "data_dictionary";

// Inline custom markdown parser to convert MD to beautifully styled HTML
function parseMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Clean Windows carriage returns
  html = html.replace(/\r\n/g, "\n");

  // Escape HTML tags to prevent injection while allowing our own tags
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Remove XML comments if any
  html = html.replace(/&lt;!--([\s\S]*?)--&gt;/g, "");

  // Code blocks: ```js ... ```
  html = html.replace(/```([a-zA-Z0-9-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre style="background: hsla(var(--bg-secondary), 0.6); border: 1px solid hsl(var(--border-glass)); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; margin: 1.25rem 0; font-family: monospace; font-size: 0.85rem; color: hsl(var(--accent));"><code style="color: inherit;">${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: hsl(var(--accent));">$1</code>');

  // Headers: # Header
  html = html.replace(/^\s*# (.*)$/gm, '<h1 style="font-size: 1.85rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1.5px solid hsl(var(--border-glass)); padding-bottom: 0.5rem; color: hsl(var(--primary));">$1</h1>');
  html = html.replace(/^\s*## (.*)$/gm, '<h2 style="font-size: 1.4rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid hsl(var(--border-glass)); padding-bottom: 0.35rem; color: hsl(var(--text-primary));">$1</h2>');
  html = html.replace(/^\s*### (.*)$/gm, '<h3 style="font-size: 1.15rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: hsl(var(--text-primary));">$1</h3>');
  html = html.replace(/^\s*#### (.*)$/gm, '<h4 style="font-size: 1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: hsl(var(--text-primary));">$1</h4>');

  // Bold: **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: hsl(var(--text-primary));">$1</strong>');
  
  // Italic: *italic*
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style: italic;">$1</em>');

  // Horizontal rules: ---
  html = html.replace(/^\s*---\s*$/gm, '<hr style="border: 0; border-top: 1px solid hsl(var(--border-glass)); margin: 1.75rem 0;" />');

  // Bullet lists: * item or - item
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li style="margin-left: 1.5rem; margin-bottom: 0.4rem; list-style-type: square; color: hsl(var(--text-secondary));">$1</li>');

  // Table structures
  const lines = html.split("\n");
  let inTable = false;
  let tableRows: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      tableRows.push(cells.join("||"));
      lines[i] = ""; // Clear original line
    } else {
      if (inTable) {
        inTable = false;
        const tableHtml = buildTableHtml(tableRows);
        lines[i] = tableHtml + "\n" + lines[i];
      }
    }
  }
  html = lines.join("\n");

  // Paragraph wrappers
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    
    // Skip if it's already an HTML block element
    if (
      trimmed.startsWith("<h") || 
      trimmed.startsWith("<li") || 
      trimmed.startsWith("<hr") || 
      trimmed.startsWith("<table") || 
      trimmed.startsWith("<tr") || 
      trimmed.startsWith("<td") || 
      trimmed.startsWith("<th") || 
      trimmed.startsWith("<thead") || 
      trimmed.startsWith("<tbody") || 
      trimmed.startsWith("<div") || 
      trimmed.startsWith("<pre") || 
      trimmed.startsWith("<code")
    ) {
      return line;
    }
    return `<p style="margin-bottom: 0.85rem; line-height: 1.6; color: hsl(var(--text-secondary));">${line}</p>`;
  }).join("\n");

  return html;
}

function buildTableHtml(rows: string[]): string {
  if (rows.length === 0) return "";
  
  let html = `<div style="overflow-x: auto; margin: 1.5rem 0; border-radius: var(--radius-sm); border: 1px solid hsl(var(--border-glass));">
    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; background: hsla(var(--bg-secondary), 0.25);">`;
  
  // Header
  const headerCells = rows[0].split("||");
  html += `<thead style="background: hsla(var(--bg-secondary), 0.75); border-bottom: 1px solid hsl(var(--border-glass));"><tr>`;
  headerCells.forEach(cell => {
    html += `<th style="padding: 10px 12px; text-align: left; font-weight: 700; color: hsl(var(--text-primary));">${cell}</th>`;
  });
  html += `</tr></thead><tbody>`;

  // Data rows
  const dataRows = rows.slice(1);
  dataRows.forEach(row => {
    if (row.includes("---")) return; // Skip separator row
    const cells = row.split("||");
    html += `<tr style="border-bottom: 1px solid hsl(var(--border-glass));">`;
    cells.forEach(cell => {
      html += `<td style="padding: 10px 12px; color: hsl(var(--text-secondary));">${cell}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<DocTab>("readme");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDoc() {
      setLoading(true);
      setError("");
      try {
        const docFileName = activeTab === "readme"
          ? "readme.md"
          : activeTab === "user_manual"
          ? "user_manual.md"
          : "data_dictionary.md";

        const res = await fetch(`/docs/${docFileName}`);
        if (!res.ok) {
          throw new Error("No se pudo cargar el archivo de documentación.");
        }
        const markdown = await res.text();
        const parsedHtml = parseMarkdownToHtml(markdown);
        setContent(parsedHtml);
      } catch (err: any) {
        console.error(err);
        setError("Ocurrió un error al intentar leer la documentación técnica.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [activeTab]);

  return (
    <div className="fade-in" style={{ maxWidth: "950px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="title-primary">Centro de Documentación</h1>
        <p className="subtitle-secondary">
          Manuales oficiales y guías técnicas para desarrolladores e instaladores de la plataforma.
        </p>
      </div>

      {/* Tabs list */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        borderBottom: "1px solid hsl(var(--border-glass))",
        paddingBottom: "1px",
        marginBottom: "2rem"
      }} className="no-print">
        <button
          onClick={() => setActiveTab("readme")}
          className={`btn ${activeTab === "readme" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          📖 Guía de Inicio (README)
        </button>
        <button
          onClick={() => setActiveTab("user_manual")}
          className={`btn ${activeTab === "user_manual" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🛠️ Manual de Usuario
        </button>
        <button
          onClick={() => setActiveTab("data_dictionary")}
          className={`btn ${activeTab === "data_dictionary" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          🗄️ Diccionario de Datos (BD)
        </button>
      </div>

      {/* Content panel */}
      <div className="glass-card" style={{ padding: "3rem", background: "hsla(var(--bg-secondary), 0.3)" }}>
        {loading ? (
          <div className="loader-container" style={{ minHeight: "200px" }}>
            <div className="spinner" />
            <p>Cargando documentación...</p>
          </div>
        ) : error ? (
          <div style={{ color: "hsl(var(--danger))", textAlign: "center", padding: "2rem" }}>
            ⚠️ {error}
          </div>
        ) : (
          <article 
            dangerouslySetInnerHTML={{ __html: content }} 
            style={{ fontSize: "0.95rem" }} 
          />
        )}
      </div>
    </div>
  );
}
