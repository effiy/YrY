/**
 * Markdown rendering composable.
 * Wraps the `marked` npm package with Mermaid diagram support.
 */
import { marked } from "marked";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true
});

/**
 * Basic XSS sanitization — strip dangerous tags and attributes from HTML.
 * Not a replacement for DOMPurify, but sufficient for trusted internal content.
 */
function sanitizeHtml(html: string): string {
  return html
    // Strip <script> and <iframe> entirely
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    // Strip on* event handlers
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "")
    // Neutralize javascript: URLs
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")
    .replace(/src\s*=\s*"javascript:[^"]*"/gi, 'src="#"');
}

/**
 * Render markdown string to HTML.
 * Mermaid code blocks are wrapped with a special class for client-side rendering.
 *
 * Security: escape `<` before parsing so raw HTML in AI output / edited
 * messages is rendered as text, not executed. marked has no built-in
 * sanitizer; this matches the YiPet renderMarkdown approach. Markdown
 * formatting (which doesn't use `<`) still works.
 * Also neutralize dangerous URI schemes in markdown link/image URLs.
 */
export function useMarkdown() {
  function render(md: string): string {
    if (!md) return "";
    try {
      const escaped = md.replace(/</g, "&lt;");
      const safe = escaped.replace(/]\s*\((javascript:|vbscript:)[^)]*\)/gi, "](#)");
      let html = marked.parse(safe) as string;

      // Wrap mermaid code blocks for client-side rendering
      html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_match, code) => {
        const decoded = code
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"');
        return `<div class="mermaid-block" data-mermaid="${encodeURIComponent(decoded)}"><pre><code class="language-mermaid">${code}</code></pre></div>`;
      });

      return html;
    } catch {
      const escaped = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<p>${escaped}</p>`;
    }
  }

  /** Render markdown with HTML passthrough for trusted internal content.
   *  Raw HTML tags in the markdown are preserved and rendered (e.g. tables, divs, styles).
   *  Basic XSS sanitization strips scripts, iframes, and event handlers.
   *  Use ONLY for internal/trusted knowledge files — NOT for AI or user-generated content. */
  function renderWithHtml(md: string): string {
    if (!md) return "";
    try {
      const sanitized = sanitizeHtml(md);
      const safe = sanitized.replace(/]\s*\((javascript:|vbscript:)[^)]*\)/gi, "](#)");
      let html = marked.parse(safe) as string;

      // Wrap mermaid code blocks for client-side rendering
      html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_match, code) => {
        const decoded = code
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"');
        return `<div class="mermaid-block" data-mermaid="${encodeURIComponent(decoded)}"><pre><code class="language-mermaid">${code}</code></pre></div>`;
      });

      return html;
    } catch {
      const escaped = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<p>${escaped}</p>`;
    }
  }

  return { render, renderWithHtml };
}
