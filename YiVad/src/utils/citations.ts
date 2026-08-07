/**
 * Inline-citation helpers — turn `[N]` tokens emitted by the LLM into
 * clickable superscript chips that map to the Nth source in a list.
 *
 * Mirrors llama_index's InlineCitationQueryEngine UX: chunks are prefixed
 * with `[Source N]` by the backend `_NumberSourcesPostprocessor`, the
 * synthesis LLM emits `[N]` markers in its answer, and this util turns
 * those markers into chips that scroll to / flash the matching source.
 */

/** Replace `[N]` tokens in rendered HTML with `<sup class="cite-chip">`
 *  elements. Skips `<pre>` and `<code>` segments so citations inside code
 *  samples are not munged. Returns the input unchanged when sourceCount
 *  is 0 (no sources means no citation mapping). */
export function injectCitations(html: string, sourceCount: number): string {
  if (!sourceCount || !html) return html;
  const codeRe = /<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>/gi;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = codeRe.exec(html)) !== null) {
    parts.push(html.slice(last, m.index));
    parts.push(m[0]);
    last = m.index + m[0].length;
  }
  parts.push(html.slice(last));
  const citeRe = /\[(\d+)\]/g;
  return parts
    .map((seg, i) =>
      i % 2 === 0
        ? seg.replace(citeRe, (s, n) => {
            const idx = parseInt(n, 10);
            if (idx < 1 || idx > sourceCount) return s;
            return `<sup class="cite-chip" data-cite-idx="${idx}">[${idx}]</sup>`;
          })
        : seg
    )
    .join("");
}

/** Event-delegation click handler for a container bound to a
 *  `RagSources`-shaped ref. Reads `data-cite-idx` off the closest
 *  `.cite-chip` ancestor of the click target and calls `focusSource`
 *  on the provided ref. No-op when the click didn't hit a chip. */
export function makeCitationClickHandler(getRef: () => { focusSource?: (idx: number) => void } | null | undefined): (e: MouseEvent) => void {
  return (e: MouseEvent) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>(".cite-chip");
    if (!chip) return;
    const idx = parseInt(chip.dataset.citeIdx ?? "0", 10) - 1;
    if (idx >= 0) getRef()?.focusSource?.(idx);
  };
}
