/**
 * Token estimation utility — character-type-aware heuristic.
 *
 * CJK characters (Chinese/Japanese/Korean) typically encode as ~1.5 tokens
 * per character in most tokenizers. Latin/alphanumeric characters average
 * ~0.25 tokens per char (about 4 chars per token). The weighted average
 * gives a better estimate than the naive char ÷ 4 for mixed-language
 * Chinese text (which dominates RAG answers).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  let cjk = 0;
  let latin = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified
      (cp >= 0x3400 && cp <= 0x4dbf) || // CJK Ext A
      (cp >= 0x20000 && cp <= 0x2a6df) || // CJK Ext B
      (cp >= 0xf900 && cp <= 0xfaff) || // CJK Compat
      (cp >= 0x3040 && cp <= 0x309f) || // Hiragana
      (cp >= 0x30a0 && cp <= 0x30ff) || // Katakana
      (cp >= 0xac00 && cp <= 0xd7af) // Hangul
    ) {
      cjk++;
    } else if (cp > 32 && cp < 127) {
      latin++;
    } else {
      // Punctuation, symbols, emoji — no clear token ratio; count as 1
      cjk++;
    }
  }
  return Math.ceil(cjk * 1.5 + latin * 0.25);
}