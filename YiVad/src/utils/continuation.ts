const CONTINUATION_PREFIXES = [
  "继续", "接着",
  "continue", "go on", "keep going",
];

const CONTINUATION_BARE = new Set([
  "继续", "继续吧", "接着来", "接着",
  "continue", "go on", "keep going",
]);

export function isContinuationMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();

  if (CONTINUATION_BARE.has(lower)) return true;

  for (const prefix of CONTINUATION_PREFIXES) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      return true;
    }
  }

  return false;
}