/**
 * YiPet Chat — Shared utility helpers.
 */

// Time formatting delegated to the canonical @/utils/datetime.
// Re-export with the names chat components expect.
export {
  formatDateFromTs as formatDate,
  formatDateTimeFromTs as formatTime,
} from '@/utils/datetime';

import { marked } from 'marked';

/** Render markdown string to HTML. Falls back to plain-text escaping. */
export function renderMarkdown(text: string): string {
  if (marked?.parse) {
    // Escape '<' so raw HTML in AI output / page context is rendered as text,
    // not interpreted by the browser. Markdown formatting (which doesn't use
    // '<') still works. marked v15 has no built-in sanitizer.
    const escaped = text.replace(/</g, '&lt;');
    // Neutralize dangerous URI schemes in markdown link/image URLs — marked
    // v15+ has no built-in sanitizer, so `[x](javascript:alert(1))` would
    // otherwise emit a clickable javascript: href.
    const safe = escaped.replace(/]\s*\((javascript:|vbscript:)[^)]*\)/gi, '](#)');
    return wrapMermaidBlocks(marked.parse(safe) as string);
  }
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/**
 * Replace ```mermaid fenced code blocks with empty `<pre class="mermaid">`
 * placeholders carrying the base64-encoded source. `runMermaid` renders them
 * client-side via the CDN `window.mermaid` global (gracefully degraded to a
 * plain code block if the library is not present).
 */
function wrapMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_match, code) => {
      const decoded = code
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
      const b64 = btoa(unescape(encodeURIComponent(decoded)));
      return `<pre class="mermaid" data-mermaid-b64="${b64}"></pre>`;
    },
  );
}

let _mermaidSeq = 0;
let _mermaidInit = false;

/** Minimal shape of the CDN `window.mermaid` global (mermaid.min.js). */
interface MermaidGlobal {
  initialize?: (cfg: Record<string, unknown>) => void;
  render?: (id: string, code: string) => Promise<{ svg: string }>;
}

/** Render any `<pre class="mermaid">` blocks inside `container` (or the whole
 *  document) using the CDN mermaid global. Idempotent — already-rendered
 *  blocks (containing an `<svg>`) are skipped; a missing/failed library leaves
 *  the placeholder untouched so the diagram degrades to nothing visible rather
 *  than a half-rendered element. */
export async function runMermaid(container?: HTMLElement): Promise<void> {
  const mermaid = (window as unknown as { mermaid?: MermaidGlobal }).mermaid;
  if (!mermaid?.render) return;

  if (!_mermaidInit) {
    try {
      mermaid.initialize?.({ startOnLoad: false, securityLevel: 'loose', theme: 'default' });
    } catch {
      /* ignore — non-fatal */
    }
    _mermaidInit = true;
  }

  const elements = Array.from(
    (container ?? document).querySelectorAll<HTMLElement>('pre.mermaid'),
  );
  for (const el of elements) {
    if (el.querySelector('svg')) continue;
    let code = el.getAttribute('data-mermaid-b64')
      ? (() => {
          try {
            return decodeURIComponent(escape(atob(el.getAttribute('data-mermaid-b64') as string)));
          } catch {
            return '';
          }
        })()
      : el.textContent || '';
    if (!code.trim()) continue;
    try {
      const { svg } = await mermaid.render(`yipet-mmd-${++_mermaidSeq}`, code);
      el.innerHTML = svg;
    } catch {
      /* leave the placeholder — degraded to a code block */
    }
  }
}

/** Escape HTML entities in a string. */
export function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/** Attach a per-code-block "Copy" button to every `<pre>` in `container`
 *  (mermaid placeholders excluded). Idempotent — blocks already decorated are
 *  skipped. The button copies the code text and flashes "Copied". */
export function addCodeCopyButtons(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
    if (pre.querySelector('.mb-code-copy')) return;
    if (pre.classList.contains('mermaid')) return;
    const code = pre.querySelector('code');
    const text = code?.textContent ?? pre.textContent ?? '';
    if (!text.trim()) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mb-code-copy';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.textContent = 'Copied';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 1500);
        })
        .catch(() => {});
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}
