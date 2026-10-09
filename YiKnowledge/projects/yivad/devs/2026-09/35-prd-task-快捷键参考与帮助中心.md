---
prd_task_id: "YV-09-70"
title: "YV-09-70: 快捷键参考与帮助中心 HelpOS — 开发方案（v2.0 同步 PRD 升级）"
status: 进行中
priority: P2
owner: 陈铭
created: 2026-09-11
updated: 2026-10-09
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.2
estimate_backend: 0.05
source_prd: "35-prd-快捷键参考与帮助中心.md"
source_prd_version: "v2.0 (专业化重写 2026-10-09)"
type: task
category: projects/yivad/devs
source: YiVad
tags:
  - yivad
  - dev
  - 快捷键参考与帮助中心
  - help-os
  - accessibility
roles:
  - engineer
  - sre
  - sec
benefit: "将 PRD YV-09-70 v2.0 的 HelpOS 10 条功能需求（FR-01 ~ FR-10）与 23 条 AC 逐条落地，严格对齐 5 Tab Shell、DisposerBag.reset 红线、AbortSignal 全链路传播、STRIDE-CAP 白名单与 SLO 指标埋点。"
lifecycle: active
review_status: 待评审
okrs_trace:
  - yivad-003/KR2
  - yivad-003/KR4
related_sre:
  - SLO-1 ~ SLO-7
  - Burn Rate 发布门禁
related_sec:
  - STRIDE 6 威胁
  - CAP-01 ~ CAP-08 能力白名单
---

# YV-09-70: 快捷键参考与帮助中心 HelpOS — 开发方案（v2.0 同步 PRD 升级）

> 需求编号：**YV-09-70** · 上游 PRD v2.0：[35-prd-快捷键参考与帮助中心.md](../../prds/2026-09/35-prd-快捷键参考与帮助中心.md)
> 前端人天：0.2d · 后端人天：0.05d · 文档职责：**HOW**（怎么做 / 为什么这么做 / 如何不犯结构性错误）
> 对应测试：[035-prd-test-快捷键参考与帮助中心.md](../../tests/2026-09/035-prd-test-快捷键参考与帮助中心.md)（VERIFY）

---

## 目录

- [§0 对齐 PRD v2.0 的 Gold Copy（绝不动摇的硬闸）](#sec-0)
- [§1 方案总览与 4 层架构落地](#sec-1)
- [§2 M1-M7 分阶段实现锚点与验收](#sec-2)
- [§3 类型契约落地（对齐 PRD §6.1）](#sec-3)
- [§4 组件与 Composable 目录结构](#sec-4)
- [§5 跨项目契约接口实现（C-001-H-1 ~ H-4）](#sec-5)
- [§6 安全红线落地（STRIDE 6 威胁 × CAP 白名单）](#sec-6)
- [§7 性能与可观测（SLO/SLI/Burn Rate 指标）](#sec-7)
- [§8 5 级回滚（L1-L5）与 DisposerBag 使用守则](#sec-8)
- [§9 源码索引（文件清单 × 产出 × CI 步骤）](#sec-9)
- [§10 代码审查 Gate（23 AC 逐项 trace）](#sec-10)

---

<a id="sec-0"></a>
## §0 对齐 PRD v2.0 的 Gold Copy（绝不动摇的硬闸）

> **任何实现偏差必须先回到 PRD 通过修改 PRD 再落地；禁止"代码先上再说"。**

| # | Gold Copy 条目 | 来源章节 | 失败后果 |
|---|----------------|----------|----------|
| GC-1 | 类型契约一字不差对齐 PRD §6.1（注释除外） | PRD §6.1 | 类型漂移 → FR/NFR/AC 三重失配 → FAIL CI |
| GC-2 | 路由匹配算法必须严格按 PRD §6.2 最长前缀 + :param 通配 | PRD §6.2 | 上下文命中率不达标（SLO 红线） |
| GC-3 | 所有异步请求必须 `{timeout, signal}` + `AbortSignal.any([...])` 联合 | 项目 Hard Constraints | CanceledError 级联 / 超时未回收资源 |
| GC-4 | 面板 open/close 使用 `DisposerBag.reset()`；禁止 `.dispose()`（除非 L5 关停） | PRD §12.2 + 项目 Hard Constraints | 容器已销毁 → AbortController 级联触发（P0 事故） |
| GC-5 | 快捷键数据源仅 ShortcutRegistry.snapshot()，禁止第二份静态副本 | PRD D-03 | 快捷键失配 → SLI-6 不达标 → 构建 FAIL |
| GC-6 | URL 脱敏 Query 白名单仅 `route,page,lang`；`fragment` 删除；`token/password/key/secret` 正则打码 | PRD §7.4.2 | STRIDE Information Disclosure 高危 |
| GC-7 | Markdown 渲染必须 DOMPurify + 白名单标签集（§7.4.1） | PRD §7.4.1 | XSS 0day → L5 关停 |
| GC-8 | 包管理器：**yarn**（与项目 Hard Constraints 一致），严禁提交 pnpm-lock.yaml | 项目 memory Hard Constraints | 跨项目锁文件冲突 |

---

<a id="sec-1"></a>
## §1 方案总览与 4 层架构落地

### 1.1 与 PRD §3 对齐的 4 层架构

```
Entry Layer (L1) ─────────────────► Shell Layer (L2) ─────────────────► Content Layer (L3) ──────► Context Layer (L4)
  ? 键 (ShortcutRegistry.global)     HelpCenterPanel (单例 Teleport)     PageHelpContent SDK          RouteContext
  导航栏图标 MainLayout               Tab-1..5 动态懒加载                ShortcutRegistry.snapshot()  PageHelpMatcher (§6.2)
  Cmd-Panel aliases (> help etc.)    统一搜索框（复用命令面板内核）      YiKnowledge FAQ API (200ms)   DisposerBag.reset() 复用
  页面帮助气泡                        无障碍根节点 ARIA                 CHANGELOG + Conventional     FeatureFlag KillSwitch
                                      命令式 useHelp().open()           YiAi 反馈通道 (15s)         24h last-tab 偏好
```

### 1.2 关键技术决策（与 PRD §8 D-01 ~ D-10 一一对齐）

| 决策 | 具体 HOW |
|------|----------|
| D-01 三入口 | 1) `?/Shift+/` 走 YV-09-43 `useKeyboardShortcuts(scope=global, enabled=!isInputFocused)`；2) `MainLayout.vue` 右顶加 `?` ElButton；3) `help-aliases.ts` 注册 5 个 CommandProvider 到 YV-09-68。 |
| D-02 混合内容 | PageHelp / Shortcuts / Changelog 走 `import.meta.glob('./data/**/*.ts', { eager: true })`；FAQ 走 axios（timeout=200, signal）加熔断。 |
| D-03 动态快照 | Tab-2 打开时 `const snap = shortcutRegistry.snapshot()`；用 `watchEffect` 在 panel open 时强制 refresh 一次。 |
| D-04 Commits 分类 | `scripts/check-help-changelog.mjs` 使用 Conventional Commits parser → 产出 JSON；CI 对比 CHANGELOG vs commits。 |
| D-05 双通道反馈 | 主通道 `POST yiAiBaseUrl/api/help/feedback`；备通道 GitHub Issue 预填模板（动态构造 query）。 |
| D-06 复用搜索内核 | 从 `src/composables/useCommandPalette.ts` 导出 `fuzzySearchCommands<T>()` 并泛型化；禁止引入 fuse.js。 |
| D-07 单例 + reset | `<Teleport to="body">` + `app.provide('helpOS', useHelp())`；关闭时 `bag.reset()`，**绝不 bag.dispose()**。 |
| D-08 默认 Tab 策略 | 计算逻辑：`usePreferredTab()` = hasPageHelp → 'page-help'；否则 24h localStorage.lastTab 存在 → 它；否则 'shortcuts'。 |
| D-09 前端截图 | html2canvas 视口裁剪 + `[data-secret-mask]` 加黑盖 + 6 类关键字正则打码。 |
| D-10 ETag 缓存 | FAQ 请求 `If-None-Match` 头；304 → 复用 `localStorage.help.faqCache.<etag>`。 |

---

<a id="sec-2"></a>
## §2 M1-M7 分阶段实现锚点与验收

> 对应 PRD §16 七阶段。每个阶段必须产出对应锚点，且对应 PRD §13 AC 的对应子集已通过（本地可运行）。

| MS | 交付锚点（必须存在的可验证代码） | 对应 AC |
|----|----------------------------------|---------|
| M1 | `src/components/help-center/types.ts`（99% 对齐 PRD §6.1）；`useHelp()` 骨架通过 type-check | 结构型 AC |
| M2 | `help-center-panel.vue` + 3 入口触发 + axe-core 0 violation | AC-01、01.1、01.2、01.3 |
| M3 | `page-help-tab.vue` + `usePageHelp()` 匹配算法 10 条路由测试全绿；`shortcuts-tab.vue` = snapshot() 驱动 | AC-02、03、02.1、02.2、03.1、03.2 |
| M4 | `faq-tab.vue` 200ms 熔断 fake-timer 单测；`changelog-tab.vue` 30+ 版本虚拟滚动 DOM ≤ 20 条 | AC-04、04.1、05.1、05.2 |
| M5 | `feedback-tab.vue` 12 条脱敏 + 429 限流单测；GitHub 预填模板生成正确；双通道埋点 | AC-05、06.1、06.2 |
| M6 | `useHelpSearch()` + `help-aliases.ts` 5 aliases；每次新 query → `signal.aborted === true` 旧请求 | AC-06、07.1、10.1 |
| M7 | `help.telemetry.ts` SLI 全埋点 + FeatureFlag `help.center.enabled`；SRE 面板配置 JSON | SLO 观测性 |

---

<a id="sec-3"></a>
## §3 类型契约落地（对齐 PRD §6.1）

```
要求：
  1. 新建/编辑 src/components/help-center/types.ts，内容与 PRD §6.1 Gold Copy 逐行对齐。
  2. CI 新增 step：diff <(sed '/^ *\/\//d; /^$/d' PRD-6.1.ts) <(sed '/^ *\/\//d; /^$/d' types.ts) 必须为空。
  3. 任何字段变更 → PR 必须同时改 PRD §6.1 并 bump HelpOS SDK 主版本号。
```

---

<a id="sec-4"></a>
## §4 组件与 Composable 目录结构

```
YiVad/src/
├── components/
│   └── help-center/
│       ├── types.ts                       (M1: Gold Copy)
│       ├── help-center-panel.vue          (M2: 单例 Shell 5 Tab)
│       ├── tabs/
│       │   ├── page-help-tab.vue          (M3: 上下文 + Markdown 安全渲染)
│       │   ├── shortcuts-tab.vue          (M3: 分组 + 平台 Kbd + 可执行)
│       │   ├── faq-tab.vue                (M4: 200ms 熔断 + 静态降级)
│       │   ├── changelog-tab.vue          (M4: Conventional 分类 + 虚拟滚动)
│       │   └── feedback-tab.vue           (M5: 表单 + 双通道 + 截图打码)
│       └── shared/
│           ├── search-box.vue             (M6: 复用命令面板内核)
│           ├── safe-markdown.vue          (§7.4.1 白名单渲染)
│           ├── safe-link.vue              (rel="noopener noreferrer" + 二次确认外链)
│           └── kbd-key.vue                (macOS ⌘⌥⇧^ / Win Ctrl Alt Shift)
├── composables/
│   ├── useHelp.ts                         (M1: 全局单例 provide/inject)
│   ├── usePageHelp.ts                     (M3: §6.2 匹配算法)
│   └── useHelpSearch.ts                   (M6: query → abort + cache + scope filter)
├── data/
│   └── help/
│       ├── page-help-content.ts           (M3: 首批 12 条核心路由)
│       ├── faq-static.ts                  (M4: 20 条核心离线 FAQ)
│       └── changelog-generated.json       (CI check-help-changelog 产出)
├── bootstrap/
│   └── help-aliases.ts                    (M6: 5 aliases 注册到 YV-09-68)
├── utils/
│   ├── url-sanitize.ts                    (§7.4.2 Query 白名单 + 正则打码)
│   ├── screenshot-mask.ts                 (D-09 关键字打码 + data-secret-mask 遮盖)
│   └── help.telemetry.ts                  (M7: 埋点封装)
└── scripts/ci/
    ├── check-help-changelog.mjs           (CG-1 门禁)
    └── check-shortcut-consistency.mjs     (SLI-6 门禁)
```

---

<a id="sec-5"></a>
## §5 跨项目契约接口实现（C-001-H-1 ~ H-4）

| 契约 | 封装位置 | 硬参数 | 失败降级 |
|------|----------|--------|----------|
| C-001-H-1 FAQ (YiKnowledge) | `services/help/faqService.ts` | timeout=200；`AbortSignal.any([用户 signal, 内部去重 controller.signal])` | `faq-static.ts` 20 条 |
| C-001-H-2 Feedback (YiAi) | `services/help/feedbackService.ts` | timeout=15000；`signal`；`x-request-id: crypto.randomUUID()` | GitHub Issue 预填模板链接 + 本地草稿 |
| C-001-H-3 Screenshot Upload | 同上子路由 | timeout=20000；1 req/min 限流；payload ≤ 2.5MB | 回退为仅文本 |
| C-001-H-4 ShortcutRegistry | 进程内 composable | N/A（纯内存） | `src/shortcuts/defaults.ts` 默认 8 条快照 |

> 所有 axios 实例 `defaults.signal` 绝不能被拦截器直接覆盖；拦截器内部必须 `AbortSignal.any([config.signal ?? null, internal.signal])`。

---

<a id="sec-6"></a>
## §6 安全红线落地（STRIDE 6 威胁 × CAP 白名单）

| STRIDE | 对应代码实现 | CAP-编号 |
|--------|-------------|----------|
| Spoofing | `SafeLink` → 外链白名单域名 + 二次确认 Modal | CAP-01（仅读路由） |
| Tampering | 静态内容打包时附加 SHA-256 hash，SDK 启动时校验 | CAP-05（仅 CHANGELOG 只读） |
| Repudiation | 反馈提交返回 `{ticketId, hmac}`，前端存 `localStorage.yivad-help-receipts`（30d TTL） | CAP-07 |
| Info Disclosure | `url-sanitize.ts` 白名单 + 6 正则打码；`screenshot-mask.ts` DOM 遮盖 | CAP-02（禁读 Cookie） |
| DoS | 前端 3/min 限流；服务端 token bucket 30 req/min/IP；WAF `/api/help/feedback` 100/min 封禁 | CAP-07 |
| Elevation | `SafeMarkdown` DOMPurify 白名单；CSP `script-src 'self'` 全局保持 | CAP-05/07 |

**代码审查必须通过的 ESLint 规则**：
- `no-restricted-properties`：禁止 `DisposerBag.prototype.dispose`（除 `L5-shutdown.ts` 白名单外）。
- `vue/no-v-html`：除 `safe-markdown.vue` 单例外全局 error。
- `import/no-restricted-paths`：`services/**` 仅允许被 `composables/**` 引用，禁止组件内直接 import service（对齐项目 Hard Constraints：外部工具统一通过 ToolRegistry/Composable 调用）。

---

<a id="sec-7"></a>
## §7 性能与可观测（SLO/SLI/Burn Rate 指标）

### 7.1 SLI 埋点清单（逐条对齐 PRD §10.2）

| SLI | 埋点名 | 类型 | 触发点 |
|-----|--------|------|--------|
| SLI-1 | `help.open_attempt{source}`, `help.open_success{source}` | Counter | panel open 入口 / shell mounted |
| SLI-2 | `help.panel_lcp_ms` | Histogram | PerformanceObserver |
| SLI-3 | `help.search.query{scoped}`, `help.search.result_count` | Counter+Histogram | useHelpSearch.onResult |
| SLI-4 | `help.feedback.submit{status,channel}` | Counter | feedbackService submit 终态 |
| SLI-5 | `help.feedback.first_response_seconds` (由后端 YiAi 推送回来后更新) | Histogram | ticket card 渲染 |
| SLI-6 | `help.shortcut.diff_count` (0 达标; >0 FAIL) | Gauge | CI check-shortcut-consistency.mjs 埋点 |
| SLI-7 | `help.security_high_risk_count` | Gauge | ESLint + Trivy 扫描聚合 |

### 7.2 Burn Rate 告警配置（Grafana 面板）

- Rule-1（Page）：1h BR ≥ 14.4 OR 6h BR ≥ 6 → L1 Kill Switch + P0 工单通知企微 IM（对齐 SRE 规范）。
- Rule-2（Ticket）：6h BR ≥ 3 AND 1d ≥ 2 AND 3d ≥ 1 → 冻结该域后续 PR。

### 7.3 性能基准（本地必跑）

```bash
# 提交前必跑
yarn benchmark packages:help-search     # 500 条 × 10 次 p95 ≤ 10ms
yarn build:analyze                      # help chunk gzip ≤ 28KB
```

---

<a id="sec-8"></a>
## §8 5 级回滚（L1-L5）与 DisposerBag 使用守则

> 对应 PRD §12.2 L1-L5。此处提供「操作手册级」触发路径。

| 级别 | 代码级触发路径 | 代码变更锚点 |
|------|---------------|-------------|
| L1 Kill Switch | `featureflags/help.center.enabled = false` 热下发；`useHelp()` 初始化时短路：仅渲染导航栏图标（不可点击），不注册 alias | `composables/useHelp.ts` 顶部 `if (!ff.enabled) return stubHelpOS` |
| L2 Tab 级降级 | FAQ Tab 远端请求 Burn Rate 触发 → 隐藏 Tab-3；显示静态 FAQ Banner | `tabs/faq-tab.vue` v-if + 埋点 |
| L3 反馈降级 | feedbackService 5xx > 10% 窗口 2 分钟 → 隐藏表单；展示 GitHub Issue CTA 卡片 | `tabs/feedback-tab.vue` 切换 DegradedUI |
| L4 内核降级 | ShortcutRegistry snapshot throw 或 DisposerBag 连续出现 CanceledError 3 次 → Tab-2 展示默认 8 条 | `shortcuts-tab.vue` fallbackDefaultSnapshot() |
| L5 关停 | `main.ts` 移除 `app.use(HelpOS)`；CI 构建不含 chunk-help；**允许 `dispose()` 在 `shutdown.ts` 中执行**（ESLint 白名单标注） | `main.ts` + `bootstrap/shutdown.ts` |

**DisposerBag 使用守则（违反即 CI FAIL）**：
1. 面板 `onUnmounted`、`onDeactivated`、`close()` 三处全部调用 `bag.reset()`；
2. L5 关停 `shutdown.ts` 中唯一允许 `bag.dispose()`；
3. 禁止在「入口 guard 分支」（如 useProjectDetail / 路由钩子）使用 dispose。

---

<a id="sec-9"></a>
## §9 源码索引（文件清单 × 产出 × CI 步骤）

| 产出 | 对应实现 | 验证/CI |
|------|----------|---------|
| HelpOS SDK 类型契约 | `src/components/help-center/types.ts` | Gold Copy diff |
| 帮助面板 Shell 与 5 Tab | `help-center-panel.vue` 与 `tabs/*` | e2e / axe-core |
| 上下文匹配算法 | `usePageHelp.ts` | Vitest 单测 10 路由 100% |
| 快捷键快照展示 | `shortcuts-tab.vue` + `defaults.ts` fallback | SLI-6 |
| FAQ 与 Changelog Tab | `faq-tab.vue` / `changelog-tab.vue` | fake-timer + 虚拟滚动 |
| 反馈闭环 | `feedback-tab.vue` + `feedbackService.ts` | 429 + 脱敏 12/12 |
| 搜索与 aliases | `useHelpSearch.ts` + `help-aliases.ts` | abort + 触发 |
| 安全工具 | `safe-markdown.vue`, `url-sanitize.ts`, `screenshot-mask.ts` | XSS / 泄漏用例集 |
| 可观测性 | `help.telemetry.ts` | 本地点火 1 次成功 |
| CI 门禁脚本 | `scripts/ci/check-help-changelog.mjs`, `check-shortcut-consistency.mjs` | GitHub Actions 执行 PASS |

---

<a id="sec-10"></a>
## §10 代码审查 Gate（23 AC 逐项 trace）

> PR 必须附 23 条 AC 的本地通过截图。任何不达标项必须有书面豁免（由 Eng Lead + PM 双签）。

| AC | 对应实现锚点 | 验证类型 |
|----|-------------|---------|
| 6 条主线（§13.1 AC-01 ~ AC-06） | e2e 录屏 | Playwright / 手动 + 录屏 |
| 17 条功能（§13.2） | 对应 Tab / Composable 单测 | Vitest + axe-core + fake-timer |
| 3 条可证伪基线（§13.3） | SLI-6 / SLI-7 / 主线通过率 | CI + 发布门禁 |

> **Review Checklist（提交前自审）**：
> - [ ] 所有异步 `{timeout, signal}` 透传且使用 `AbortSignal.any` 联合
> - [ ] 无 `DisposerBag.dispose()`（除 L5 白名单外）
> - [ ] 快捷键数据源唯一 = ShortcutRegistry.snapshot()
> - [ ] URL 脱敏 12/12 单测通过
> - [ ] Markdown 渲染唯一出口 = `safe-markdown.vue`
> - [ ] 包管理器 `yarn`，仓库无新增 `pnpm-lock.yaml`
> - [ ] Bundle 增量 ≤ 28KB gzip（附 analyze 截图）
> - [ ] 23/23 AC 本地通过（附 PR 评论表）

---

*本开发方案随上游 PRD v2.0 同步升级（2026-10-09）。任何对 Gold Copy 的改动必须走 PRD 修改流程，禁止实现与 PRD 脱节。*
