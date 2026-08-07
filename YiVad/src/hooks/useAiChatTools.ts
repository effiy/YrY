import type { Ref } from "vue";
import type { ToolDefinition } from "@/hooks/useToolRegistry";
import type { WebSearchResult } from "@/api/modules/searchService";
import { webSearch, webFetch, formatSearchResults, formatFetchedContent } from "@/api/modules/searchService";

export interface AiChatToolsDeps {
  registerTool: (tool: ToolDefinition) => void;
  webSearchResults: Ref<WebSearchResult[]>;
  applyContextChange: (path: string, content: string) => Promise<void>;
  addContextFile: (path: string) => Promise<void>;
  removeContextFile: (path: string) => Promise<void>;
  saveContextToKnowledge: (path: string, content: string, metadata?: Record<string, unknown>) => Promise<any>;
}

export function registerAiChatTools(deps: AiChatToolsDeps): void {
  deps.registerTool({
    name: "web_fetch",
    label: "Web Fetch",
    description:
      "Fetches and extracts clean text content from a URL. " +
      "Use when the user provides a URL or when you need to read a web page.",
    promptSnippet: "Fetches web page content from URLs the user provides",
    promptGuidelines: [
      "When the user includes a URL in their message, the page content is automatically fetched and provided to you before you respond.",
      "Base your answer on the fetched content — cite specific details from the page.",
      "If the fetched content is insufficient, tell the user what you could see and suggest what else to look for.",
    ],
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to fetch" },
      },
      required: ["url"],
    },
    preStream: true,
    async execute(args) {
      const url = args.url as string;
      const result = await webFetch(url);
      if (result.error) return { content: "", error: result.error };
      return {
        content: formatFetchedContent(result.url, result.text),
        details: { url: result.url, charCount: result.text.length },
      };
    },
  });

  deps.registerTool({
    name: "web_search",
    label: "Web Search",
    description:
      "Searches the web via DuckDuckGo and returns current information. " +
      "Use for recent events, trending topics, or when you need up-to-date facts.",
    promptSnippet: "Searches the web for current information (DuckDuckGo)",
    promptGuidelines: [
      "Web search runs in the background and arrives as a follow-up message. In your first response, briefly acknowledge the query and indicate you're checking.",
      "When search results arrive, synthesize them into a clear, structured answer with source links.",
      "If the search returns no useful results, tell the user and suggest alternative approaches.",
    ],
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        maxResults: { type: "number", description: "Max results (1-15)", default: 6 },
      },
      required: ["query"],
    },
    preStream: false,
    async execute(args) {
      const query = args.query as string;
      const maxResults = (args.maxResults as number) ?? 6;
      const result = await webSearch(query, maxResults);
      if (result.error) return { content: "", error: result.error };
      const results = result.results ?? [];
      deps.webSearchResults.value = results;
      return {
        content: formatSearchResults(results),
        details: { query, resultCount: results.length },
      };
    },
  });

  deps.registerTool({
    name: "rag_search",
    label: "RAG Knowledge Search",
    description:
      "Searches the indexed knowledge base (YiKnowledge markdown files) " +
      "for relevant context. Automatically active when the session has " +
      "ctx:-tagged knowledge files.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language query" },
      },
      required: ["query"],
    },
    preStream: false,
    enabled: false,
    async execute(_args) {
      return { content: "", details: { mode: "streaming" } };
    },
  });

  deps.registerTool({
    name: "context_edit",
    label: "Context File Editor",
    description:
      "Proposes changes to the session's knowledge context files. " +
      "Supports create, update, delete, addTag, removeTag, and view actions " +
      "via fenced code blocks with `context:<path>` headers.",
    promptSnippet: "Edits session context files via `context:<path>` code blocks",
    promptGuidelines: [
      "For file edits, use ```context:<path> blocks with the COMPLETE new content (not just a diff).",
      "For linking files: ```context:add <path>  — for unlinking: ```context:remove <path>",
      "For showing a file's current content: ```context:view <path>",
      "The user must approve each change — they see visual cards with Apply/Reject buttons.",
    ],
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path within the context" },
        action: { type: "string", enum: ["create", "update", "delete", "addTag", "removeTag", "view"] },
        content: { type: "string", description: "New content (for create/update)" },
      },
      required: ["path", "action"],
    },
    preStream: false,
    enabled: true,
    async execute(args) {
      const path = args.path as string;
      const action = args.action as string;
      const content = (args.content as string) ?? "";
      if (action === "addTag") await deps.addContextFile(path);
      else if (action === "removeTag") await deps.removeContextFile(path);
      else await deps.applyContextChange(path, content);
      return {
        content: `Context file "${path}" ${action}${action === "view" ? "" : "d"}.`,
        details: { path, action },
      };
    },
  });

  deps.registerTool({
    name: "knowledge_write",
    label: "Knowledge Base Writer",
    description:
      "Persists markdown content to the YiKnowledge directory. " +
      "Use when the user asks to save, generate, or write content to the " +
      "knowledge base.",
    promptSnippet: "Saves content to YiKnowledge via `knowledge:save <path>` blocks",
    promptGuidelines: [
      "Use ```knowledge:save <path> blocks to persist content permanently to the knowledge base.",
      "The user must approve — they see a visual card with Save/Reject buttons.",
      'Examples: "generate a report and save it to the knowledge base" → knowledge:save reports/my-report.md',
      "Include complete markdown content with proper structure (headings, lists, code blocks).",
    ],
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative path under YiKnowledge, e.g. reports/q3-sales.md" },
        content: { type: "string", description: "Complete markdown content to write" },
        metadata: { type: "object", description: "Optional YAML frontmatter (title, tags, category, etc.)" },
      },
      required: ["path", "content"],
    },
    preStream: false,
    enabled: true,
    async execute(args) {
      const path = args.path as string;
      const content = args.content as string;
      const metadata = (args.metadata as Record<string, unknown>) ?? {};
      await deps.saveContextToKnowledge(path, content, metadata);
      return {
        content: `Saved "${path}" to the YiKnowledge directory.`,
        details: { path, action: "knowledge_write" },
      };
    },
  });
}