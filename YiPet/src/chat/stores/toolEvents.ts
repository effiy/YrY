/**
 * Tool Events Store — tool registry and event tracking.
 * Wraps the useToolRegistry composable in a Pinia store.
 */
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useToolRegistry, type ToolDefinition, type ToolEvent, type ToolResult } from '@/chat/composables/useToolRegistry';

export type { ToolDefinition, ToolEvent, ToolResult };

export const useToolEventsStore = defineStore('toolEvents', () => {
  const registry = useToolRegistry();

  return {
    // State
    toolEvents: registry.toolEvents,

    // Computed
    allTools: registry.allTools,
    activeTools: registry.activeTools,
    preStreamTools: registry.preStreamTools,
    backgroundTools: registry.backgroundTools,

    // Actions
    registerTool: registry.registerTool,
    unregisterTool: registry.unregisterTool,
    setToolEnabled: registry.setToolEnabled,
    getTool: registry.getTool,
    getToolsForSystemPrompt: registry.getToolsForSystemPrompt,
    emitToolEvent: registry.emitToolEvent,
    executeTool: registry.executeTool,
    executePreStreamTools: registry.executePreStreamTools,
  };
});