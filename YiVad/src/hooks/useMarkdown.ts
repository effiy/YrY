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
      // Escape on the fallback path too — otherwise a payload that makes
      // marked.parse throw would be concatenated raw into <p>${md}</p>,
      // re-introducing the HTML-injection vector the pre-parse escape on
      // the happy path is meant to close.
      const escaped = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<p>${escaped}</p>`;
    }
  }

  return { render };
}
