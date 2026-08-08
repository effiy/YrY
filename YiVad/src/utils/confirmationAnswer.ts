/**
 * Chat confirmation answers — let a plain chat message answer a pending
 * tool-confirmation, pi-style (pi answers permission prompts with natural
 * language: `y`/`n`/free text) instead of requiring the banner button.
 *
 * While the agent loop is paused in `_wait_for_confirmation` (up to 120s),
 * the chat input is the only other thing the user can touch. An affirmative
 * word approves the pending write; a rejection rejects it. A reject with
 * extra text beyond the bare keyword is assumed to carry a correction, so the
 * caller steers the whole message into the running loop for the model to hear.
 *
 * Pure / dependency-free so it can be unit-tested without the store.
 */

/** Keyword that IS the whole answer — no correction follows. */
const AFFIRM_BARE = new Set([
  "yes", "y", "ok", "okay", "sure", "yeah", "yep", "yup",
  "好", "行", "可以", "同意", "批准", "确认", "对", "是", "中", "执行",
]);

const REJECT_BARE = new Set([
  "no", "n", "nah", "nope",
  "不", "别", "不行", "不要", "拒绝", "不同意", "取消", "否", "停", "不可以",
]);

/** Multi-token phrase that opens an answer — extra text may follow (a steer). */
const AFFIRM_PREFIX = [
  "go ahead", "do it", "yes please",
  "好的", "可以的", "没问题", "同意执行", "确认执行", "批准执行", "可以执行",
];

const REJECT_PREFIX = [
  "don't", "dont", "stop", "cancel it", "no way",
  "不要", "不可以", "不行", "别", "拒绝", "不同意", "取消", "停",
];

export interface ConfirmationAnswer {
  action: "approve" | "reject";
  /** True when the message IS the bare keyword (no correction to steer). */
  bare: boolean;
}

/** Classify a plain chat message as a confirmation answer, or null. */
export function confirmationAnswerFor(text: string): ConfirmationAnswer | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (AFFIRM_BARE.has(t)) return { action: "approve", bare: true };
  if (REJECT_BARE.has(t)) return { action: "reject", bare: true };
  if (AFFIRM_PREFIX.some(p => t.startsWith(p))) return { action: "approve", bare: false };
  if (REJECT_PREFIX.some(p => t.startsWith(p))) return { action: "reject", bare: false };
  return null;
}
