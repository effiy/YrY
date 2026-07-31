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
    return marked.parse(safe) as string;
  }
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/** Escape HTML entities in a string. */
export function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
