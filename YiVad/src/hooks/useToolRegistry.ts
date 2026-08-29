/**
 * useToolRegistry — Pi-inspired pluggable tool system for the AI chat.
 *
 * Each tool is registered with a name, description (for the LLM system prompt),
 * JSON Schema parameters, and an execute function. The registry tracks which
 * tools run before streaming (pre-stream, blocking) vs. in the background.
 *
 * Pattern adapted from Pi's `ExtensionAPI.registerTool()` + `ToolDefinition`.
 */

import { ref, computed } from "vue";

// ── Types ──

export interface ToolDefinition<TArgs = Record<string, unknown>> {
  /** Unique tool name (e.g. "web_search", "web_fetch") */
  name: string;
  /** Human-readable label for UI */
  label: string;
  /** Description for the LLM system prompt */
  description: string;
  /** One-liner for the "Available Tools" list (Pi: promptSnippet).
   *  If absent, uses description. */
  promptSnippet?: string;
  /** Guideline bullets appended to the system prompt (Pi: promptGuidelines).
   *  Each string is a bullet point teaching the LLM when/how to use this tool. */
  promptGuidelines?: string[];
  /** JSON Schema for parameters */
  parameters: Record<string, unknown>;
  /** Execute the tool. Returns structured result. */
  execute(args: TArgs, signal?: AbortSignal): Promise<ToolResult>;
  /** If true, this tool runs before the AI stream starts (blocking).
   *  Default: false (runs in background). */
  preStream?: boolean;
  /** If true, the tool is enabled (registered but inactive tools are skipped). */
  enabled?: boolean;
}

export interface ToolResult {
  /** Markdown content to inject into the LLM context */
  content: string;
  /** Structured metadata (e.g. result count, URLs, response IDs) */
  details?: Record<string, unknown>;
  /** Set if the tool encountered an error */
  error?: string;
}

// ── Composable ──

// ── Tool execution events (Pi-inspired: tool_execution_start/end events) ──

export interface ToolEvent {
  name: string;
  label: string;
  phase: "start" | "end";
  timestamp: number;
  error?: string;
  details?: Record<string, unknown>;
  /** Arguments passed to the tool (Pi-inspired: per-call visibility).
   *  Set on `start` events so the UI can show what's being invoked. */
  args?: Record<string, unknown>;
  /** Result content (truncated for display). Set on `end` events. */
  content?: string;
  /** Duration in ms. Set on `end` events. */
  durationMs?: number;
}

export function useToolRegistry() {
  const tools = ref<Map<string, ToolDefinition>>(new Map());

  // Reactive event log — consumed by UI to show tool execution status.
  // Cap at 100 so per-tool stats (avg/median/p90/max) retain enough samples
  // for p90 to separate from max meaningfully (n>=11 required).
  const toolEvents = ref<ToolEvent[]>([]);
  const MAX_EVENTS = 100;

  function emitToolEvent(event: ToolEvent): void {
    toolEvents.value = [...toolEvents.value.slice(-(MAX_EVENTS - 1)), event];
  }

  // ── Registration ──

  function registerTool(tool: ToolDefinition): void {
    tools.value.set(tool.name, tool);
  }

  function unregisterTool(name: string): void {
    tools.value.delete(name);
  }

  /** Enable or disable a tool by name. */
  function setToolEnabled(name: string, enabled: boolean): void {
    const tool = tools.value.get(name);
    if (tool) tool.enabled = enabled;
  }

  function getTool(name: string): ToolDefinition | undefined {
    return tools.value.get(name);
  }

  // ── Derived views ──

  /** All registered tools. */
  const allTools = computed(() => Array.from(tools.value.values()));

  /** Tools that are both enabled and registered. */
  const activeTools = computed(() => allTools.value.filter(t => t.enabled !== false));

  /** Pre-stream tools — must complete before the AI starts responding. */
  const preStreamTools = computed(() => activeTools.value.filter(t => t.preStream));

  /** Background tools — run in parallel with the AI stream. */
  const backgroundTools = computed(() => activeTools.value.filter(t => !t.preStream));

  // ── Prompt formatting ──

  /**
   * Format all active tools as a system prompt snippet.
   * Tells the LLM what tools are available and how to use them.
   */
  function getToolsForSystemPrompt(): string {
    const list = activeTools.value;
    if (!list.length) return "";

    const lines: string[] = [
      "## Available Tools",
      "",
      "The following tools run automatically — you do NOT call them directly.",
      "Their results are injected into the conversation before you respond.",
      "",
    ];

    for (const tool of list) {
      const snippet = tool.promptSnippet || tool.description;
      lines.push(`- **${tool.label}** (\`${tool.name}\`): ${snippet}`);
    }

    // Collect all guidelines
    const allGuidelines: string[] = [];
    for (const tool of list) {
      if (tool.promptGuidelines?.length) {
        allGuidelines.push(...tool.promptGuidelines.map(g => `- ${g}`));
      }
    }
    if (allGuidelines.length > 0) {
      lines.push("");
      lines.push("### Tool Usage Guidelines");
      lines.push(...allGuidelines);
    }

    return lines.join("\n");
  }

  // ── Execution ──

  /**
   * Execute a tool by name and return its result.
   * Returns null if the tool is not registered.
   */
  async function executeTool(
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<ToolResult | null> {
    const tool = tools.value.get(name);
    if (!tool || tool.enabled === false) return null;

    const startEvent: ToolEvent = {
      name, label: tool.label, phase: "start", timestamp: Date.now(),
      args,
    };
    emitToolEvent(startEvent);

    try {
      const result = await tool.execute(args, signal);
      const endEvent: ToolEvent = {
        name, label: tool.label, phase: "end",
        timestamp: Date.now(),
        error: result.error,
        details: result.details,
        content: (result.content ?? "").slice(0, 500),
        durationMs: Date.now() - startEvent.timestamp,
      };
      emitToolEvent(endEvent);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const endEvent: ToolEvent = {
        name, label: tool.label, phase: "end", timestamp: Date.now(),
        error: msg,
        durationMs: Date.now() - startEvent.timestamp,
      };
      emitToolEvent(endEvent);
      return { content: "", error: msg };
    }
  }

  /**
   * Execute multiple pre-stream tools in parallel and return combined context.
   */
  async function executePreStreamTools(
    argsMap: Map<string, Record<string, unknown>>,
    signal?: AbortSignal,
  ): Promise<string> {
    const tasks = preStreamTools.value.map(async tool => {
      const args = argsMap.get(tool.name) ?? {};
      const result = await executeTool(tool.name, args, signal);
      return result?.content ?? "";
    });
    const results = await Promise.all(tasks);
    return results.filter(Boolean).join("\n\n");
  }

  return {
    tools,
    toolEvents,
    emitToolEvent,
    allTools,
    activeTools,
    preStreamTools,
    backgroundTools,
    registerTool,
    unregisterTool,
    setToolEnabled,
    getTool,
    getToolsForSystemPrompt,
    executeTool,
    executePreStreamTools,
  };
}
