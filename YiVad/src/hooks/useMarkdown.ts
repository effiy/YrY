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
 */
export function useMarkdown() {
  function render(md: string): string {
    if (!md) return "";
    try {
      let html = marked.parse(md) as string;

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
      return `<p>${md}</p>`;
    }
  }

  return { render };
}
