/**
 * YiPet Chat — Shared utility helpers.
 */

declare var marked: { parse: (t: string) => string } | undefined;

/** Render markdown string to HTML. Falls back to plain-text escaping. */
export function renderMarkdown(text: string): string {
  if (typeof marked !== 'undefined' && marked.parse) {
    return marked.parse(text) as string;
  }
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/** Escape HTML entities in a string. */
export function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/** Format timestamp to full Chinese datetime string. */
export function formatTime(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Format timestamp to short date string (YYYY/MM/DD). */
export function formatDate(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
