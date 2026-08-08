/**
 * Agent continuation detection — decide whether a chat message continues the
 * previous run ("继续") or starts a NEW task.
 *
 * Mirrors `YiAi/src/domain/ai/agent.py::_is_continuation` so the frontend and
 * the backend classify a post-`max_turns` message identically. Used to gate
 * `resume: true`: only a genuine continuation resumes the interrupted run. A
 * new task must NOT resume — the backend's `[RESUME]` merge injects a
 * "db_* 请勿重复执行" handoff note meant for 继续, which would tell the model to
 * skip the writes a new task needs.
 *
 * Pure / dependency-free so it can be unit-tested without the store.
 */

const BARE = new Set(["继续", "继续完成", "继续吧", "continue", "go on", "keep going", "接着来", "接着"]);

export function isContinuationMessage(text: string): boolean {
  const t = (text ?? "").trim().toLowerCase();
  if (!t) return false;
  return BARE.has(t) || t.startsWith("继续") || t.startsWith("接着") || t.startsWith("continue");
}
