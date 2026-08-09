/**
 * Markdown rendering composable.
 * Wraps the `marked` npm package with Mermaid diagram support.
 * Mermaid diagrams are rendered client-side via mermaid.run().
 */
import { marked } from "marked";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true
});

/** Lazily-initialized mermaid instance — loaded on first runMermaid() call. */
let mermaidPromise: Promise<typeof import("mermaid").default | null> | null = null;
let mermaidInitFailed = false;

function getMermaid(): Promise<typeof import("mermaid").default | null> | null {
  if (mermaidInitFailed) return null;
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid")
      .then(mod => {
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          suppressErrorRendering: true,
          themeVariables: {
            primaryColor: "#e0e0e0",
            primaryBorderColor: "#b0b0b0",
            primaryTextColor: "#333333",
            lineColor: "#888888"
          }
        });
        return mermaid;
      })
      .catch(err => {
        console.warn("Mermaid library failed to load — diagrams will show as code blocks.", err);
        mermaidInitFailed = true;
        mermaidPromise = null;
        return null;
      });
  }
  return mermaidPromise;
}

/**
 * Run mermaid on all `<pre class="mermaid">` elements inside `container`.
 * Each element's textContent is parsed as a mermaid diagram and replaced with
 * the rendered SVG. Already-rendered elements (containing an <svg>) are
 * skipped by mermaid.
 *
 * Call AFTER the container's innerHTML has been updated (e.g. in a watch +
 * nextTick). Safe to call on every DOM update — idempotent.
 *
 * IMPORTANT: mermaid.run({ nodes }) expects each node to BE a mermaid element
 * (i.e. `<pre class="mermaid">`), NOT a container. Passing a container div
 * will silently fail because the container's textContent is not valid mermaid
 * syntax. We must query the actual `<pre class="mermaid">` children first.
 */
export async function runMermaid(container?: HTMLElement): Promise<void> {
  const mermaid = await getMermaid();
  if (!mermaid) return;

  const elements = container
    ? Array.from(container.querySelectorAll<HTMLElement>("pre.mermaid"))
    : undefined;

  // Nothing to render — skip the mermaid call entirely
  if (elements !== undefined && elements.length === 0) return;

  try {
    await mermaid.run({ nodes: elements });
  } catch (err) {
    console.warn("Mermaid run failed:", err instanceof Error ? err.message : err);
  }
}

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
 * Replace mermaid fenced code blocks with `<pre class="mermaid">` elements
 * that mermaid.run() will pick up client-side. The code inside is HTML-decoded
 * so mermaid can parse it directly.
 */
function wrapMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_match, code) => {
      const decoded = code
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
      // Use <pre class="mermaid"> which mermaid.run() auto-discovers.
      // Also keep a data attribute as backup for debugging.
      return `<pre class="mermaid">${decoded}</pre>`;
    }
  );
}

/**
 * Render markdown string to HTML.
 * Mermaid code blocks become `<pre class="mermaid">` for client-side rendering.
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
      html = wrapMermaidBlocks(html);
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
      html = wrapMermaidBlocks(html);
      return html;
    } catch {
      const escaped = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<p>${escaped}</p>`;
    }
  }

  return { render, renderWithHtml };
}
