/**
 * Detects context file change proposals in AI message text.
 *
 * The AI uses fenced code blocks with `context:<path>` or `context:add <path>`
 * or `context:remove <path>` info strings to propose modifications to the
 * session's knowledge context files.
 *
 * Detection patterns:
 *   ```context:<path>
 *   <new markdown content>
 *   ```
 *
 *   ```context:add <path>
 *   ```
 *
 *   ```context:remove <path>
 *   ```
 *
 * Actions are inferred:
 *   - Empty content → "delete"
 *   - Path doesn't exist in current pageContent → "create"
 *   - Path exists → "update"
 *   - info string "context:add" → "addTag"
 *   - info string "context:remove" → "removeTag"
 */
import { computed, type ComputedRef } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

export interface ContextChange {
  /** Action inferred from content and existing state */
  action: "create" | "update" | "delete" | "addTag" | "removeTag" | "view" | "saveToKB";
  /** File path within the context (e.g. "notes/deploy.md") */
  path: string;
  /** The new content proposed by the AI (empty for delete/removeTag) */
  content: string;
  /** Original content of the section, if it exists (for diff display) */
  originalContent: string;
  /** When true, the change targets the YiKnowledge directory (not session context) */
  saveToKnowledgeBase?: boolean;
}

/**
 * Find the matching closing fence for a ``` block.
 * Handles nested code blocks by ensuring the closing ``` is at the same
 * indentation level (start of line). This fixes BUG 8 where internal ``` in
 * the proposed content would cut the match short.
 *
 * @returns The body text inside the fence, or null if no closing fence found.
 */
function extractFencedBody(text: string, fenceStart: number): { body: string; end: number } | null {
  // Find the end of the opening line (the newline after ```context:...)
  const openEnd = text.indexOf("\n", fenceStart);
  if (openEnd < 0) return null;

  // Search for closing ``` on its own line (start of line, optional trailing whitespace)
  const closeRe = /^```\s*$/gm;
  closeRe.lastIndex = openEnd + 1;
  const closeMatch = closeRe.exec(text);
  if (!closeMatch) return null;

  const body = text.slice(openEnd + 1, closeMatch.index);
  return { body, end: closeMatch.index + closeMatch[0].length };
}

/**
 * Regex to find opening ``` fences with context:/knowledge: info strings.
 * Matches the START of the block. The body is extracted by extractFencedBody
 * to handle nested ``` correctly.
 *
 * Supported info strings:
 *   context:<path>       — session context edit (create/update/delete)
 *   context:add <path>   — add ctx: tag
 *   context:remove <path>— remove ctx: tag
 *   context:view <path>  — show current content
 *   knowledge:save <path>— save to YiKnowledge directory (permanent)
 *   knowledge:<path>     — alias for knowledge:save
 */
const CONTEXT_OPEN_RE = /```(context:(?:add|remove|view)\s+[^\n]+|context:[^\s\n]+|knowledge:(?:save\s+)?[^\s\n]+)\s*\n/g;

/**
 * Parse AI message text and extract context change proposals.
 *
 * @param messageText The raw markdown text from an AI/pet message
 * @returns Array of ContextChange objects (empty if no proposals detected)
 */
export function detectContextChanges(messageText: string): ContextChange[] {
  if (!messageText) return [];

  const store = useAiChatStore();
  const changes: ContextChange[] = [];
  let match: RegExpExecArray | null;

  CONTEXT_OPEN_RE.lastIndex = 0;

  while ((match = CONTEXT_OPEN_RE.exec(messageText)) !== null) {
    const infoString = (match[1] || "").trim();
    if (!infoString) continue;

    // Parse the info string: "context:<path>", "context:add <path>", "context:remove <path>",
    // "knowledge:save <path>", or "knowledge:<path>"
    let action: ContextChange["action"];
    let path: string;
    let content = "";
    let saveToKnowledgeBase = false;

    if (infoString.startsWith("context:add ")) {
      action = "addTag";
      path = infoString.slice("context:add ".length).trim();
    } else if (infoString.startsWith("context:remove ")) {
      action = "removeTag";
      path = infoString.slice("context:remove ".length).trim();
    } else if (infoString.startsWith("context:view ")) {
      action = "view";
      path = infoString.slice("context:view ".length).trim();
      // view has no body — just show current content
      content = "";
    } else if (infoString.startsWith("knowledge:save ")) {
      // knowledge:save <path> — save to YiKnowledge directory
      path = infoString.slice("knowledge:save ".length).trim();
      saveToKnowledgeBase = true;
      const fenceStart = match.index;
      const result = extractFencedBody(messageText, fenceStart);
      if (result) {
        content = result.body.trim();
        CONTEXT_OPEN_RE.lastIndex = result.end;
      }
      action = content ? "saveToKB" : "addTag";
    } else if (infoString.startsWith("knowledge:")) {
      // knowledge:<path> — alias for knowledge:save
      path = infoString.slice("knowledge:".length).trim();
      saveToKnowledgeBase = true;
      const fenceStart = match.index;
      const result = extractFencedBody(messageText, fenceStart);
      if (result) {
        content = result.body.trim();
        CONTEXT_OPEN_RE.lastIndex = result.end;
      }
      action = content ? "saveToKB" : "addTag";
    } else if (infoString.startsWith("context:")) {
      path = infoString.slice("context:".length).trim();
      // Extract body using fence-aware parser
      const fenceStart = match.index;
      const result = extractFencedBody(messageText, fenceStart);
      if (result) {
        content = result.body.trim();
        CONTEXT_OPEN_RE.lastIndex = result.end;
      }
      // Determine action from content
      const originalContent = store.getContextSectionContent(path);
      if (!content) {
        action = "delete";
      } else if (originalContent) {
        action = "update";
      } else {
        action = "create";
      }
    } else {
      continue;
    }

    if (!path) continue;

    const originalContent = action === "update" || action === "delete"
      ? store.getContextSectionContent(path)
      : "";

    changes.push({ action, path, content, originalContent, saveToKnowledgeBase });
  }

  return changes;
}

/**
 * Check if a streaming message has an in-progress context: block
 * (opening fence found but no closing fence yet).
 */
export function hasPartialContextBlock(messageText: string): boolean {
  if (!messageText) return false;

  CONTEXT_OPEN_RE.lastIndex = 0;
  const lastMatch = (() => {
    let m: RegExpExecArray | null;
    let last: RegExpExecArray | null = null;
    while ((m = CONTEXT_OPEN_RE.exec(messageText)) !== null) last = m;
    return last;
  })();

  if (!lastMatch) return false;

  // Check if there's a closing ``` after this opening fence
  const fenceStart = lastMatch.index;
  const openEnd = messageText.indexOf("\n", fenceStart);
  if (openEnd < 0) return true; // opening line not even complete

  const afterOpen = messageText.slice(openEnd + 1);
  const closeRe = /^```\s*$/gm;
  return !closeRe.test(afterOpen);
}

/**
 * Reactive composable that watches the active conversation's messages and
 * extracts context changes from the latest pet message.
 *
 * Usage: const { latestChanges } = useLatestContextChanges();
 */
export function useLatestContextChanges(): {
  latestChanges: ComputedRef<ContextChange[]>;
} {
  const store = useAiChatStore();

  const latestChanges = computed<ContextChange[]>(() => {
    const msgs = store.activeConversation?.messages ?? [];
    if (!msgs.length) return [];

    // Find the last pet message with content
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (m && m.type === "pet" && (m.message ?? "").trim()) {
        return detectContextChanges(m.message ?? "");
      }
    }
    return [];
  });

  return { latestChanges };
}
