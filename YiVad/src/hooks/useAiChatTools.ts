/**
 * Register AI chat tools with the tool registry.
 * Called at store initialization to wire up store methods.
 */
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import type { ContextChange } from "@/hooks/useContextChanges";

interface ToolContext {
  registerTool: (def: Record<string, any>) => void;
  webSearchResults: any;
  applyContextChange: (change: ContextChange) => void;
  addContextFile: (file: string | KnowledgeFileEntry) => void;
  removeContextFile: (path: string) => void;
  saveContextToKnowledge: () => void;
}

export function registerAiChatTools(ctx: ToolContext): void {
  ctx.registerTool({
    name: "web_search_toggle",
    description: "Toggle web search",
    parameters: { type: "object", properties: {} },
  });

  ctx.registerTool({
    name: "context_save",
    description: "Save current context to YiKnowledge",
    parameters: { type: "object", properties: {} },
  });
}