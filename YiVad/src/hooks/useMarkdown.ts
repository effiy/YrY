/**
 * Markdown rendering composable.
 * Wraps the `marked` npm package with Mermaid diagram support.
 * Mermaid diagrams are rendered client-side via mermaid.render() and then
 * enhanced with a hover toolbar (fullscreen + download) automatically.
 *
 * Theme colours come from .claude/skills/mermaid via the mermaidThemes config
 * module — 15 themes, dark/light adaptive. Rendered SVGs are content-hash
 * cached to avoid re-rendering identical diagrams across regenerations.
 */
import { marked } from "marked";
import { watch } from "vue";
import { useGlobalStore } from "@/stores/modules/global";
import { getMermaidThemeConfig } from "@/config/mermaidThemes";
import { getCachedSvg, setCachedSvg, clearMermaidCache } from "./useMermaidRenderCache";
import { useMermaidViewer } from "./useMermaidViewer";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true
});

/** Lazily-initialized mermaid instance — loaded on first runMermaid() call. */
let mermaidPromise: Promise<typeof import("mermaid").default | null> | null = null;
let mermaidInitFailed = false;
/** Kept so setupMermaidThemeWatcher() can re-initialize on theme switch. */
let currentMermaidInstance: typeof import("mermaid").default | null = null;

function getMermaid(): Promise<typeof import("mermaid").default | null> | null {
  if (mermaidInitFailed) return null;
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid")
      .then(mod => {
        const mermaid = mod.default;
        currentMermaidInstance = mermaid;
        const isDark = useGlobalStore().isDark;
        const { theme, themeVariables } = getMermaidThemeConfig(isDark);
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "loose",
          suppressErrorRendering: true,
          themeVariables,
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
 * Watch dark-mode toggle and re-initialize mermaid with the appropriate
 * theme variables. Call once from App.vue after Pinia is installed.
 * Also clears the SVG cache so diagrams re-render with new colours.
 */
export function setupMermaidThemeWatcher(): void {
  const globalStore = useGlobalStore();
  watch(
    () => globalStore.isDark,
    (isDark) => {
      if (currentMermaidInstance) {
        const { themeVariables } = getMermaidThemeConfig(isDark);
        currentMermaidInstance.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          suppressErrorRendering: true,
          themeVariables,
        });
      }
      clearMermaidCache();
    },
  );
}

/**
 * Run mermaid on all `<pre class="mermaid">` elements inside `container`.
 * Each element's textContent is parsed as a mermaid diagram and replaced with
 * the rendered SVG. Already-rendered elements (containing an <svg>) are
 * skipped. Renders are content-hash cached so identical diagrams re-use
 * the same SVG output.
 *
 * Call AFTER the container's innerHTML has been updated (e.g. in a watch +
 * nextTick). Safe to call on every DOM update — idempotent.
 *
 * IMPORTANT: mermaid.run({ nodes }) expects each node to BE a mermaid element
 * (i.e. `<pre class="mermaid">`), NOT a container. Passing a container div
 * will silently fail because the container's textContent is not valid mermaid
 * syntax. We must query the actual `<pre class="mermaid">` children first.
 */
/**
 * Sanitize mermaid source code to fix common AI-output issues that
 * would otherwise cause silent render failures.
 *
 * Fixes applied:
 * 1. Smart quotes → straight quotes (AI models often produce typographic quotes)
 * 2. Normalize line endings (CRLF → LF)
 * 3. Strip blank lines at start/end
 * 4. Ensure graph/flowchart declaration has a line break before the first node
 */
function sanitizeMermaidCode(code: string): string {
  let sanitized = code
    // Smart / typographic quotes → straight ASCII
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Em/en dash → hyphen (safe for labels)
    .replace(/[–—]/g, "-")
    // Zero-width and other invisible Unicode that trips parsers
    .replace(/[​‌‍﻿]/g, "")
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Strip truly blank lines at edges
  sanitized = sanitized.replace(/^\n+/, "").replace(/\n+$/, "");

  // When the graph direction and the first node are crammed on the same
  // line the parser may misinterpret the first node.  Split them.
  // e.g. "graph LR  A[Start]" → "graph LR\nA[Start]"
  sanitized = sanitized.replace(
    /^(graph|flowchart)\s+(TB|TD|BT|RL|LR)\s{2,}/m,
    "$1 $2\n",
  );

  return sanitized;
}

let renderCounter = 0;

export async function runMermaid(container?: HTMLElement): Promise<void> {
  const mermaid = await getMermaid();
  if (!mermaid) return;

  const elements = container
    ? Array.from(container.querySelectorAll<HTMLElement>("pre.mermaid"))
    : undefined;

  if (elements !== undefined && elements.length === 0) return;

  if (elements) {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];

      // Skip already-rendered elements (contain an <svg> child)
      if (el.querySelector("svg")) continue;

      // Restore mermaid source from base64 (survives HTML parsing safely)
      let code = el.textContent || "";
      const b64 = el.getAttribute("data-mermaid-b64");
      if (b64) {
        try {
          code = decodeURIComponent(escape(atob(b64)));
        } catch { /* fallback to raw textContent */ }
      }
      if (!code.trim()) continue;

      // ── Sanitize ─────────────────────────────────────────────────────
      const sanitized = sanitizeMermaidCode(code);
      if (!sanitized.trim()) continue;

      // ── Cache check ──────────────────────────────────────────────────
      const cached = getCachedSvg(sanitized);
      if (cached) {
        el.innerHTML = cached;
        continue;
      }

      // ── Parse (pre-validation) + Render ───────────────────────────────
      try {
        // Validate syntax first — throws with specific error on bad syntax
        await mermaid.parse(sanitized);
      } catch (parseErr) {
        const preview = sanitized.substring(0, 80).replace(/\n/g, "\\n");
        const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        el.innerHTML =
          `<div class="mermaid-error" style="` +
          `padding:12px;border:2px dashed #e74c3c;border-radius:6px;` +
          `background:var(--el-color-danger-light-9,#fff5f5);` +
          `color:var(--el-color-danger,#c0392b);font-size:13px;text-align:center;` +
          `line-height:1.5">` +
          `<strong>⚠ Diagram parse error</strong>` +
          `<div style="font-size:11px;opacity:.7;margin-top:4px;word-break:break-all;">${preview}...</div>` +
          `<div style="font-size:10px;opacity:.5;margin-top:2px;">${msg}</div>` +
          `</div>`;
        console.warn(
          `[runMermaid] #${i + 1}/${elements.length} parse FAILED:`,
          preview,
          msg,
        );
        continue;
      }

      try {
        const id = `mermaid-${++renderCounter}`;
        const { svg } = await mermaid.render(id, sanitized);
        el.innerHTML = svg;
        setCachedSvg(sanitized, svg);
      } catch (err) {
        // Visible error indicator so the user knows something went wrong
        const preview = sanitized.substring(0, 80).replace(/\n/g, "\\n");
        const msg = err instanceof Error ? err.message : String(err);
        el.innerHTML =
          `<div class="mermaid-error" style="` +
          `padding:12px;border:2px dashed #e74c3c;border-radius:6px;` +
          `background:var(--el-color-danger-light-9,#fff5f5);` +
          `color:var(--el-color-danger,#c0392b);font-size:13px;text-align:center;` +
          `line-height:1.5">` +
          `<strong>⚠ Diagram render failed</strong>` +
          `<div style="font-size:11px;opacity:.7;margin-top:4px;word-break:break-all;">${preview}...</div>` +
          `<div style="font-size:10px;opacity:.5;margin-top:2px;">${msg}</div>` +
          `</div>`;
        console.warn(
          `[runMermaid] #${i + 1}/${elements.length} render FAILED:`,
          preview,
          msg,
        );
      }
    }
  } else {
    // No container given — render all mermaid elements on the page
    try {
      await mermaid.run();
    } catch (err) {
      console.warn(
        "[runMermaid] Mermaid run failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Enhance rendered SVGs with hover toolbar + interactive zoom/pan.
  // useMermaidViewer is statically imported at module top-level — it uses
  // module-level refs so it doesn't require a component instance.
  if (container) {
    try {
      useMermaidViewer().enhanceContainer(container);
    } catch (err) {
      console.warn(
        "[runMermaid] enhance failed:",
        err instanceof Error ? err.message : err,
      );
    }
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
 * that runMermaid() will pick up client-side. The code inside is HTML-decoded
 * so mermaid can parse it directly.
 */
function wrapMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_match, code) => {
      // Decode HTML entities back to the raw mermaid source.
      // ORDER MATTERS: &amp; must be decoded FIRST so that double-encoded
      // sequences (&amp;lt; → &lt;) can then be decoded by the &lt;/&gt; steps.
      // This handles both renderWithHtml (no pre-escape) and render (pre-escapes <).
      const decoded = code
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
      // btoa can throw on non-Latin1; use the UTF-8 safe pattern
      const b64 = btoa(unescape(encodeURIComponent(decoded)));
      return `<pre class="mermaid" data-mermaid-b64="${b64}"></pre>`;
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
