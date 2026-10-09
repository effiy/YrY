---
title: "YV-09-70: 快捷键参考与帮助中心 HelpOS — 上下文感知帮助面板、可搜索文档、快捷键速查、更新日志、反馈闭环 — 测试规格 v2.0"
status: 进行中
priority: 高
owner: 陈铭
roles: [engineer, qa, sre]
created: 2026-09-11
updated: 2026-10-09
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-70"
source_prds: ["35-prd-快捷键参考与帮助中心"]
source_modules: ["35-prd-task-快捷键参考与帮助中心"]
trace_matrix: "OKR (yivad-003/KR2, KR4) → PRD YV-09-70 → Dev → Test（本文件）"
type: test
category: projects/yivad/tests
source: YiVad
tags:
  - yivad
  - test
  - 快捷键参考与帮助中心
  - help-os
  - accessibility
  - security
benefit: "可追溯到 PRD v2.0 §5 FR-01 ~ FR-10 / §7 NFR / §13 23 AC 的完整验证规格；覆盖单元/组件/集成/E2E 四层与 STRIDE 安全回归、SLO Burn Rate 演练。"
lifecycle: active
review_status: 待评审
---
# YV-09-70: 快捷键参考与帮助中心 HelpOS — 测试规格 v2.0

> 来源 PRD：[35-prd-快捷键参考与帮助中心.md](../../prds/2026-09/35-prd-快捷键参考与帮助中心.md)（v2.0 专业化重写）
> 来源 Dev：[35-prd-task-快捷键参考与帮助中心.md](../../devs/2026-09/35-prd-task-快捷键参考与帮助中心.md)（v2.0 同步升级）
>
> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` / `AC-xxx` 编号追溯，不复制需求正文。
> 提取基础版本：2026-09-11；专业化升级版本：2026-10-09。

---

## 目录

- [§0 测试方法论与准入准出（5 步验证法）](#sec-0)
- [§1 测试策略分层（L1~L4）](#sec-1)
- [§2 前置条件与环境](#sec-2)
- [§3 需求覆盖矩阵（PRD §5 FR-01 ~ FR-10）](#sec-3)
- [§4 NFR 覆盖矩阵（PRD §7 性能/安全/A11y/I18n）](#sec-4)
- [§5 AC 逐条验证（6 主线 + 17 功能 + 3 基线）](#sec-5)
- [§6 STRIDE 安全回归用例（6 威胁 × 6 POC）](#sec-6)
- [§7 SLO / Burn Rate 演练用例（L1-L5 回滚验证）](#sec-7)
- [§8 预置回归位验证（PRD §15 P1 ~ P6）](#sec-8)
- [§9 性能基准用例（p95 / INP / LCP / Bundle）](#sec-9)
- [§10 缺陷分级与 SLA 映射](#sec-10)
- [§11 测试报告模板与 CI 门禁](#sec-11)
- [§12 交付物与签字页](#sec-12)

---

<a id="sec-0"></a>
## §0 测试方法论与准入准出（5 步验证法）

对齐 YrY 全局 5 步验证法：

| 步骤 | 名称 | 在本项目中的动作 | 通过标准 |
|------|------|-----------------|----------|
| V-1 | PRD 对齐评审 | §3 FR §4 NFR 全部 trace 到对应用例；编号一一映射（100% 覆盖） | 覆盖率表中 FR/NFR/AC 覆盖均 ≥ 100% |
| V-2 | 实现锚点 Trace | 每条用例标注对应实现文件（Dev §4 目录结构）；grep 命中 | `scripts/ci/check-trace-mapping.mjs` PASS |
| V-3 | L1/L2 单测与组件测试 | Vitest 执行，行覆盖率 ≥ 85%，分支覆盖率 ≥ 75% | coverage badge 达标；高危分支 100% |
| V-4 | L3 集成 + L4 E2E | §5 6 条主线 100% 通过；§6 STRIDE 安全回归 6/6 通过 | Playwright / 录屏归档 |
| V-5 | KR 数据验收 | 上线 28d 后，yivad-003/KR2、KR4、帮助无结果率三项达标或偏差 ≤ 10% | 月度数据复盘报告 |

### 准入与准出标准

| # | 阶段 | 条件 | 阈值 |
|---|------|------|------|
| 1 | **准入**（进入测试） | PRD/Dev/Test 三份文档 v2.0 均已通过评审；`vue-tsc --noEmit` 0 错误；L1/L2 覆盖率预估值 ≥ 80% | — |
| 2 | **准出 1**（合入主干） | P0 用例 100%，P1 ≥ 95%，P2 ≥ 85%；STRIDE 6/6 通过；无 Blocker/Critical 遗留 | — |
| 3 | **准出 2**（灰度 10%） | LCP p95 ≤ 2.0s；帮助搜索成功率 ≥ 80%；CanceledError 工单 0 起 | 1 天观察窗口 |
| 4 | **准出 3**（全量） | L1/L2/L3/L4 全用例通过回归复跑；Burn Rate 告警 0；SLO-1 可用性 ≥ 99.9% | 28d 滚动窗口 |

---

<a id="sec-1"></a>
## §1 测试策略分层（L1~L4）

| 层级 | 说明 | 框架/工具 | 自动化 | 执行时机 | 负责人 |
|------|------|-----------|--------|----------|--------|
| **L1 单元** | 纯函数/工具（URL 脱敏、路由匹配、fuzzy 搜索、分类器） | Vitest | ✅ 100% | 每次提交 | 开发自测 |
| **L2 组件** | HelpCenterPanel、5 Tab、SafeMarkdown、KbdKey 等 Vue SFC | Vitest + @vue/test-utils + axe-core | ✅ 90%+ | 每次提交 | QA + 开发 |
| **L3 集成** | useHelp/usePageHelp/useHelpSearch + Store + Mock RPC 交互 | Vitest + msw（mock FAQ/Feedback API） | ✅ 85%+ | 每次提交 | QA |
| **L4 端到端** | 完整用户路径（需 YiAi 运行 + FeatureFlag） | Playwright + Chrome headless / 手动 + 录屏 | 混合 60% 自动化 + 40% 关键场景录像 | 提测/回归/灰度前 | QA + SRE（L1-L5 演练） |

---

<a id="sec-2"></a>
## §2 前置条件与环境

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | **yarn**（严格对齐 YiVad/Yiad 项目红线；禁止 pnpm） |
| 浏览器 | Chrome / Edge / Safari / Firefox 各最新 2 版 |
| 框架 | Vitest + jsdom · Playwright · axe-core · msw |
| 类型检查 | `yarn exec vue-tsc --noEmit` |
| 分析工具 | `yarn build:analyze` |

```bash
# L1/L2/L3 全量
yarn test

# 仅 HelpOS 域
yarn exec vitest run tests/help-center/ tests/composables/useHelp* tests/utils/url-sanitize.test.ts

# L4 端到端
yarn exec playwright test tests/e2e/help-center.spec.ts --project=chrome

# 覆盖率报告
yarn exec vitest run --coverage --reporter=html

# 安全扫描（STRIDE）
yarn exec eslint --plugin security src/components/help-center src/composables/useHelp*
```

---

<a id="sec-3"></a>
## §3 需求覆盖矩阵（PRD §5 FR-01 ~ FR-10）

> 每条 FR 必须至少 1 条用例，且标注 `L?` 执行层级。覆盖率 ≥ 100%（多条用例覆盖同 FR 以提高置信度）。

| FR 编号 | 需求概要 | 用例 ID | 层级 | 状态 | 核心断言 |
|---------|----------|---------|------|------|----------|
| FR-01 | 帮助中心面板 Shell 与 3 入口 | TC-FR01-01 ~ TC-FR01-08 | L2/L4 | 待执行 | 见 §5 主线 AC-01、功能 AC-01.x |
| FR-02 | 上下文页面帮助 Tab（路由匹配 + role 过滤） | TC-FR02-01 ~ TC-FR02-08 | L1/L2/L4 | 待执行 | 10 路由命中率 100%；role filter 快照通过；空态 CTA seed 正确 |
| FR-03 | 快捷键速查 Tab（动态快照 + 分组 + Kbd 本地化） | TC-FR03-01 ~ TC-FR03-10 | L1/L2/L3 | 待执行 | SLI-6 diff=0；macOS 显示 ⌘；点击条目 handler 调用；作用域优先级正确 |
| FR-04 | 可搜索 FAQ Tab（静态 20 条 + 远端熔断） | TC-FR04-01 ~ TC-FR04-06 | L2/L3 | 待执行 | 200ms fake-timer 触发降级；无结果同义词扩展最多 1 次；外链 SafeLink 二次确认 |
| FR-05 | Changelog Tab（Conventional 分类 + 虚拟滚动 + security 红边） | TC-FR05-01 ~ TC-FR05-05 | L1/L2 | 待执行 | 30+ 版本 DOM ≤ 20；Unreleased 卡片正确；security 边框样式快照 |
| FR-06 | 反馈提交 Tab（URL 脱敏 + 双通道 + 429 限流 + 截图打码） | TC-FR06-01 ~ TC-FR06-12 | L1/L2/L3/L4 | 待执行 | §6 STRIDE-I 12 种敏感参数全 ***；1min 第 4 次返回 429；双通道埋点正确 |
| FR-07 | 统一搜索（4 域搜索 + @scope 限定 + 旧请求 abort） | TC-FR07-01 ~ TC-FR07-05 | L1/L3 | 待执行 | p95 ≤ 10ms；`signal.aborted === true`；@faq 仅命中 FAQ 域 |
| FR-08 | HelpOS SDK (useHelp / usePageHelp / useHelpSearch) | TC-FR08-01 ~ TC-FR08-06 | L2/L3 | 待执行 | 全局单例；SSR 安全返回 null；DisposerBag.reset() 非 dispose |
| FR-09 | 命令面板 Aliases (>/help shortcuts changelog feedback report bug) | TC-FR09-01 ~ TC-FR09-05 | L3/L4 | 待执行 | 5 aliases 打开正确 Tab；`report bug 崩溃` 预填 type+title；参数 60 字符截断 |
| FR-10 | 跨项目契约（FAQ/Feedback 接口 + 一致性脚本） | TC-FR10-01 ~ TC-FR10-05 | L3 | 待执行 | FAQ ETag 缓存命中；Feedback 幂等键 `x-request-id` 重放 409；月度一致性 0 差异 |

---

<a id="sec-4"></a>
## §4 NFR 覆盖矩阵（PRD §7 性能/安全/A11y/I18n）

| NFR 编号 | 要求 | 用例 ID | 层级 | 核心断言 |
|----------|------|---------|------|----------|
| NFR-7.1 LCP ≤ 1.8s（p95） | 性能 | TC-NFR-01 | L4 (Lighthouse) | 10 次均值 p95 ≤ 1.8s |
| NFR-7.2 INP ≤ 120ms | 性能 | TC-NFR-02 | L4 (web-vitals) | Tab 切换 p95 ≤ 120ms |
| NFR-7.3 本地搜索 p95 ≤ 10ms | 性能 | TC-NFR-03 | L1 (benchmark) | 500 条目 × 10 次；p95 ≤ 10ms |
| NFR-7.4 FAQ 远端 p95 ≤ 200ms | 性能 | TC-NFR-04 | L3 (msw 注入延迟) | 201ms 触发降级 |
| NFR-7.5 反馈提交 ≤ 500ms | 性能 | TC-NFR-05 | L3 (msw + 节流阀) | 平均值 ≤ 400ms；P95 ≤ 500ms |
| NFR-7.6 Bundle 增量 ≤ 28KB gzip | 性能 | TC-NFR-06 | L2 (analyze) | 构建报告 help chunk ≤ 28KB |
| NFR-7.4.1 Markdown 白名单 | 安全 | TC-STRIDE-E-01~03 | L1 | XSS 20 payload 全拦截 |
| NFR-7.4.2 URL 脱敏 | 安全 | TC-STRIDE-I-01~12 | L1 | 12 参数全 `***` |
| NFR-7.4.3 截图大小上限 2MB | 安全 | TC-STRIDE-I-13 | L2 | 2.1MB → 被拒 |
| NFR-7.4.4 反滥用 3/min | 安全 | TC-STRIDE-D-01 | L3 | 第 4 次 429 |
| NFR-7.6 A11y AA | 无障碍 | TC-A11Y-01~06 | L2 (axe-core) | 严重违规 = 0；对比度 ≥ 4.5:1 |
| NFR-7.7 I18n | 国际化 | TC-I18N-01~03 | L2 (snapshot) | zh-CN / en-US 双文案都存在；kbd macOS vs Win 本地化通过 |

---

<a id="sec-5"></a>
## §5 AC 逐条验证（6 主线 + 17 功能 + 3 基线）

### 5.1 6 条主线 AC（L4 必跑，阻塞发布）

| TC ID | 对应 AC | GIVEN | WHEN | THEN |
|-------|---------|-------|------|------|
| TC-MAIN-01 | AC-01 | 用户在任意页面，未聚焦输入框 | 按 `?` 键 | 面板 ≤ 50ms 打开；默认 Tab=页面帮助（若存在）或 快捷键 |
| TC-MAIN-02 | AC-02 | 面板已打开；搜索框已聚焦 | 输入 `save` 并回车 | 快捷键列表中 `edit.save` 被高亮；handler 调用 1 次 |
| TC-MAIN-03 | AC-03 | 用户在 `/bugs` 列表页（已注册 page-help） | 打开面板 | 页面帮助 Tab 展示 Bug 列表 sections；relatedShortcuts 包含批量操作快捷键 |
| TC-MAIN-04 | AC-04 | 面板已打开；CHANGELOG 含 Unreleased 与 security 条目 | 切换到「更新日志」Tab | Unreleased 卡片显示；security 条目带红边 + 🛡 |
| TC-MAIN-05 | AC-05 | 用户在反馈 Tab 填完表单（type=bug + title + desc ≥20 字） | 点击「提交」 | 主通道：500ms 内返回工单卡片；模拟 5xx：自动展示 GitHub Issue 预填模板链接可打开 |
| TC-MAIN-06 | AC-06 | 命令面板已打开（Ctrl+K / Cmd+K） | 输入 `> report bug 翻译仪表盘导出崩溃` 并回车 | HelpOS 打开；Tab=反馈；type=bug 选中；title 预填「翻译仪表盘导出崩溃」（截断策略生效） |

### 5.2 17 条功能 AC（L1~L3，对应 PRD §13.2）

| TC ID | 对应 AC | 关键断言 | 层级 |
|-------|---------|----------|------|
| TC-F-01.1 | AC-01.1 | 聚焦 input/textarea 时按 `?` 面板仍关闭（或保持关闭） | L2 |
| TC-F-01.2 | AC-01.2 | Esc / overlay 点击 / × 按钮三种方式都能关闭并焦点回归 | L2 |
| TC-F-01.3 | AC-01.3 | `role=dialog aria-modal=true`；axe 扫描 0 严重；对比度截图通过 | L2 |
| TC-F-02.1 | AC-02.1 | 路径 `/project/yivad/issues/YVAD-123` → 命中 `:param` 模式 | L1 |
| TC-F-02.2 | AC-02.2 | admin 可见 sections 对 guest 隐藏（快照两份：admin/guest） | L2 |
| TC-F-02.3 | AC-02.3 | 空态 CTA 自动携带当前路由名作为搜索 seed | L2 |
| TC-F-03.1 | AC-03.1 | 快捷键表.length === ShortcutRegistry.snapshot().length；CI check-shortcut-consistency 0 diff | L3 |
| TC-F-03.2 | AC-03.2 | macOS 平台：`⌘ ⌥ ⇧ ^` 正确显示；Win：Ctrl/Alt/Shift；快照通过 | L2 |
| TC-F-03.3 | AC-03.3 | 点击 handler 调用；scope 不合法仅展示不执行 | L3 |
| TC-F-04.1 | AC-04.1 | FAQ 请求注入 201ms 延迟 → 降级到 20 条静态 FAQ | L3 (fake timer) |
| TC-F-04.2 | AC-04.2 | 无结果同义词扩展最多 1 次（mock 断言调用次数 = 1） | L3 |
| TC-F-05.1 | AC-05.1 | 35 条版本 → 实际渲染 DOM 条目 ≤ 20；滚动不卡顿 | L2 |
| TC-F-05.2 | AC-05.2 | security 条目强制红边样式快照 | L2 |
| TC-F-06.1 | AC-06.1 | `/?token=abc&password=yy&route=x` → sanitize 后 `token=***&password=***&route=x` | L1（12 条数据驱动） |
| TC-F-06.2 | AC-06.2 | 61s 内 4 次提交 → 第 4 次显示 429 限流提示 | L3 (fake timer) |
| TC-F-07.1 | AC-07.1 | 连续 2 次 query（间隔 30ms） → 第 1 次 promise.signal.aborted === true | L3 |
| TC-F-10.1 | AC-10.1 | 主通道失败时，GitHub 预填链接能打开（不 404），且 title/body 字段正确编码 | L3 |

### 5.3 3 条可证伪基线（阻塞发布，PRD §13.3）

| TC ID | 基线 | 目标 | 失败 → 阻塞级 |
|-------|------|------|---------------|
| TC-BASELINE-01 | SLI-6 快捷键一致性 | diff count = 0 | P0 FAIL |
| TC-BASELINE-02 | SLI-7 高危安全漏洞数 | = 0（eslint-plugin-security + Trivy 扫描） | P0 FAIL |
| TC-BASELINE-03 | 主线 TC-MAIN-01 ~ 06 通过率 | 6 / 6 = 100% | P0 FAIL |

---

<a id="sec-6"></a>
## §6 STRIDE 安全回归用例（6 威胁 × 对应 PRD §9）

> 每条用例附攻击 POC；失败即 P0 阻塞发布。

| TC ID | 威胁 | POC | 期望结果 | 关联 CAP / NFR |
|-------|------|-----|----------|----------------|
| TC-SEC-S-01 | Spoofing（钓鱼外链） | 构造 FAQ answer `<a href="https://evil.com/yivad-login">登录</a>`，点击 | SafeLink 弹出二次确认：外链非白名单；点击取消不跳转；点击确定 target=_blank + rel | CAP-01 / SafeLink |
| TC-SEC-T-01 | Tampering（篡改静态 FAQ） | 修改 `faq-static.ts` 的其中一条，附加非法 JSON | SDK 启动检测 hash mismatch → `help.tamper_detected` 埋点上报；面板降级为空 FAQ | CAP-05 |
| TC-SEC-R-01 | Repudiation（否认反馈） | 提交反馈后，检查前端回执 localStorage.yivad-help-receipts | 存在 `{ ticketId, hmac, createdAt }`；hmac 使用 YiAi 公钥可校验（脚本验证） | CAP-07 |
| TC-SEC-I-01~12 | Info Disclosure（URL 泄漏） | 数据驱动 12 条参数：`token, access_token, password, key, secret, api_key, sk-, Bearer+空格, authorization, jwt, session, code` 加 fragment `#t=xxx` | 全部被打码为 `***` 或删除；fragment 被删；截图含 `data-secret-mask` 元素 → 对应区域纯黑遮盖 | NFR-7.4.2 / CAP-02 |
| TC-SEC-D-01~03 | DoS（反滥用） | (1) 1min 4 次提交 → 429；(2) 1000 rpm 压测 → 服务端 WAF 封禁；(3) 截图 2.1MB → 413 | 全部被拒；正常用户 3 次/分钟不阻塞 | NFR-7.4.4 / CAP-07 |
| TC-SEC-E-01~20 | Elevation（XSS 注入） | 20 payload 数据集：`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `javascript:alert(1)`, `"><svg onload=alert(1)>` 等 20 条 | SafeMarkdown 渲染后全部被转义或移除；CSP 报告 = 0；axe 扫描 0 high | NFR-7.4.1 |

---

<a id="sec-7"></a>
## §7 SLO / Burn Rate 演练用例（L1~L5 回滚验证，PRD §12.2）

> SRE GameDay 季度演练的必跑子集。每次灰度前至少跑 L1-L3；季度演练跑 L1-L5。

| TC ID | 回滚级别 | 注入故障 | 期望动作 | 成功判据 |
|-------|----------|----------|----------|----------|
| TC-ROLLBACK-L1 | L1 Kill Switch | FeatureFlag `help.center.enabled = false` 热下发 | 仅导航栏图标保留（不可点击）；alias 不注册；面板打不开 | 3 入口全部失效；30s 内生效 |
| TC-ROLLBACK-L2 | L2 Tab 级（FAQ Burn Rate） | 注入 FAQ 全部失败 30 分钟 → Burn Rate Page 告警触发 | Tab-3 FAQ 自动隐藏；顶部横幅提示：FAQ 临时维护中，请查阅 YiKnowledge 文档 | Banner 显示；Tab-3 不再渲染 |
| TC-ROLLBACK-L3 | L3 反馈降级 | 注入 feedbackService 5xx 比例 > 10%（持续 2 分钟） | 反馈 Tab 隐藏表单，展示 GitHub Issue 预填模板 CTA + 复制 Markdown 按钮 | 用户仍能完成闭环；埋点 `help.feedback.submit{channel=github}` > 0 |
| TC-ROLLBACK-L4 | L4 内核降级 | 注入 ShortcutRegistry.snapshot() throw Error 3 次；或注入 CanceledError 连续 3 起 | Tab-2 展示默认 8 条静态快照；告警触发 | 功能可用（降级）；面板不崩溃 |
| TC-ROLLBACK-L5 | L5 架构级关停 | 修改 main.ts 移除 `app.use(HelpOS)`，部署灰度 1% | HelpOS 全局不可用；`DisposerBag.dispose()` 在 shutdown.ts 唯一调用点无 AbortController 级联异常 | 全链路关闭；无控制台 error；无资源泄漏 |

---

<a id="sec-8"></a>
## §8 预置回归位验证（PRD §15 P1 ~ P6）

> 每个 P 对应一条场景化 E2E，防止「已知历史问题再现」。失败 → 对应 PR 退回。

| TC ID | 对应回归位 | 复现步骤 | 断言 |
|-------|-----------|----------|------|
| TC-REG-01 | P1 路由匹配失效导致「无相关帮助」 | 用 10 条典型路由（含 `/project/:key`, `/project/:key/issues/:id`, `/bugs/BUG-001` 等）逐一打开面板 | 命中率 ≥ 98%（≥ 10/10 或 9/10 含 1 条边界路由） |
| TC-REG-02 | P2 快捷键与注册表不一致 | 运行 `scripts/ci/check-shortcut-consistency.mjs` | 退出码 0；diff 0 行 |
| TC-REG-03 | P3 CHANGELOG 构建后白屏 | 执行 `yarn build`，然后 Playwright 在生产构建中访问 Changelog Tab | CHANGELOG 标题与条目数 ≥ 1；无白屏（截图对比） |
| TC-REG-04 | P4 反馈 URL 含 Token | 构造 `/?token=abc123&route=foo#t=secret` → 打开反馈 Tab → 检查 hidden sanitizedUrl 字段 | URL 仅保留 route；token/fragment 被移除/打码；请求 payload 断言 |
| TC-REG-05 | P5 FAQ 后端挂掉前端无限 loading | mock FAQ 接口永远 pending | 200ms 熔断后自动显示静态 20 条；Spinner 消失（≤ 250ms 内） |
| TC-REG-06 | P6 暗色模式下 Markdown 代码块对比度不足 | 切换 theme=dark，打开面板并滚动到代码块 section；axe 扫描 + 截图 diff | 对比度 ≥ 4.5:1；代码块使用 `var(--color-code-*)` 语义变量（grep 无 6 位 hex 硬编码在 HelpOS 域样式） |

---

<a id="sec-9"></a>
## §9 性能基准用例（p95 / INP / LCP / Bundle）

| TC ID | 指标 | 工具 | 目标 | 数据 |
|-------|------|------|------|------|
| TC-PERF-01 | 本地搜索 (500 条) p95 | benchmark harness | ≤ 10ms | 报告附 PR 评论 |
| TC-PERF-02 | 帮助面板首帧 LCP p95 | Lighthouse (10 runs) | ≤ 1.8s | 平均值 ≤ 1.8s |
| TC-PERF-03 | Tab 切换 INP p95 | web-vitals (10 runs 每 Tab) | ≤ 120ms | 全部 5 Tab ≤ 120ms |
| TC-PERF-04 | FAQ 远端 p95 | msw 注入 200ms 延迟 + 真实 | ≤ 200ms (降级阈值前) | 200ms 前后行为正确 |
| TC-PERF-05 | 反馈提交 p95 | 真实后端 + mock | ≤ 500ms | 报告附 PR 评论 |
| TC-PERF-06 | Bundle 增量 gzip | `yarn build:analyze` | ≤ 28KB | help chunk 截图附 PR |

---

<a id="sec-10"></a>
## §10 缺陷分级与 SLA 映射

| 级别 | 定义 | HelpOS 典型示例 | SLA 首次响应 | SLA 修复 |
|------|------|------------------|-------------|---------|
| **Blocker (P0)** | 数据泄漏或功能完全不可用且无替代方案 | XSS 成功；STRIDE-I-01~12 任一条失败；HelpOS 面板崩溃影响全站点渲染 | ≤ 15min | ≤ 2h (执行 L5) |
| **Critical (P1)** | 核心闭环断裂 | 反馈双通道全部失败；快捷键全部不展示；面板 3 入口全部打不开 | ≤ 1h | ≤ 24h (执行 L3/L4) |
| **Major (P2)** | 功能缺陷但有替代路径 | Changelog 10 条版本后虚拟滚动失效；URL 仅 fragment 未删除（Query 白名单已生效） | ≤ 4h | ≤ 48h |
| **Minor (P3)** | 体验问题 | Kbd icon 间距 2px 偏差；空态文案非最优 | ≤ 1 工作日 | ≤ 5 工作日 |
| **Trivial (P4)** | 视觉细节 | 阴影/透明度微调；emoji 不一致 | 下个迭代 | 下个迭代 |

---

<a id="sec-11"></a>
## §11 测试报告模板与 CI 门禁

### 11.1 CI 门禁（每 PR 强制执行）

| Gate | 脚本 | 失败 → 处理 |
|------|------|-------------|
| 类型 | `yarn exec vue-tsc --noEmit` | 拒绝合入 |
| L1/L2/L3 | `yarn exec vitest run tests/help-center/ tests/composables/useHelp* tests/utils/url-sanitize.test.ts --coverage` | < 85% 行 / < 75% 分支 → 拒绝合入 |
| STRIDE 安全 | `yarn exec eslint --plugin security src/components/help-center/** src/composables/useHelp* src/utils/url-sanitize.ts` | high ≥ 1 → 拒绝合入 |
| 快捷键一致性 | `yarn scripts/ci/check-shortcut-consistency.mjs` | 非 0 diff → 拒绝合入 |
| Changelog 健康度 | `yarn scripts/ci/check-help-changelog.mjs` | < 80% → FAIL（发布流水线）；< 95% → WARN |
| Trace 映射 | `yarn scripts/ci/check-trace-mapping.mjs` | FR/AC 覆盖率 < 100% → 拒绝合入 |
| Bundle 增量 | `yarn build:analyze`（report threshold: 28KB gzip） | 超阈值 → 书面豁免需 Eng Lead + SRE 双签 |

### 11.2 测试报告模板（交付必填）

```
# YV-09-70 HelpOS 测试报告（YYYY-MM-DD）
版本: commit <sha>  环境: Staging   执行员: <name>
- 准入: 通过   准出-2 合入: 通过   准出-3 灰度: 通过/未开始   准出-4 全量: 未开始
- 用例执行总数: XXX   通过: XXX   失败: XXX   跳过: XXX
- 覆盖:
  - FR-01~10: 100% (XX/XX)
  - NFR: 100% (XX/XX)
  - 23 AC: 100% (23/23)
  - STRIDE: 6/6   L1-L5 演练: 5/5   预置回归 P1-P6: 6/6
- 遗留缺陷: Blocker 0 / Critical 0 / Major X / Minor Y   （附链接）
- 性能 (截图归档): LCP=X.XXs · INP=XXXms · Bundle=XKB · 搜索 p95=Xms
- 签名: QA ___  Eng Lead ___  Product ___  SRE ___
```

---

<a id="sec-12"></a>
## §12 交付物与签字页

### 12.1 必交付物

| 交付物 | 形式 | 归档位置 |
|--------|------|----------|
| 测试执行录屏（6 主线 + STRIDE 6 + L1-L5 演练） | mp4 | e2e/artifacts/YV-09-70/ |
| 覆盖率报告（HTML） | HTML | coverage/help-os/index.html |
| STRIDE 回归用例报告（20 XSS payload 截图） | PDF | YiKnowledge/projects/yivad/tests/reports/YV-09-70-security.pdf |
| 性能基准报告 | JSON + 截图 | benchmarks/help-search/ + build analyze 截图 |
| 测试报告（§11.2 模板） | Markdown | YiKnowledge/projects/yivad/tests/2026-09/reports/YV-09-70-report.md |

### 12.2 签字页（可追溯到 OKR → PRD → Dev → Test 闭环）

| 角色 | 姓名 | 签核 | 日期 |
|------|------|------|------|
| Product（PRD 负责人） | 陈铭 | ____ | ____ |
| Engineer Lead（Dev v2.0 实现） | ____ | ____ | ____ |
| QA Lead（Test v2.0 执行） | ____ | ____ | ____ |
| SRE（SLO/Burn Rate 演练） | ____ | ____ | ____ |
| Security（STRIDE 审计） | ____ | ____ | ____ |

---

*本测试规格随 PRD v2.0 专业化重写同步升级（2026-10-09）。v1.0（2026-09-11）定义的 6 条基础场景与 FR-1~FR-9 旧编号映射已废弃不向后兼容；新测试一律以本文件 §3 FR-01 ~ FR-10、§5 23 AC 为准。*
