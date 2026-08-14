/**
 * agentEvent.ts — pure transforms for agent SSE events (dsh: tool-call timeline).
 *
 * The aiChat store and KnowledgeChatPanel both consume the same `/agent/chat`
 * event stream but render into different reactive containers. The per-event
 * interpretation used to be copy-pasted between them — tool-name labelling,
 * `tool_results` → tool-call mapping, the running→finalized tool lifecycle, and
 * the escalation / max-turns notices. Every new event type had to be added in
 * two places and the two copies drifted (the recurring "parity" fixes in the
 * change log). These pure helpers are the single source of truth; both surfaces
 * share them, mirroring the `continuation.ts` / `confirmationAnswer.ts` pattern.
 */
import type { AgentStreamEvent } from "@/api/modules/agentService";
import type { ToolCallEntry } from "@/views/aiChat/types";

/** "db_create" → "Db Create" (snake_case tool name → human label). */
export function toolLabel(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** turn_end `tool_results` → per-message tool-call entries. */
export function toolCallsFromResults(
  results: AgentStreamEvent["tool_results"] | undefined
): ToolCallEntry[] {
  return (results ?? []).map(tr => ({
    name: tr.name,
    label: toolLabel(tr.name),
    content: tr.content,
    error: tr.error,
    durationMs: tr.duration_ms,
  }));
}

/** tool_execution_start `tool` → a "(running)" entry for the live timeline. */
export function runningToolCall(
  tool: NonNullable<AgentStreamEvent["tool"]>
): ToolCallEntry {
  return {
    name: tool.name,
    label: tool.label || toolLabel(tool.name),
    content: "(running)",
  };
}

/** tool_execution_end: finalize the matching call. Pure — returns a new array. */
export function finalizeToolCall(
  calls: ToolCallEntry[],
  tool: NonNullable<AgentStreamEvent["tool"]>
): ToolCallEntry[] {
  const idx = calls.findIndex(c => c.name === tool.name);
  if (idx < 0) return calls;
  const next = [...calls];
  const call = { ...next[idx] };
  if (tool.content) call.content = tool.content;
  else if (call.content === "(running)") call.content = "";
  call.error = tool.error;
  call.durationMs = tool.duration_ms;
  next[idx] = call;
  return next;
}

/** Escalation notice: the loop handed off to a stronger model mid-task. */
export function modelSwitchNotice(from: string, to: string): string {
  return `\n\n> ⚙️ 模型自动切换：${from} → ${to}\n\n`;
}

/** Max-turns notice: the loop ran out of turns mid-task (reply 继续 to resume). */
export const MAX_TURNS_NOTICE =
  "\n\n> ⚠️ 已达到最大轮次，任务可能未完成。回复「继续」可接着完成。\n\n";
