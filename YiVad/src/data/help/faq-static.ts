/**
 * 静态离线 FAQ（HelpOS FAQ Tab 降级用）。
 *
 * 首批 20 条：覆盖 HelpOS 5 Tab / 命令面板 / 快捷键 / RAG 等最高频问题。
 * 若 YiKnowledge /api/v1/faq/search 不可用，展示这些兜底条目。
 */
import type { FAQItem } from "../../components/HelpCenter/types";

function faq(
  id: string,
  q: string,
  answer: string,
  tags: string[],
  relatedRoutes: string[],
  popularity: number,
  updatedAt: string
): FAQItem {
  return { id, question: q, answer, tags, relatedRoutes, popularity, updatedAt };
}

export const STATIC_FAQ: FAQItem[] = [
  faq("faq-yivad-0001", "如何打开命令面板？", "在任意页面按 `Ctrl+K`（Windows/Linux）或 `⌘+K`（macOS）。", ["命令面板", "快捷键"], ["/", "/search"], 98, "2026-10-09"),
  faq("faq-yivad-0002", "如何打开帮助中心？", "按 `?` 键（Shift+/）或点击右上角的 `?` 图标。输入框聚焦时该快捷键被屏蔽。", ["帮助中心", "快捷键"], ["/"], 97, "2026-10-09"),
  faq("faq-yivad-0003", "如何导出 Issue 列表？", "在 Issue 列表页点击「导出」按钮，支持 CSV/XLSX 两种格式。可用 `批量操作→导出` 只导出勾选条目。", ["导出", "Issue"], ["/issues", "/bugs"], 89, "2026-10-09"),
  faq("faq-yivad-0004", "翻译分析仪表盘的 P95 是多少？", "YiVad 翻译模块目标 SLA：P95 ≤ 1s；仪表盘可实时查看近 28 天的 Burn Rate。", ["翻译", "SLA"], ["/project/yivad"], 87, "2026-10-09"),
  faq("faq-yivad-0005", "OCR 功能为什么有时返回空？", "请检查图片是否小于 2KB 或是否为纯文字截图。截图区域被遮挡（例如水印）也会导致 OCR 失败。OCR 目标 SLA：P95 ≤ 2s。", ["OCR"], ["/rag", "/kanban"], 85, "2026-10-09"),
  faq("faq-yivad-0006", "AI 搜索（命令面板）没有结果怎么办？", "1）检查网络连接；2）尝试缩短关键词；3）前缀 `in:kb` 只搜知识库，`in:issues` 只搜 Issue。", ["命令面板", "搜索"], ["/search"], 83, "2026-10-09"),
  faq("faq-yivad-0007", "如何批量归档 Bug？", "Bug 列表页：勾选左侧多选框 → 顶部工具栏「批量操作」→「批量归档」。仅 admin 或 owner 有权限。", ["批量操作", "Bug"], ["/bugs"], 81, "2026-10-09"),
  faq("faq-yivad-0008", "为什么面板有时会出现 CanceledError？", "近期修复：`useProjectDetail` 等入口 guard 分支不再调用 DisposerBag.dispose()，改用 reset()。请确认你正在使用 ≥v1.8.3 构建。", ["DisposerBag", "CanceledError", "修复说明"], ["/project/yivad"], 95, "2026-10-09"),
  faq("faq-yivad-0009", "RAG 为什么 Embedding 没有生效？", "YiAi RAG 默认使用 BM25。Embedding 功能默认关闭（全局 RAG_EMBED_KILL_SWITCH=true），仅在管理员手动触发时启用，以降低资源占用。", ["RAG", "Embedding", "BM25"], ["/rag"], 79, "2026-10-09"),
  faq("faq-yivad-0010", "如何提交 Bug？", "按 `?` → 切换「反馈」Tab → 选择 type=bug，系统会自动携带当前 URL（已脱敏）和浏览器 UA。提交 ≤ 15s。", ["反馈", "Bug"], ["/bugs"], 77, "2026-10-09"),
  faq("faq-yivad-0011", "更新日志在哪里？", "按 `?` 打开帮助中心并切到「更新日志」Tab，或直接在命令面板输入 `> changelog`。", ["Changelog"], ["/"], 75, "2026-10-09"),
  faq("faq-yivad-0012", "如何自定义快捷键？", "命令面板输入 `> open settings` →「快捷键」子页。自定义绑定保存在本地 localStorage，跨设备需手动同步。", ["自定义", "快捷键"], ["/settings"], 74, "2026-10-09"),
  faq("faq-yivad-0013", "为什么不能在输入框中按 `?` 触发帮助？", "设计如此。输入框、文本域、contenteditable 元素聚焦时 `?` 被视为字符输入。可点击右上角图标或命令面板 `> help` 替代。", ["快捷键", "设计决策"], ["/"], 73, "2026-10-09"),
  faq("faq-yivad-0014", "如何切换暗色模式？", "右下角「SwitchDark」开关，或命令面板 `> toggle dark`。帮助中心会自动跟随系统 / 用户主题。", ["主题", "暗色"], ["/settings"], 72, "2026-10-09"),
  faq("faq-yivad-0015", "项目状态看板不显示怎么办？", "请确认当前账号是否加入了项目；未加入项目请联系 admin 加入，或刷新页面让菜单重拉。", ["看板", "权限"], ["/project/yivad"], 70, "2026-10-09"),
  faq("faq-yivad-0016", "RSbuild HMR 很慢怎么办？", "临时方案：在 `rsbuild.config.ts` 中关闭 `tools.tsChecker` 可将 HMR 从 ~1.2s 压缩到 ≤650ms（红线）。正式发布阶段必须重新打开类型检查。", ["HMR", "性能", "Rsbuild"], ["/settings"], 88, "2026-10-09"),
  faq("faq-yivad-0017", "为什么有些帮助文档仅管理员可见？", "帮助中心通过 `roleFilter` 做角色过滤。若你是 guest/member，仅展示可操作域内的章节。", ["权限", "角色"], ["/settings"], 68, "2026-10-09"),
  faq("faq-yivad-0018", "SSE（通知 / Live Metrics）断开怎么恢复？", "YiAi SSE 端口默认 10086。请确认浏览器未被 CSP 拦截，并检查 7777 / 8787 的旧引用已被移除。刷新页面即可恢复。", ["SSE", "YiAi"], ["/dashboard/live"], 86, "2026-10-09"),
  faq("faq-yivad-0019", "如何把 Issue 指派给其他人？", "详情页右侧「Assignee」下拉框。只有项目成员可被选为负责人。批量指派请用列表页「批量操作」。", ["指派", "Issue"], ["/issues"], 66, "2026-10-09"),
  faq("faq-yivad-0020", "遇到「请求超时」怎么办？", "99% 的超时源于 YiAi 服务未启动。请本地启动 `cd YiAi && uv run main` 监听 10086，并检查 dev proxy `RSBUILD_ENV_API_URL` 配置。", ["超时", "YiAi"], ["/dashboard/live"], 99, "2026-10-09")
];
