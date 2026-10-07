type HighlightSegment = { text: string; match: boolean };

export function highlightSegments(text: string, query: string): HighlightSegment[] {
  if (!query) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: HighlightSegment[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      out.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) out.push({ text: text.slice(i, idx), match: false });
    out.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }
  return out;
}