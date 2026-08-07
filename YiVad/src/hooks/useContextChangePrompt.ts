import { computed, type Ref } from "vue";
import type { SessionDocument } from "@/api/interface/yiweb";

export function useContextChangePrompt(activeConversation: Ref<SessionDocument | null>) {
  /**
   * System prompt snippet that teaches the AI how to propose context file edits
   * and save content to the knowledge base. Always provides knowledge base write
   * instructions; context file editing instructions are included when the session
   * has ctx:-tagged files.
   */
  const contextChangeSystemPrompt = computed(() => {
    const files = (activeConversation.value?.tags ?? [])
      .filter(t => typeof t === "string" && t.startsWith("ctx:"))
      .map(t => (t as string).slice(4));
    const hasContent = (activeConversation.value?.pageContent ?? "").trim().length > 0;
    const hasContextFiles = files.length > 0 || hasContent;

    // Always provide KB write capability
    const kbSection = [
      "",
      "## CRITICAL: Saving content to the Knowledge Base",
      "",
      "When the user asks you to save, generate, write, or create any document, report,",
      "note, or file in the knowledge base, you MUST wrap your content in a",
      "`knowledge:save <path>` fenced code block. This is REQUIRED — do NOT output",
      "the content as plain markdown.",
      "",
      "**Format (required):**",
      "",
      "```knowledge:save <path/to/file.md>",
      "<YOUR COMPLETE CONTENT HERE — the entire document>",
      "```",
      "",
      "**Trigger phrases** (any of these → MUST use knowledge:save block):",
      '- "generate a report and save it to the knowledge base"',
      '- "save to knowledge base" / "write to knowledge base"',
      '- "create a document/report/note"',
      '- "write this to YiKnowledge"',
      '- "generate a report"',
      '- "put in knowledge base" / "save into knowledge base"',
      "",
      "**Examples of correct responses:**",
      "",
      "User: Generate a Q3 sales report and save it to the knowledge base",
      "Your response (the ENTIRE content inside the block will be saved):",
      "",
      "```knowledge:save reports/q3-sales-analysis.md",
      "# Q3 Sales Data Analysis Report",
      "",
      "## Overview",
      "...full report content...",
      "```",
      "",
      "User: Write a deployment guide to the knowledge base",
      "Your response:",
      "",
      "```knowledge:save docs/deployment-guide.md",
      "# Deployment Guide",
      "...full document content...",
      "```",
      "",
      "**Path naming**: Use descriptive paths like `reports/q3-sales.md`,",
      "`docs/api-guide.md`, `notes/meeting-2026-08-02.md`.",
      "**Content**: Include the COMPLETE document inside the block. The user",
      "will see a visual card with a \"Save to Knowledge Base\" button.",
      "",
    ].join("\n");

    // Context file editing instructions — only when session has context files
    if (!hasContextFiles) return kbSection;

    const fileList = files.map(f => `  - ${f}`).join("\n");
    const contextSection = [
      "",
      "## Session context file editing",
      "",
      "You can also manage the session's context files. The user will see visual cards and can apply or reject your proposals.",
      "",
      "**Editing file content** — use `context:<path>`:",
      "",
      "```context:<path>",
      "<the complete new markdown content for this file>",
      "```",
      "",
      "**Adding a file to context** — use `context:add <path>` (tag only, no content required):",
      "",
      "```context:add <path>",
      "```",
      "",
      "**Removing a file from context** — use `context:remove <path>`:",
      "",
      "```context:remove <path>",
      "```",
      "",
      "**Showing a file to the user** — use `context:view <path>`:",
      "",
      "```context:view <path>",
      "```",
      "",
      "**Actions summary:**",
      "- **Create/Update session context**: use `context:<path>` with COMPLETE new content",
      "- **Delete from context**: use an empty `context:<path>` block",
      "- **Add to context**: use `context:add <path>` to link a file without editing it",
      "- **Remove from context**: use `context:remove <path>` to unlink a file",
      "- **View file**: use `context:view <path>` to show current content",
      "",
      "Current context files:",
      fileList || "  (none)",
      "",
      "**Important:** For create/update, include COMPLETE file content, not just a diff.",
    ].join("\n");

    return kbSection + "\n" + contextSection;
  });

  return { contextChangeSystemPrompt };
}