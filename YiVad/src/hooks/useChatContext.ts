/**
 * useChatContext — Pi-inspired context building pipeline.
 *
 * Separates context assembly from streaming mechanics. Takes session entries,
 * registered tools, and page content, and produces the LLM-ready message array.
 * Also estimates token usage and signals when compaction is needed.
 *
 * Pattern adapted from Pi's `buildSessionContext()` + `sessionEntryToContextMessages()`.
 */

import { computed, type Ref, type ComputedRef } from "vue";
import type { ChatEntry } from "@/api/interface/yiweb";
import type { ToolDefinition } from "@/hooks/useToolRegistry";

// ── Types ──

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface ContextOptions {
  /** System prompt (caller-provided, e.g. from file preview) */
  systemPrompt?: string;
  /** Max tokens before compaction should trigger */
  maxTokens?: number;
}

export interface ContextBuildResult {
  /** Messages ready for the LLM API call */
  messages: LLMMessage[];
  /** System prompt (passed separately to the chat API) */
  system: string;
  /** Estimated token count of all messages */
  estimatedTokens: number;
  /** True if compaction is recommended */
  needsCompaction: boolean;
}

// ── Token estimation ──

const CHARS_PER_TOKEN = 4; // Conservative: ~4 chars per token for English text

function estimateTokens(messages: LLMMessage[]): number {
  let chars = 0;
  for (const m of messages) {
    chars += m.content.length;
  }
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

// ── Constants ──

const DEFAULT_MAX_TOKENS = 8192; // Ollama qwen3 default context

// ── Composable ──

export function useChatContext(
  entries: Ref<ChatEntry[]>,
  tools: Ref<ToolDefinition[]>,
  pageContent: Ref<string>,
  extraSearchContext: Ref<string>,
  options: Ref<ContextOptions> = ref({}),
): {
  buildResult: ComputedRef<ContextBuildResult>;
  needsCompaction: ComputedRef<boolean>;
} {
  const buildResult = computed<ContextBuildResult>(() => {
    const parts: string[] = [];
    const messages: LLMMessage[] = [];

    // ── 1. System prompt assembly ──
    const sysParts: string[] = [];

    // Caller-provided system prompt (e.g. file preview context)
    const callerSys = options.value.systemPrompt?.trim();
    if (callerSys) sysParts.push(callerSys);

    // Tool descriptions
    const toolList = tools.value;
    if (toolList.length > 0) {
      const toolLines: string[] = [
        "## Available Tools",
        "",
        "The following tools run automatically — you do not call them yourself.",
        "Their results are injected into the conversation before you respond.",
        "",
      ];
      for (const tool of toolList) {
        toolLines.push(`- **${tool.label}** (\`${tool.name}\`): ${tool.description}`);
      }
      sysParts.push(toolLines.join("\n"));
    }

    // Context editing instructions (when pageContent is present)
    const pc = pageContent.value.trim();
    if (pc) {
      const filePaths = entries.value
        .filter(e => e.entryType === "message" && e.filePath)
        .map(e => e.filePath as string);
      const uniqueFiles = [...new Set(filePaths)];
      const fileList = uniqueFiles.map(f => `  - ${f}`).join("\n");

      sysParts.push(
        [
          "",
          "## Context File Editing",
          "",
          "You can edit the session's context files using code blocks with context: headers:",
          "",
          "```context:<path>",
          "<complete new markdown content>",
          "```",
          "",
          "Actions: `context:add <path>` (link), `context:remove <path>` (unlink),",
          "`context:view <path>` (show).",
          "",
          "Current context files:",
          fileList || "  (none)",
        ].join("\n"),
      );
    }

    const system = sysParts.filter(Boolean).join("\n\n");

    // ── 2. Page content (injected as user-role context) ──
    if (pc) {
      messages.push({ role: "user", content: pc, timestamp: 0 });
    }

    // ── 3. Extra search context (web search results) ──
    const sc = extraSearchContext.value.trim();
    if (sc) {
      messages.push({ role: "user", content: sc, timestamp: 0 });
    }

    // ── 4. Conversation history from entries ──
    for (const entry of entries.value) {
      if (entry.entryType === "message" && entry.role) {
        const msg = entry.message?.trim();
        if (msg) {
          messages.push({
            role: entry.role,
            content: msg,
            timestamp: entry.timestamp,
          });
        }
      } else if (entry.entryType === "tool_result" && entry.toolResult) {
        // Tool results are injected as system context
        messages.push({
          role: "user",
          content: `[Tool: ${entry.toolName}]\n${entry.toolResult}`,
          timestamp: entry.timestamp,
        });
      }
      // context_edit, model_change entries are not sent to the LLM
    }

    // ── 5. Token estimation ──
    const maxTokens = options.value.maxTokens ?? DEFAULT_MAX_TOKENS;
    const estimatedTokens = estimateTokens(messages) + Math.ceil(system.length / CHARS_PER_TOKEN);
    const needsCompaction = estimatedTokens > maxTokens * 0.8;

    return { messages, system, estimatedTokens, needsCompaction };
  });

  const needsCompaction = computed(() => buildResult.value.needsCompaction);

  return { buildResult, needsCompaction };
}
