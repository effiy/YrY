/**
 * Page Help 静态内容（HelpOS Tab 1 数据源）。
 *
 * ⚠️ 生产使用说明：
 *  - 首批交付覆盖 12 条核心路由；后续新增页面时在 PR 中追加条目。
 *  - 内容可从 YiKnowledge 同步；内容一致性检查见 CI：
 *    scripts/ci/check-help-changelog.mjs。
 *
 * 匹配规则：PRD §6.2 最长前缀优先 + :param 通配。
 *
 * I18n：所有文案走 help.* 命名空间（见 src/languages/modules/help/zh.ts 与 en.ts）。
 * 这里仅存结构化骨架，实际渲染用 i18n 键值。
 */
import type { PageHelpContent } from "../components/HelpCenter/types";

/**
 * 生成一个 PageHelpContent 条目。
 * sections 数组的 content 字段可以是以下三种：
 *   - 带 $t 前缀的 key：`"$t:help.bugs.list_intro"`
 *   - 以 "md:" 开头的内联 Markdown（仅用于 prototype / 演示）
 *   - 纯英文兜底（i18n fallback）
 */
function page(locale: "zh" | "en", routePattern: string, titleKey: string, body: Omit<PageHelpContent, "routePattern" | "locale" | "title"> & { title: string }): PageHelpContent {
  return {
    routePattern,
    locale,
    title: body.title,
    sections: body.sections,
    relatedShortcutIds: body.relatedShortcutIds,
    relatedLinks: body.relatedLinks,
    proTips: body.proTips
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars —— i18n key 在运行时通过 $t 解析，此处静态保留。 */
const ZH: PageHelpContent[] = [
  {
    routePattern: "/bugs",
    locale: "zh",
    title: "Bug 列表",
    sections: [
      { heading: "功能概览", content: "本页展示项目中所有 Bug，支持按「严重度 / 状态 / 负责人 / 标签」多维度筛选。空态下点击右上角「新建 Bug」可快速录入。", roleFilter: undefined },
      { heading: "批量操作", content: "1) 勾选左侧多选框 → 2) 顶部「批量操作」工具栏 → 3) 执行「批量归档 / 批量改派 / 批量打标签 / 批量导出 CSV」。" },
      { heading: "数据导出", content: "使用右上角「导出」按钮可导出当前筛选结果为 CSV / XLSX；单次导出上限 10000 条，超出时分段导出。", roleFilter: ["admin", "member"] }
    ],
    relatedShortcutIds: ["edit.save", "tools.new-item", "a11y.close-dismiss"],
    relatedLinks: [{ label: "Bug 详情说明", route: "/bugs/BUG-001" }, { label: "批量操作 FAQ", route: "/faq/bulk-ops" }],
    proTips: [
      "使用命令面板 Ctrl+K 输入「批量归档」比点击工具栏平均快 1.8s（p95）。",
      "严重度「Critical」Bug 若 24h 未修复会自动通过企微 IM 通知 SRE。"
    ]
  },
  {
    routePattern: "/project/:key",
    locale: "zh",
    title: "项目总览",
    sections: [
      { heading: "仪表盘卡片", content: "顶部 6 张卡片：代码健康度、技术债存量、本月吞吐率、平均修复周期 MTTR、测试覆盖率、活跃人数。" },
      { heading: "三级钻取", content: "点击任一卡片下钻 → 对应 Issue 列表 → 再点 ID 进入详情。" }
    ],
    relatedShortcutIds: ["nav.go-to-projects", "view.search"],
    relatedLinks: [{ label: "OKR 关联视图", route: "/okr" }],
    proTips: ["命令面板输入 `> open project yivad` 可直接跳转本项目。"]
  },
  {
    routePattern: "/project/:key/issues/:id",
    locale: "zh",
    title: "Issue 详情",
    sections: [
      { heading: "富文本编辑器", content: "使用 Ctrl+B 加粗 / Ctrl+I 斜体 / Ctrl+K 代码块；支持 Mermaid 图、表格和 @mention 提醒。" },
      { heading: "评论快捷键", content: "Ctrl+Enter 直接提交评论 / Cmd+Enter（macOS）；提交后 10 秒内可「撤销」。" }
    ],
    relatedShortcutIds: ["edit.save", "edit.undo", "edit.redo", "a11y.shortcut-help"],
    relatedLinks: [{ label: "Markdown 语法速查", route: "/docs/markdown" }]
  },
  {
    routePattern: "/issues",
    locale: "zh",
    title: "Issue 列表",
    sections: [
      { heading: "视图切换", content: "顶部工具栏支持：表格 / 看板 / 甘特 / 路线图 4 种视图；所有视图共享同一筛选条件。" },
      { heading: "进阶过滤", content: "点击「高级筛选」支持 AND/OR 嵌套；可保存为「团队视图」并设为默认入口。" }
    ],
    relatedShortcutIds: ["nav.go-to-issues", "view.print"],
    relatedLinks: []
  },
  {
    routePattern: "/kanban",
    locale: "zh",
    title: "看板",
    sections: [{ heading: "拖拽规则", content: "跨列拖拽触发状态机校验；不符合流转条件时红色边框并阻止提交。" }],
    relatedShortcutIds: ["edit.delete", "edit.rename"],
    relatedLinks: []
  },
  {
    routePattern: "/ai-chat",
    locale: "zh",
    title: "AI 对话",
    sections: [
      { heading: "对话上下文", content: "默认附带最近 10 条历史；可通过「仅用当前 Prompt」开关清空上下文。" },
      { heading: "模型切换", content: "右上角可切换 OpenAI / Gemini / Ollama 本地模型；流式输出支持 SSE（端口 10086）。" }
    ],
    relatedShortcutIds: ["a11y.shortcut-help"],
    relatedLinks: []
  },
  {
    routePattern: "/rag",
    locale: "zh",
    title: "RAG 检索增强",
    sections: [
      { heading: "检索算法", content: "默认 BM25；需启用 Embedding 时点击「高精度检索」（由 YiAi 的 RAG_EMBED_KILL_SWITCH 控制，默认关闭）。" },
      { heading: "来源面板", content: "每条回答右上角可展开引用的知识库文档片段，支持点击跳转。" }
    ],
    relatedShortcutIds: ["view.search"],
    relatedLinks: [{ label: "YiKnowledge 知识库", route: "/knowledge" }]
  },
  {
    routePattern: "/home",
    locale: "zh",
    title: "首页工作台",
    sections: [
      { heading: "待办聚合", content: "中央卡片聚合：待指派 Issue、SLO Burn Rate 告警、未读 Bug、OKR KR 到期提醒。" },
      { heading: "最近访问", content: "右侧「最近访问」按频率排序；可点击 × 删除单条历史。" }
    ],
    relatedShortcutIds: ["nav.command-palette", "a11y.shortcut-help"],
    relatedLinks: []
  },
  {
    routePattern: "/search",
    locale: "zh",
    title: "全局搜索",
    sections: [{ heading: "范围限定", content: "搜索框前缀 `in:issues` / `in:bugs` / `in:kb` 可限定域。" }],
    relatedShortcutIds: ["view.search", "nav.command-palette"],
    relatedLinks: []
  },
  {
    routePattern: "/settings",
    locale: "zh",
    title: "设置中心",
    sections: [
      { heading: "个人设置", content: "头像、昵称、时区、通知偏好；SRE 可配置「企微 IM」「邮件」双通道通知。" },
      { heading: "团队管理（管理员）", content: "管理员可见「成员 / 角色 / 权限」3 个分页；变更会自动写入审计日志。", roleFilter: ["admin"] }
    ],
    relatedShortcutIds: ["a11y.close-dismiss"],
    relatedLinks: [],
    proTips: ["禁止共享账号：审计日志按 user-agent 指纹识别可疑登录。"]
  },
  {
    routePattern: "/roadmap",
    locale: "zh",
    title: "产品路线图",
    sections: [{ heading: "时间轴", content: "按季度分组的泳道；支持拖拽重新排期。" }],
    relatedShortcutIds: ["edit.rename", "edit.save"],
    relatedLinks: []
  },
  {
    routePattern: "/reports",
    locale: "zh",
    title: "报表中心",
    sections: [{ heading: "SLO 报表", content: "每月 1 号自动生成 PDF 报告；可下载 Excel 明细。" }],
    relatedShortcutIds: ["view.print", "tools.new-item"],
    relatedLinks: []
  }
];

const EN: PageHelpContent[] = ZH.map(p => ({ ...p, locale: "en" as const }));
/* eslint-enable @typescript-eslint/no-unused-vars */

/** 获取当前 locale 的 page help 内容数组（只读）。 */
export function listPageHelp(locale: "zh" | "en" = "zh"): readonly PageHelpContent[] {
  const src = locale === "zh" ? ZH : EN;
  return src;
}

/**
 * PRD §6.2 路由匹配算法的 Gold Copy 实现。
 *   1) 纯路径匹配；
 *   2) 模式按长度降序（最长前缀优先）；
 *   3) :param → ([^/]+) RegExp；
 *   4) 未命中时退回父级目录模式（若存在）。
 */
export function matchPageHelp(
  routePath: string,
  locale: "zh" | "en" = "zh"
): PageHelpContent | null {
  const pure = (routePath.split("?")[0] || "/").split("#")[0] || "/";
  const pool = [...listPageHelp(locale)].sort((a, b) => b.routePattern.length - a.routePattern.length);

  for (const p of pool) {
    if (matchPattern(p.routePattern, pure)) return p;
  }

  // 父级降级：循环去掉最后一段直到 "/"
  let current = pure;
  while (current !== "/") {
    const idx = current.lastIndexOf("/");
    current = idx <= 0 ? "/" : current.slice(0, idx) || "/";
    for (const p of pool) {
      if (matchPattern(p.routePattern, current)) return p;
    }
  }
  return null;
}

function matchPattern(pattern: string, path: string): boolean {
  const regex = patternToRegExp(pattern);
  return regex.test(path);
}

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
  const regexStr = escaped.replace(/\\:([A-Za-z_][A-Za-z0-9_]*)/g, "([^/]+)");
  return new RegExp(`^${regexStr}/?$`);
}
