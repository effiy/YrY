/**
 * useToolEvents — Tool event tracking composable for the AI chat store.
 *
 * Extracted from `aiChat.ts`. Pairs `start` and `end` tool events by name
 * and attaches them as per-message tool timelines (Pi-inspired pattern).
 */
import { Ref } from "vue";
import type { ChatMessage } from "@/api/interface/yiAi";

export interface ToolEvent {
  phase: "start" | "end";
  name: string;
  label?: string;
  args?: Record<string, unknown>;
  content?: string;
  error?: string;
  durationMs?: number;
}

export interface ToolEventsDeps {
  /** Tool events from useToolRegistry (reactive ref). */
  toolEvents: Ref<ToolEvent[]>;
  /** The setActiveMessages helper from the main store. */
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  /** Persist the active conversation to backend. */
  persistActive: () => Promise<boolean>;
}

export function useToolEvents(deps: ToolEventsDeps) {
  const { toolEvents, setActiveMessages, persistActive } = deps;

  /**
   * Attach tool calls fired during a turn to the pet message for that
   * turn (Pi-inspired: per-message tool timeline). Pairs `start` and `end`
   * events from toolEvents[startIdx:] by tool name, in order of appearance.
   */
  function attachTurnToolCalls(petTimestamp: number, startIdx: number): void {
    const slice = (toolEvents.value ?? []).slice(startIdx);
    // Pair start/end by name; in-flight tools (start, no end) appear as running.
    const starts = new Map<string, (typeof slice)[number]>();
    const calls: NonNullable<ChatMessage["toolCalls"]>[number][] = [];
    for (const e of slice) {
      if (e.phase === "start") {
        starts.set(e.name, e);
      } else {
        const s = starts.get(e.name);
        if (!s) continue;
        calls.push({
          name: s.name,
          label: s.label || s.name,
          args: s.args,
          content: e.content,
          error: e.error,
          durationMs: e.durationMs
        });
        starts.delete(e.name);
      }
    }
    // In-flight tools (start without end) — show as running.
    for (const s of starts.values()) {
      calls.push({
        name: s.name,
        label: s.label || s.name,
        args: s.args,
        content: "(running)"
      });
    }
    if (!calls.length) return;
    setActiveMessages(msgs => {
      const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
      if (idx < 0) return msgs;
      const next = [...msgs];
      next[idx] = { ...next[idx], toolCalls: calls };
      return next;
    });
    // Best-effort persist — don't block the UI on save.
    void persistActive();
  }

  return {
    attachTurnToolCalls
  };
}