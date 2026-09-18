import { ref, computed } from 'vue';

export interface ToolDefinition<TArgs = Record<string, unknown>> {
  name: string;
  label: string;
  description: string;
  promptSnippet?: string;
  promptGuidelines?: string[];
  parameters: Record<string, unknown>;
  execute(args: TArgs, signal?: AbortSignal): Promise<ToolResult>;
  preStream?: boolean;
  enabled?: boolean;
}

export interface ToolResult {
  content: string;
  details?: Record<string, unknown>;
  error?: string;
}

export interface ToolEvent {
  name: string;
  label: string;
  phase: 'start' | 'end';
  timestamp: number;
  error?: string;
  details?: Record<string, unknown>;
  args?: Record<string, unknown>;
  content?: string;
  durationMs?: number;
}

export function useToolRegistry() {
  const tools = ref<Map<string, ToolDefinition>>(new Map());
  const toolEvents = ref<ToolEvent[]>([]);
  const MAX_EVENTS = 100;

  function emitToolEvent(event: ToolEvent): void {
    toolEvents.value = [...toolEvents.value.slice(-(MAX_EVENTS - 1)), event];
  }

  function registerTool(tool: ToolDefinition): void {
    tools.value.set(tool.name, tool);
  }

  function unregisterTool(name: string): void {
    tools.value.delete(name);
  }

  function setToolEnabled(name: string, enabled: boolean): void {
    const tool = tools.value.get(name);
    if (tool) tool.enabled = enabled;
  }

  function getTool(name: string): ToolDefinition | undefined {
    return tools.value.get(name);
  }

  const allTools = computed(() => Array.from(tools.value.values()));
  const activeTools = computed(() => allTools.value.filter(t => t.enabled !== false));
  const preStreamTools = computed(() => activeTools.value.filter(t => t.preStream));
  const backgroundTools = computed(() => activeTools.value.filter(t => !t.preStream));

  function getToolsForSystemPrompt(): string {
    const list = activeTools.value;
    if (!list.length) return '';

    const lines: string[] = [
      '## Available Tools',
      '',
      'The following tools run automatically — you do NOT call them directly.',
      'Their results are injected into the conversation before you respond.',
      '',
    ];

    for (const tool of list) {
      const snippet = tool.promptSnippet || tool.description;
      lines.push(`- **${tool.label}** (\`${tool.name}\`): ${snippet}`);
    }

    const allGuidelines: string[] = [];
    for (const tool of list) {
      if (tool.promptGuidelines?.length) {
        allGuidelines.push(...tool.promptGuidelines.map(g => `- ${g}`));
      }
    }
    if (allGuidelines.length > 0) {
      lines.push('');
      lines.push('### Tool Usage Guidelines');
      lines.push(...allGuidelines);
    }

    return lines.join('\n');
  }

  async function executeTool(
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<ToolResult | null> {
    const tool = tools.value.get(name);
    if (!tool || tool.enabled === false) return null;

    const startEvent: ToolEvent = {
      name,
      label: tool.label,
      phase: 'start',
      timestamp: Date.now(),
      args,
    };
    emitToolEvent(startEvent);

    try {
      const result = await tool.execute(args, signal);
      const endEvent: ToolEvent = {
        name,
        label: tool.label,
        phase: 'end',
        timestamp: Date.now(),
        error: result.error,
        details: result.details,
        content: (result.content ?? '').slice(0, 500),
        durationMs: Date.now() - startEvent.timestamp,
      };
      emitToolEvent(endEvent);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const endEvent: ToolEvent = {
        name,
        label: tool.label,
        phase: 'end',
        timestamp: Date.now(),
        error: msg,
        durationMs: Date.now() - startEvent.timestamp,
      };
      emitToolEvent(endEvent);
      return { content: '', error: msg };
    }
  }

  async function executePreStreamTools(
    argsMap: Map<string, Record<string, unknown>>,
    signal?: AbortSignal,
  ): Promise<string> {
    const tasks = preStreamTools.value.map(async tool => {
      const args = argsMap.get(tool.name) ?? {};
      const result = await executeTool(tool.name, args, signal);
      return result?.content ?? '';
    });
    const results = await Promise.all(tasks);
    return results.filter(Boolean).join('\n\n');
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
