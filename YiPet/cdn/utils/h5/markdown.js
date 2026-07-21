/**
 * Markdown rendering bridge for h5/ components
 *
 * Delegates to the shared cdn/components/markdown renderer.
 * The original YiH5/utils/markdown.js API exposed { renderMarkdown, renderMermaidIn }.
 */

import { renderMarkdownHtml } from '/cdn/components/markdown/index.js';

/**
 * Render markdown text to HTML (alias matching legacy API).
 * @param {string} text - Markdown source
 * @returns {string} HTML string
 */
export function renderMarkdown(text) {
  if (!text) return '';
  return renderMarkdownHtml(text);
}

/**
 * Render Mermaid diagrams inside a DOM container.
 * This is a stub that registers asynchronously if the Mermaid module is available.
 * Chat will call this after DOM insertion; if Mermaid is not loaded, it's a no-op.
 * @param {HTMLElement} container - DOM element to scan for mermaid blocks
 */
export function renderMermaidIn(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return;

  // The actual Mermaid rendering is handled by the MarkdownView pipeline.
  // For the h5 Chat component, we keep this as a passthrough — if Mermaid
  // is loaded globally, it will process code blocks that match its selectors.
  try {
    if (typeof window.mermaid !== 'undefined' && typeof window.mermaid.run === 'function') {
      window.mermaid.run({ nodes: container.querySelectorAll('.mermaid, pre code.language-mermaid, [data-mermaid]') });
    }
  } catch (_) {
    // Mermaid not loaded — silent no-op
  }
}
