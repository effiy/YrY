/** Export utilities for YiPet chat sessions. Pure functions — no reactive state. */
import type { Message, SessionItem } from '../types';

export function exportCurrentSessionMarkdown(
  messages: Message[],
  sessionTitle: string,
  pageUrl: string,
  notify: (msg: string) => void,
): void {
  if (!messages.length) {
    notify('Nothing to export');
    return;
  }
  const lines: string[] = [
    `# ${sessionTitle}`,
    `> Exported: ${new Date().toISOString()}`,
    `> Source: ${pageUrl || 'unknown'}`,
    '', '---', '',
  ];
  for (const m of messages) {
    const role = m.type === 'user' ? 'User' : 'Pet';
    const ts = new Date(m.timestamp).toISOString();
    lines.push(`## ${role} . ${ts}`);
    lines.push('');
    lines.push(m.content || '');
    if (m.error) lines.push('> _Generation failed_');
    if (m.aborted) lines.push('> _Stopped_');
    lines.push('', '---', '');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sessionTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50)}.md`;
  a.click();
  URL.revokeObjectURL(url);
  notify(`Exported ${messages.length} messages as markdown`);
}

function _escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, (c) => map[c] || c);
}

function _formatContent(content: string): string {
  return content
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m: string, _lang: string, code: string) =>
      `<pre><code>${_escapeHtml(code.trim())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, (_m: string, code: string) => `<code>${_escapeHtml(code)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const HTML_CSS = `
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
  h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
  .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  .msg { margin: 1.5rem 0; padding: 1rem; border-radius: 8px; }
  .msg--user { background: #f3f4f6; }
  .msg--ai { background: #eff6ff; border-left: 3px solid #3b82f6; }
  .msg__role { font-weight: 600; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; margin-bottom: 0.5rem; }
  .msg__time { font-weight: 400; color: #9ca3af; }
  .msg__content { white-space: pre-wrap; }
  .msg__content img { max-width: 100%; }
  pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8125rem; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875em; }
  @media (prefers-color-scheme: dark) {
    body { background: #111827; color: #f9fafb; }
    .msg--user { background: #1f2937; }
    .msg--ai { background: #1e3a5f; border-left-color: #60a5fa; }
    .meta, .msg__role { color: #9ca3af; }
    h1 { border-bottom-color: #374151; }
  }
`;

export function exportConversationHtml(
  messages: Message[],
  sessionTitle: string,
  pageUrl: string,
  notify: (msg: string) => void,
): void {
  if (!messages.length) {
    notify('Nothing to export');
    return;
  }
  const exported = new Date().toISOString();
  const parts: string[] = [];
  parts.push(
    `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${_escapeHtml(sessionTitle)}</title>\n<style>${HTML_CSS}</style>\n</head>\n<body>\n<h1>${_escapeHtml(sessionTitle)}</h1>\n<p class="meta">Exported: ${exported} · Source: ${_escapeHtml(pageUrl || 'unknown')}</p>`
  );

  for (const m of messages) {
    const role = m.type === 'user' ? 'User' : 'AI';
    const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : '';
    const cls = m.type === 'user' ? 'msg--user' : 'msg--ai';
    parts.push(`<div class="msg ${cls}">`);
    parts.push(`<div class="msg__role">${role} <span class="msg__time">${time}</span></div>`);
    parts.push(`<div class="msg__content">${_formatContent(m.content || '') || '(empty)'}</div>`);
    if (m.error) parts.push('<p><em>Generation failed</em></p>');
    if (m.aborted) parts.push('<p><em>Stopped</em></p>');
    parts.push('</div>');
  }

  parts.push('</body>\n</html>');
  const html = parts.join('\n');
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sessionTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50)}.html`;
  a.click();
  URL.revokeObjectURL(url);
  notify(`Exported ${messages.length} messages as HTML`);
}