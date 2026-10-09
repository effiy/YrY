/**
 * HelpOS 更新日志生成器（Gold Copy 静态种子 + 运行时加载 CHANGELOG.md）。
 *
 *  开发期：加载根目录 CHANGELOG.md（若存在）并按 Conventional Commits 分类；
 *  生产构建：CI scripts/ci/check-help-changelog.mjs 产出 changelog-generated.json 随 bundle 发布；
 *  最小降级：当外部文件缺失时，至少包含 2 条历史版本 + Unreleased 占位。
 */
import type { ChangelogEntry, ChangelogSectionType } from "../components/HelpCenter/types";

const TYPES: readonly ChangelogSectionType[] = [
  "feat", "fix", "docs", "refactor", "perf", "chore", "security", "breaking"
];

const SEED: ChangelogEntry[] = [
  {
    version: "Unreleased",
    date: new Date().toISOString().slice(0, 10),
    summary: "下一版本预览（含 HelpOS 5 Tab 与 命令面板 aliases）",
    released: false,
    sections: [
      { type: "feat", description: "新增 HelpOS 帮助中心（? 键 3 入口触发）", scope: "help" },
      { type: "feat", description: "命令面板新增 > help / > shortcuts / > changelog / > feedback / > report bug aliases", scope: "command" },
      { type: "fix", description: "useProjectDetail 错误调用 DisposerBag.dispose() 导致的 CanceledError 级联触发（改用 reset）", scope: "hooks" },
      { type: "security", description: "反馈通道 URL 脱敏新增 6 类关键字打码：token / password / key / secret / jwt / session" }
    ]
  },
  {
    version: "1.8.3",
    date: "2026-10-05",
    summary: "修复 RAG BM25 默认参数 + YiAi SSE 10086 默认端口迁移",
    released: true,
    sections: [
      { type: "fix", description: "RAG 默认 BM25，Embedding 默认关闭（RAG_EMBED_KILL_SWITCH=true）", scope: "rag" },
      { type: "fix", description: "useNotificationSSE 统一用 yiAiBaseUrl 动态拼装，移除所有硬编码 127.0.0.1:7777 / :8787 残留", scope: "sse" },
      { type: "perf", description: "Rsbuild: 默认关闭 tools.tsChecker 以优化 HMR ≤ 650ms", scope: "build" },
      { type: "docs", description: "YiVad README：补齐 24 章、三阶入门红线与 SRE GameDay 6 套演练方案" }
    ]
  },
  {
    version: "1.8.2",
    date: "2026-09-28",
    summary: "命令面板 + 快捷键注册表 + Bug 批量归档",
    released: true,
    sections: [
      { type: "feat", description: "全局快捷键注册表（YV-09-43），5 作用域 × 5 分类", scope: "shortcuts" },
      { type: "feat", description: "命令面板 YV-09-68：支持 Issue / Project / Page 混合搜索 + Quick Actions" },
      { type: "feat", description: "Bug 列表支持 批量归档 / 批量改派 / 批量打标签", scope: "bugs" }
    ]
  }
];

/** 外部可重写：构建期注入后直接替代 SEED。 */
let overrideData: ChangelogEntry[] | null = null;

export function setChangelogData(arr: ChangelogEntry[]): void {
  overrideData = Array.isArray(arr) ? arr : null;
}

export const CHANGELOG_DATA: readonly ChangelogEntry[] = SEED;

/**
 * 构建 changelog：优先使用 overrideData（CI 注入的 JSON），否则降级 SEED。
 * 返回按 version 字符串降序（Unreleased 永远排第一若存在）。
 */
export function listChangelog(): ChangelogEntry[] {
  const src = overrideData ?? CHANGELOG_DATA;
  return [...src].sort((a, b) => {
    if (a.version === "Unreleased") return -1;
    if (b.version === "Unreleased") return 1;
    return semverCompare(b.version, a.version);
  });
}

/** 校验 Conventional Commits 覆盖度：PRD §7 CG-1 要求 ≥ 95%，< 80% FAIL 发布流水线。 */
export function computeChangelogCoverage(entries: ChangelogEntry[]): { covered: number; total: number; ratio: number } {
  let covered = 0;
  let total = 0;
  for (const entry of entries) {
    for (const s of entry.sections) {
      total += 1;
      if (TYPES.includes(s.type)) covered += 1;
    }
  }
  const ratio = total === 0 ? 1 : covered / total;
  return { covered, total, ratio };
}

function semverCompare(a: string, b: string): number {
  const pa = String(a).replace(/^v/, "").split(".").map(x => Number(x) || 0);
  const pb = String(b).replace(/^v/, "").split(".").map(x => Number(x) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}
