const APPROVE_BARE = new Set([
  "yes", "y", "ok", "okay", "sure", "yeah", "yep", "yup",
  "好", "行", "可以", "同意", "批准", "确认", "对", "是", "中", "执行",
]);

const REJECT_BARE = new Set([
  "no", "n", "nah", "nope",
  "不", "别", "不行", "不要", "拒绝", "不同意", "取消", "否", "停", "不可以",
]);

const APPROVE_PREFIXES = [
  "好的", "可以", "行", "同意", "执行", "批准", "确认",
  "yes", "ok", "go ahead", "do it", "please", "sure", "yeah", "yep", "yup",
];

const REJECT_PREFIXES = [
  "不要", "不行", "不", "别", "取消", "拒绝", "不可以",
  "no", "don't", "stop",
];

const AMBIGUOUS = new Set(["now", "not"]);

export interface ConfirmationResult {
  action: "approve" | "reject";
  bare: boolean;
}

export function confirmationAnswerFor(text: string): ConfirmationResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  if (AMBIGUOUS.has(lower)) return null;

  if (APPROVE_BARE.has(lower)) return { action: "approve", bare: true };
  if (REJECT_BARE.has(lower)) return { action: "reject", bare: true };

  for (const prefix of APPROVE_PREFIXES) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      return { action: "approve", bare: false };
    }
  }

  for (const prefix of REJECT_PREFIXES) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      return { action: "reject", bare: false };
    }
  }

  return null;
}