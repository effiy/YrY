/**
 * Context file formatting for LLM prompts.
 *
 * Sessions carry reference documents in `pageContent` (markdown sections
 * separated by `\n\n---\n\n`, each headed by `## <file_path>`). This utility
 * formats them into system messages that tell the model these are authoritative
 * reference documents — not conversation history.
 *
 * Pure functions, no dependencies on stores or Vue reactivity.
 */

const CTX_PREFIX = "ctx:";
const SECTION_SEP = "\n\n---\n\n";
const MAX_CONTEXT_CHARS = 6000;

/** Parsed context section from pageContent. */
interface ContextSection {
  path: string;
  content: string;
  charCount: number;
}

/** Parse pageContent into structured sections. */
function parseSections(pageContent: string): ContextSection[] {
  if (!pageContent?.trim()) return [];
  const sections = pageContent.split(SECTION_SEP);
  const out: ContextSection[] = [];
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n");
    const headerMatch = lines[0]?.match(/^## (.+)$/);
    const path = headerMatch?.[1]?.trim() ?? "";
    const body = lines.slice(1).join("\n").trim();
    if (!path) continue;
    out.push({ path, content: body, charCount: body.length });
  }
  return out;
}

/** Extract ctx:-tagged file paths from session tags. */
function extractCtxPaths(tags: string[]): string[] {
  return tags
    .filter(t => typeof t === "string" && t.startsWith(CTX_PREFIX))
    .map(t => t.slice(CTX_PREFIX.length));
}

/**
 * Simple keyword overlap score between a user question and context section.
 * Used to rank/trim sections when context is too large.
 */
function relevanceScore(question: string, section: ContextSection): number {
  const q = question.toLowerCase();
  const text = `${section.path} ${section.content}`.toLowerCase();
  let score = 0;
  // Split question into words (2+ chars), score by presence in section
  const words = new Set(q.split(/\s+/).filter(w => w.length >= 2));
  for (const w of words) {
    if (text.includes(w)) score += 1;
  }
  // Bonus for path match
  if (text.includes(q)) score += 5;
  return score;
}

/**
 * Format context files as a system message for the LLM.
 *
 * Produces a compact, well-structured block that tells the model:
 * - These are reference documents (not conversation history)
 * - Which files are available
 * - How to cite them in responses
 *
 * When `userQuestion` is provided and total context exceeds MAX_CONTEXT_CHARS,
 * sections are ranked by relevance and trimmed to fit.
 *
 * @param pageContent - Raw session pageContent (## path\n\ncontent sections)
 * @param tags - Session tags (ctx: prefixed tags indicate context files)
 * @param userQuestion - Optional user question for relevance-based trimming
 * @returns Formatted system message string, or "" if no context
 */
export function formatContextForPrompt(
  pageContent: string,
  tags: string[],
  userQuestion?: string
): string {
  if (!pageContent?.trim()) return "";

  const sections = parseSections(pageContent);
  if (!sections.length) return "";

  const ctxPaths = extractCtxPaths(tags);
  const totalChars = sections.reduce((s, sec) => s + sec.charCount, 0);

  // Trim by relevance when context is large
  let activeSections = sections;
  if (totalChars > MAX_CONTEXT_CHARS && userQuestion) {
    const ranked = sections
      .map(s => ({ section: s, score: relevanceScore(userQuestion, s) }))
      .sort((a, b) => b.score - a.score);

    let chars = 0;
    const kept: ContextSection[] = [];
    for (const { section } of ranked) {
      if (chars + section.charCount > MAX_CONTEXT_CHARS && kept.length > 0) break;
      kept.push(section);
      chars += section.charCount;
    }
    activeSections = kept;
  }

  const fileList = activeSections.map(s => `- \`${s.path}\` (${s.charCount} chars)`).join("\n");

  const parts: string[] = [];
  parts.push("## Reference documents");
  parts.push("");
  parts.push(
    "The following documents are available as reference material for this conversation. ",
    "They are authoritative sources — prioritize their content over your general knowledge ",
    "when answering questions. Reference specific files by path when drawing from them."
  );
  parts.push("");
  parts.push("Available files:");
  parts.push(fileList);
  parts.push("");

  for (const section of activeSections) {
    parts.push(`### ${section.path}`);
    parts.push("");
    parts.push(section.content);
    parts.push("");
  }

  return parts.join("\n");
}

/**
 * Check if a session has context files (either via ctx: tags or pageContent).
 */
export function hasContextFiles(tags: string[], pageContent?: string): boolean {
  const hasCtxTags = tags.some(t => typeof t === "string" && t.startsWith(CTX_PREFIX));
  const hasContent = (pageContent ?? "").trim().length > 0;
  return hasCtxTags || hasContent;
}