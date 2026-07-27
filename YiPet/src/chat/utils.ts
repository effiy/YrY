/**
 * YiPet Chat — Shared utility helpers.
 */

// Time formatting delegated to the canonical @/utils/datetime.
// Re-export with the names chat components expect.
export {
  formatDateFromTs as formatDate,
  formatDateTimeFromTs as formatTime,
} from '@/utils/datetime';

declare var marked: { parse: (t: string) => string } | undefined;

/** Render markdown string to HTML. Falls back to plain-text escaping. */
export function renderMarkdown(text: string): string {
  if (marked?.parse) {
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
