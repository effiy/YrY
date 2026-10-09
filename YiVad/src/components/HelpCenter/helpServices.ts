/**
 * HelpOS 反馈 & FAQ — Service Composable（中间层）。
 *
 *  ⚠️ 工程硬闸（对齐 YiVad 红线）：
 *    - UI 组件 禁止直接 import @/api/*；统一通过本 Composable 调用。
 *    - 所有请求必须接受 { timeout, signal } 并使用 AbortSignal.any([...]) 与内部去重控制器联合。
 *    - FAQ 远端超时 = 200ms（NFR-7.4），超过立即降级到本地静态 FAQ。
 *    - 反馈提交超时 = 15s；超过自动走 GitHub Issue fallback。
 */
import { yiAiBaseUrl, buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiAi";
import { TIMEOUT_CONFIG } from "@/config/timeout";
import type {
  FAQItem,
  FeedbackPayload,
  FeedbackTicket,
  HelpRequestOptions
} from "../components/HelpCenter/types";
import { STATIC_FAQ } from "./faq-static";

/* ──────────────────────────────────────────────────────────── */
/*  HelpOS — FAQ Service                                        */
/* ──────────────────────────────────────────────────────────── */

/**
 * 查询远端 FAQ；若超时或失败自动降级为本地 FAQ + tag `degraded`。
 * 注意：外部 signal 只负责"请求级取消"，200ms 熔断由内部独立控制器保证。
 */
export async function searchFAQ(
  query: string,
  opts: HelpRequestOptions = {}
): Promise<{ items: readonly FAQItem[]; degraded: boolean; latencyMs: number }> {
  const started = performance.now();
  const timeoutMs = opts.timeout ?? 200;

  const inner = new AbortController();
  const combinedSignal =
    opts.signal instanceof AbortSignal && typeof (AbortSignal as any).any === "function"
      ? (AbortSignal as any).any([opts.signal, inner.signal])
      : inner.signal;

  const timeoutId = setTimeout(() => inner.abort("faq-timeout"), timeoutMs);
  try {
    if (!query.trim()) {
      // 空查询：按 popularity 倒序返回前 8 条本地
      const items = [...STATIC_FAQ].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
      return { items, degraded: true, latencyMs: performance.now() - started };
    }

    // 本地先返回 + 远端并发，200ms 内远端胜出即替换（race）
    const body = new URLSearchParams({ q: query, limit: "20" });
    const remoteP = fetch(buildYiAiUrl(`/api/v1/faq/search?${body.toString()}`), {
      method: "GET",
      headers: yiAiAuthHeaders(),
      signal: combinedSignal
    }).then(async r => {
      if (!r.ok) throw new Error(`FAQ HTTP ${r.status}`);
      const json = (await r.json()) as { items?: FAQItem[]; data?: FAQItem[] };
      const list = json.items ?? json.data ?? [];
      return list;
    });

    const timeoutP = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("faq-race-timeout")), timeoutMs)
    );

    const items = await Promise.race([remoteP, timeoutP]).catch(() => null);
    if (items && Array.isArray(items)) {
      return { items, degraded: false, latencyMs: performance.now() - started };
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // 降级：本地模糊匹配（fuse.js fuzzySearch）
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fuzzySearch } = await import("@/utils/fuzzySearch");
  const hits = fuzzySearch(
    [...STATIC_FAQ],
    query,
    { keys: ["question", "answer", { name: "tags", weight: 2 }], threshold: 0.4, minMatchCharLength: 1 }
  ).slice(0, 8);
  return { items: hits.map(h => h.item), degraded: true, latencyMs: performance.now() - started };
}

/* ──────────────────────────────────────────────────────────── */
/*  HelpOS — Feedback Service                                   */
/* ──────────────────────────────────────────────────────────── */

const RATE_LIMIT_KEY = "yivad-help-feedback-ratelimit";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

/**
 * 提交反馈；失败（网络/限流/超时）时返回 GitHub 预填链接供用户 fallback。
 * 始终保证：即使 YiAi 不可达，用户仍能闭环（FR-06.2 双通道）。
 */
export async function submitFeedback(
  payload: FeedbackPayload,
  opts: HelpRequestOptions = {}
): Promise<{ ok: true; ticket: FeedbackTicket } | { ok: false; fallback: FeedbackFallback }> {
  // 1) 前端限流 3/min（对齐 STRIDE-DoS）
  if (!checkRateLimit()) {
    return { ok: false, fallback: buildGitHubFallback(payload, "rate_limited") };
  }

  // 2) Payload 大小 & 关键字检查
  const totalBytes = estimateBytes(payload);
  if (totalBytes > 2.5 * 1024 * 1024) {
    // 2.5MB 上限；失败时去掉截图
    return { ok: false, fallback: buildGitHubFallback(payload, "too_large") };
  }

  const timeoutMs = opts.timeout ?? 15_000;
  const inner = new AbortController();
  const combinedSignal =
    opts.signal instanceof AbortSignal && typeof (AbortSignal as any).any === "function"
      ? (AbortSignal as any).any([opts.signal, inner.signal])
      : inner.signal;
  const timeoutId = setTimeout(() => inner.abort("feedback-timeout"), timeoutMs);
  const requestId = cryptoRandomUUID();

  try {
    const resp = await fetch(buildYiAiUrl("/api/help/feedback"), {
      method: "POST",
      headers: {
        ...yiAiAuthHeaders(),
        "x-request-id": requestId,
        "Idempotency-Key": requestId
      },
      body: JSON.stringify(payload),
      signal: combinedSignal
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = (await resp.json()) as { code?: number; data?: FeedbackTicket; ticket?: FeedbackTicket };
    const ticket = json.data ?? json.ticket;
    if (!ticket?.ticketId) throw new Error("bad-response");
    return { ok: true, ticket };
  } catch {
    return { ok: false, fallback: buildGitHubFallback(payload, "network") };
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface FeedbackFallback {
  kind: "github_issue" | "clipboard_markdown";
  reason: "rate_limited" | "too_large" | "network";
  githubUrl: string;
  markdown: string;
}

export function buildGitHubFallback(payload: FeedbackPayload, reason: FeedbackFallback["reason"]): FeedbackFallback {
  const labels = payload.type === "bug" ? ["bug", "help-feedback"] : payload.type === "feature" ? ["enhancement", "help-feedback"] : ["help-feedback"];
  const title = `[${payload.type}] ${payload.title}`;
  const body = [
    `### 类型：${payload.type}`,
    `### 标题：${payload.title}`,
    "",
    "### 描述",
    payload.description,
    "",
    "### 环境信息（自动采集）",
    `- 脱敏 URL：\`${payload.sanitizedUrl}\``,
    `- UA：\`${payload.ua}\``,
    `- 屏幕：${payload.screen.w}x${payload.screen.h} @${payload.screen.dpr}x`,
    `- App 版本：${payload.appVersion}`,
    `- 语言：${payload.locale}`,
    `- YiAi Base：\`${payload.yiAiBaseUrl}\``,
    payload.screenshotDataUrl ? `- 截图：用户未自动上传（请手动粘贴）` : `- 截图：无`,
    "",
    `_提交原因：${reason}（自动降级）_`
  ].join("\n");

  const params = new URLSearchParams({
    title,
    body,
    labels: labels.join(",")
  });
  const githubUrl = `https://github.com/yipot/yivad/issues/new?${params.toString()}`;
  return { kind: "github_issue", reason, githubUrl, markdown: body };
}

/* ─────────────────────────────── helpers ─────────────────────── */

function cryptoRandomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "yivad-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function estimateBytes(p: FeedbackPayload): number {
  let n = p.title.length + p.description.length + p.sanitizedUrl.length + p.ua.length + p.appVersion.length + p.locale.length + p.yiAiBaseUrl.length;
  n += JSON.stringify(p.screen).length;
  if (p.screenshotDataUrl) n += p.screenshotDataUrl.length;
  return n;
}

function checkRateLimit(): boolean {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const arr: number[] = raw ? (JSON.parse(raw) as number[]) : [];
    const now = Date.now();
    const fresh = arr.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (fresh.length >= RATE_LIMIT_MAX) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(fresh));
      return false;
    }
    fresh.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(fresh));
    return true;
  } catch {
    return true;
  }
}

export { yiAiBaseUrl, TIMEOUT_CONFIG };
