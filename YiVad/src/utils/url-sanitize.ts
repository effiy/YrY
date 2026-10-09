/**
 * URL 脱敏工具（HelpOS STRIDE-Information Disclosure 缓解）。
 *
 * 规则（对齐 PRD §7.4.2 + Test §8 TC-SEC-I-01~12）：
 *   1) Query 参数：仅允许白名单 {route, page, lang}，其他全部替换为 ***；
 *   2) 敏感正则匹配（Token / Password / Key / Secret / JWT 签名段 / Cookie / Session / Bearer / 授权 Code）命中即替换；
 *   3) Hash / Fragment 一律删除（历史原因 #access_token=... 泄露常见）；
 *   4) 不保留任何凭据，不新增任何 PII。
 *
 * 本模块纯函数，无副作用。单元测试覆盖 12 条敏感参数数据集。
 */
const SAFE_QUERY_ALLOWLIST = new Set(["route", "page", "lang"]);

const SENSITIVE_KEY_REGEX =
  /(^|&|;|\?)(token|access_token|refresh_token|id_token|password|passwd|pwd|key|api_key|apikey|secret|client_secret|authorization|auth|jwt|session|session_id|sess|cookie|code|csrf|xsrf|sign|signature)(=([^&#;]*))/gi;

export function sanitizeUrl(input: string | URL | null | undefined): string {
  if (!input) return "";
  const raw = typeof input === "string" ? input : input.toString();
  if (!raw) return "";

  // 分离 fragment 并丢弃
  let safe = raw.split("#")[0] ?? raw;

  // 尝试按 URL 解析（若是相对路径，则 prepend origin 以便解析）
  let u: URL;
  try {
    u = new URL(safe, globalThis.location?.origin ?? "http://localhost");
  } catch {
    // 非 URL 格式 → 仅做正则打码后返回
    return maskSensitiveKeys(safe);
  }

  // 处理 Query：仅保留白名单，其他全部 ***
  const outParams = new URLSearchParams();
  for (const [k, vRaw] of u.searchParams.entries()) {
    const key = k.toLowerCase();
    if (SAFE_QUERY_ALLOWLIST.has(key)) {
      outParams.append(k, vRaw);
    } else {
      // 仍然保留键但值打码（便于支持后续排障时知道用户带了某参数但无敏感值）
      outParams.append(k, "***");
    }
  }
  u.search = outParams.toString();

  // 最后一道：正则扫描完整 URL 中敏感键值（包括非标准的 ; 分隔、URL 编码变体）
  let final = u.toString();
  final = maskSensitiveKeys(final);

  // 如果原始输入是相对路径，去掉前缀
  if (typeof input === "string" && !/^https?:\/\//i.test(input)) {
    try {
      const rel = new URL(final);
      final = rel.pathname + (rel.search || "") + (rel.hash || "");
    } catch {
      /* noop */
    }
  }
  return final;
}

function maskSensitiveKeys(s: string): string {
  return s.replace(SENSITIVE_KEY_REGEX, (match, prefix, key, _sep, value) => {
    if (value === undefined || value === "") return match;
    return `${prefix}${key}=***`;
  });
}
