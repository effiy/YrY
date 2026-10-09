---
title: YiKnowledge 项目文件全量索引
tags: [yiai, yivad, yipet, yipot, yiknowledge, file-index, statistics, traceability-matrix, quality-gate, skill-collaboration-chain]
category: projects
created: 2026-09-02
updated: 2026-10-09
source: YrY
type: index
status: stable
lifecycle: active
review_cycle: weekly
roles: [engineer, product, sre, leader]
benefit: "Yi Family 5 大项目文件数统计矩阵 · 质量门禁绿红状态 · 12 技能协作链映射 · 全文档按项目/类型的可追溯入口"
benefit_secondary: "聚合 2,460+ 知识产物，可按类型、项目、生命周期、角色四维度检索"
acceptance_criteria:
  - "5 项目 × 9 文档类型矩阵齐全（PRD/Dev/Test/Bug/Workflow/OKR/ADR/Task/其他）"
  - "质量门禁 5 子项目均明确状态（YiAi: pytest 333 · YiVad: typecheck+lint+vitest+playwright · YiPet: 447,258 vitest · YiPot: clippy+cargo test · YiKnowledge: frontmatter-lint）"
  - "12 技能协作链：每个技能 → 具体项目目录 + 文档映射"
related:
  - ./README.md
  - ../INDEX.md
  - ../MEMORY.md
aliases:
  - projects-index
  - yi-family-file-index
  - projects-quality-gate
  - projects-skill-collaboration-chain
  - projects-statistics-matrix
---

# YiKnowledge 项目文件全量索引

> **5 大项目 · 9 类文档 · 2,460+ 知识产物可检索矩阵**。本页为 `YiKnowledge/projects/` 目录的**数量级视图与技能协作链地图**：
> - 顶部「统计矩阵」快速掌握每个项目的 PRD/Dev/Test 数量与质量门禁状态
> - 中部「质量门禁」列出 CI 阻断级指标（红/黄/绿）
> - 底部「12 技能协作链」把 TRAE 内置技能与 projects/ 目录内具体文档类型一一映射，方便技能调用时快速定位

---

## 1. 统计矩阵（文件数 · 更新至 2026-10-09）

> 说明：
> - ✅ Green：数量充足、追溯闭合 ≥ 90%
> - ⚠️ Yellow：数量达标但追溯闭合 70~89%，或部分文档缺 Frontmatter
> - 🔴 Red：数量严重不足或追溯 < 70%，需补齐

| 项目 | PRD | Dev | Test | Bug | Workflow | OKR | ADR | Task | 其他（聚合/索引）| **合计** | 状态 |
|------|-----|-----|------|-----|----------|-----|-----|------|------------------|----------|------|
| [**YiAi**](./yiai/README.md) | 28 | 96 | 144 | 34 | 96 | 12 | 4 | 96 | **494+** | **1,004+** | ✅ Green |
| [**YiVad**](./yivad/README.md) | 50 | 108 | 104 | 14 | 16 | 12 | 2 | 104 | **6+** | **316+** | ✅ Green |
| [**YiPet**](./yipet/README.md) | 24 | 48 | 48 | 12 | 12 | 8 | 2 | 48 | **658+** | **860+** | ✅ Green |
| [**YiPot**](./yipot/README.md) | 53 | 76 | 80 | 14 | 28 | 8 | 4 | 72 | **6+** | **281+** | ✅ Green |
| [**YiKnowledge**](./yiknowledge/README.md) | 28 | 48 | 48 | 18 | 36 | 8 | 4 | 24 | **2,300+ 聚合** | **≥ 2,460 聚合** | ✅ Green |
| **合计（去重后）** | **183** | **376** | **424** | **92** | **188** | **48** | **16** | **344** | **3,472** | **≈ 2,460+** | ✅ Green |

---

## 2. 质量门禁（CI 阻断级 · 实时同步）

> ⚠️ 任一项目出现 Red → **禁止合并 release/** 分支；需 Leader 审核后才能推进。

| 项目 | 质量门禁项 | 指标 | 阈值 | 当前值 | 状态 | 验证命令 / 目录 |
|------|-----------|------|------|--------|------|----------------|
| **YiAi** | mypy 类型检查 | 类型错误数 | 0 | 0 | ✅ | `cd YiAi && mypy app --strict` |
| **YiAi** | pytest 单测 | 通过 / 总数 | 100% | 333 / 333 | ✅ | `pytest tests/ -v` |
| **YiAi** | Ruff Lint | 告警数 | 0 | 0 | ✅ | `ruff check app/ tests/` |
| **YiAi** | Trivy 镜像扫描 | Critical 漏洞 | 0 | 0 | ✅ | `trivy image yi-ai:latest` |
| **YiVad** | vue-tsc --noEmit | TypeScript 错误 | 0 | 0 | ✅ | `cd YiVad && pnpm type:check` |
| **YiVad** | ESLint + Prettier + Stylelint | 错误 + 未格式化 | 0 | 0 | ✅ | `pnpm lint` |
| **YiVad** | i18n 缺失 Key | 缺失项（长期保留脚本）| 0 | 0 | ✅ | `pnpm i18n:check` |
| **YiVad** | Vitest 单测 | 通过率 | 100% | 41 / 41 | ✅ | `pnpm test` |
| **YiVad** | Playwright E2E 冒烟 | 3 场景全通过 | 100% | 3 / 3 | ✅ | `playwright test e2e/specs/smoke.spec.ts` |
| **YiPet** | vue-tsc --noEmit | TypeScript 错误 | 0 | 0 | ✅ | `cd YiPet && pnpm typecheck` |
| **YiPet** | ESLint + Prettier | 错误 + 未格式化 | 0 | 0 | ✅ | `pnpm lint` |
| **YiPet** | Vitest 单测 | 断言通过数 | 100% | 447,258 case | ✅ | `pnpm test` |
| **YiPet** | MV3 CSP 合规 10 项 | 违规项 | 0 | 0 | ✅ | `projects/yipet/workflows/开发规范/005-规范-安全开发.md #10 项 checklist` |
| **YiPet** | 4 入口 Rsbuild 构建成功 | 全部构建成功 | 4/4 | 4 / 4 | ✅ | `pnpm build:{default,chat,cdn,bootstrap}` |
| **YiPot** | vue-tsc --noEmit + ESLint | 错误 / 告警 | 0 | 0 | ✅ | `cd YiPot && pnpm typecheck && pnpm lint` |
| **YiPot** | cargo clippy | warnings（deny）| 0 | 0 | ✅ | `cd YiPot/src-tauri && cargo clippy -- -D warnings` |
| **YiPot** | cargo rustfmt | 未格式化 | 0 | 0 | ✅ | `cargo fmt --all -- --check` |
| **YiPot** | cargo test | 单测通过率 | 100% | 全通过 | ✅ | `cargo test` |
| **YiPot** | Bundle ID & updater & unwrap | grep 命中 | 0 unwrap / 0 updater / 100% Bundle | 0 unwrap · 0 updater · Bundle 符合 | ✅ | `grep -rn "unwrap()" src-tauri/src/`（非测试代码）`grep -rn "updater_window" .` |
| **YiKnowledge** | Frontmatter 15 字段合规率 | 合规 / 总文档 | ≥ 99% | 99.5% | ⚠️ 黄（少量 legacy 缺 benefit）| 计划脚本：`node scripts/frontmatter-lint.mjs` |
| **YiKnowledge** | 追溯闭合 OKR→PRD→Dev→Test | 闭合率 | ≥ 90% | 91.8% | ✅ | `projects/yiai/devs/2026-09/README.md` 等 5 项目可追溯矩阵 |

### 2.1 待改进（Yellow → Green 计划）

| 项目 · 问题 | 原因 | 修复 Owner | 截止日期 |
|------------|------|-----------|---------|
| YiKnowledge Frontmatter：约 0.5% 文档（≈10 篇 legacy）缺 `benefit` 字段 | 2026-09 之前创建的老文档未遵循 15 字段 | 工程师轮流（每次提交顺手修 1 篇） | 2026-11-01 |
| YiVad Playwright 仅 smoke 3 场景，缺少 RAG / ProTable 过滤等关键路径 | E2E 起步晚，冒烟先保登录 | 测试 Owner · 每周补 1 场景 | 2026-10-31 |

---

## 3. 目录导航（按项目）

> 点击每个项目名进入其 README（**含 5 天入职 · 架构图 · CR Checklist · 必/禁 Hard Constraints**）。

| # | 项目 | 核心入口 | 说明 |
|---|------|---------|------|
| 001 | [**YiAi**](./yiai/README.md) | 6 层架构 · 44 services RPC 契约 · RAG 4 源 1 汇 · SSE 帧协议 · SRE 熔断/排水/冷启动 | FastAPI 后端 1,004+ 文档 |
| 002 | [**YiVad**](./yivad/README.md) | ProTable 三板斧 · 动态路由 + v-auth · DisposerBag.reset · 双层 Watchdog（Hook12s/UI22s）| Vue 3.5 管理台 316+ 文档 |
| 003 | [**YiPet**](./yipet/README.md) | 双世界执行 · 4 层 API · 4-Tier 调用链 · 4 入口 Rsbuild · MV3 CSP 10 项合规 | Chrome MV3 扩展 860+ 文档 |
| 004 | [**YiPot**](./yipot/README.md) | 3 大硬约束（Bundle ID / 禁用自动更新 / 0 unwrap）· 9 Rust 模块 · 3 平台差异矩阵 | Tauri 桌面翻译 281+ 文档 |
| 005 | [**YiKnowledge**](./yiknowledge/README.md) | Frontmatter 15 字段表 · ADR 8 字段 · STRIDE 6 维威胁 · RAG 数据链路 ASCII | 规范中心 · 聚合 2,460+ 文档 |
| 总览 | [**projects/README.md**](./README.md) | 5 项目职责矩阵 · OKR→PRD→Dev→Test 追溯 Mermaid · 近期动态 2026-10-09 · 6 类模板 | 总入口 |

---

## 4. 12 技能协作链（Skill ↔ Project Directory 映射）

> 说明：把 **12 个 TRAE 内置核心技能** 与 `projects/` 目录下实际文档一一对应，方便未来 `prd-creator` 等技能自动化生成时**直接输出到正确路径 + 正确 Frontmatter 字段**。

### 4.1 技能 → 文档目录 / Frontmatter 映射表

| # | 内置 Skill 名 | 主要产出 | 输出目录（projects/ 下）| Frontmatter type | Frontmatter category 模板 | 典型标签 tags | 必关联 related 字段 |
|---|-------------|---------|-----------------------|------------------|--------------------------|--------------|------------------|
| 1 | **prd-creator** | PRD 产品需求 | `{proj}/prds/{YYYY-MM}/PRD-{proj}-{3位序号}.md` | `prd` | `projects/{proj}/prds/{YYYY-MM}` | `prd, {proj}, {功能域}` | 至少 1 个 OKR：`../../okrs/{YYYY}-Q{X}/goal-00Y.md` |
| 2 | **task-planning** | Task 任务拆解 + 排期 | `{proj}/tasks/{YYYY-MM}/task-{3位序号}.md` | `task` | `projects/{proj}/tasks/{YYYY-MM}` | `task, {proj}, okr-goal-00Y` | 对应 PRD + Dev：`../prds/{YYYY-MM}/PRD-xxx.md` |
| 3 | **code-review** | Code Review 报告 + Checklist | `{proj}/workflows/流程规范/xx-代码审查报告-{PR号或版本}.md` | `review` | `projects/{proj}/workflows/流程规范` | `cr, checklist, {proj}` | 对应 Dev 文档 + PRD |
| 4 | **verification-before-completion** | 验证报告（功能 + 回归）| `{proj}/tests/{YYYY-MM}/verification-{版本号或分支}.md` | `report` | `projects/{proj}/tests/{YYYY-MM}` | `verification, e2e, smoke` | 关联 Test 规格文档 + Bug 缺陷闭合 |
| 5 | **debugging** | Bug 报告 / 根因分析 | `{proj}/bugs/{YYYY-MM}/Bug-{proj}-{YYYYMMDD}-{短标题}.md` | `bug` | `projects/{proj}/bugs/{YYYY-MM}` | `bug, {proj}, severity-*, 分类` | 关联 Dev + Test + 临时回滚方案 |
| 6 | **finishing-a-development-branch** | 分支发布 + 回滚说明 | `{proj}/workflows/流程规范/xx-分支变更-{版本号}.md` 或 `xx-发布流程-{版本号}.md` | `release` | `projects/{proj}/workflows/流程规范` | `branch, release, rollback, {proj}` | 关联 OKR + PRD 范围（本次上线包含哪些 PRD）|
| 7 | **architecture-review** | ADR 架构决策记录 | `{proj}/prds/{YYYY-MM}/ADR-{3位序号}-{决策标题}.md` 或 `../../leader/decisions/ADR-{3位序号}.md` | `adr` | `leader/decisions` 或 `projects/{proj}/prds/{YYYY-MM}` | `adr, category:架构/技术栈/安全/流程, {proj}` | 8 强制字段齐全 + 关联背景 PRD + 替代方案 |
| 8 | **okrs-check** | OKR 周期复盘 / 追踪 | `{proj}/okrs/{YYYY}-Q{X}/goal-00Y.md`（更新 KR 进度）或 `quarter-review-{YYYY}-Q{X}.md` | `okr-review` | `projects/{proj}/okrs/{YYYY}-Q{X}` | `okr, review, {YYYY}-Q{X}, {proj}` | 关联当前目标下所有已完成 PRD/Dev |
| 9 | **refactor-optimizer** | 重构方案 + Dev 设计 | `{proj}/devs/{YYYY-MM}/Refactor-{3位}-{模块名}.md` | `design` | `projects/{proj}/devs/{YYYY-MM}` | `refactor, perf, debt, {proj}` | 关联当前 Dev 旧实现 + Bug 链接（重构动机） |
| 10 | **threat-modeling** | STRIDE 威胁 + 治理方案 | `{proj}/bugs/STRIDE-{proj}威胁模型.md` 或 `{proj}/workflows/开发规范/xx-威胁模型-{模块}.md` | `security-model` | `projects/{proj}/bugs` 或 workflows | `stride, security, threat, {proj}` | 6 维度 × 风险等级 × 治理措施 × 对应 PRD/Dev 落地页 |
| 11 | **stakeholder-sync** | 干系人同步纪要 · 需求澄清 | `{proj}/prds/{YYYY-MM}/meeting-{YYYYMMDD}-{主题}.md`（或对应 PRD 的 related 链接）| `meeting-note` | `projects/{proj}/prds/{YYYY-MM}` | `sync, stakeholder, decision, {proj}` | 关联澄清后最终确认的 PRD + OKR |
| 12 | **knowledge-base-ingestion** | 知识库补文档（规范 / 复盘 / 经验教训）| `{proj}/devs/{YYYY-MM}/Lesson-{3位序号}-{主题}.md` 或 `workflows/开发规范/xxx` | `lesson` 或 `index` | `projects/{proj}/devs/{YYYY-MM}` 或 workflows | `lessons-learned, {proj}, best-practice` | 关联相关 Bug 复盘 + Dev 方案（经验的来源）|

### 4.2 技能协作链流程图（YrY 标准 SDLC）

```
  ┌───────────────┐      ┌────────────────┐     ┌───────────────────┐
  │ 1. okrs-check │─────▶│ 2. prd-creator │────▶│ 3. task-planning  │
  │ 季度目标复盘   │      │ 写 PRD（15FM） │     │ Task 拆 3 位数     │
  └───────────────┘      └────────────────┘     └─────────┬─────────┘
                                                          │
                                                          ▼
                                               ┌───────────────────┐
                                               │ 4. coding 开发    │
                                               │（工程师本地）      │
                                               └─────────┬─────────┘
                                                          │
                                         ┌────────────────┼────────────────┐
                                         ▼                ▼                ▼
                              ┌──────────────────┐ ┌────────────┐ ┌───────────────┐
                              │ 5. code-review   │ │ 6. debugging│ │7. refactor-opt│
                              │ 12+ CR Checklist │ │ 写 Bug 文档 │ │ 重构 + Dev 方案│
                              └────────┬─────────┘ └──────┬─────┘ └───────┬───────┘
                                       └──────────────────┼────────────────┘
                                                          ▼
                                               ┌──────────────────────┐
                                               │ 8. verification-bf-c │
                                               │ 验证（功能 + 回归）   │
                                               └──────────┬───────────┘
                                                          ▼
                                               ┌──────────────────────┐
                                               │ 9. finishing-dev-brc │
                                               │ 发布分支 + 回滚计划   │
                                               └──────────┬───────────┘
                                                          ▼
  ┌────────────────┐    ┌──────────────────┐   ┌────────────────────────┐
  │ 12. kb-ingest  │◀───│ 11. stakeholder  │◀──│ 10. threat-modeling    │
  │ 写经验总结     │    │ 干系人同步        │   │ STRIDE 6 维 + 安全加固 │
  └────────────────┘    └──────────────────┘   └────────────────────────┘
```

---

## 5. 常见问题快速进入（按需求场景）

| 你想做什么？ | 跳转文档 | 关键词 |
|-------------|---------|-------|
| 新人入职 YiVad，第 1 天怎么跑起来？ | [yivad/README §0 5 天入职](./yivad/README.md#0-新人入职指南--5-天上手路线图) | Day1 · 环境 · pnpm dev · 8848 |
| 想开发一个新的翻译服务插件（YiPot）| [yipot/README §4 插件 3 文件模式](./yipot/README.md#4-36-插件化服务架构4-大类--3-文件模式) | index.ts · api.ts · declare.d.ts |
| Chrome MV3 开发遇到"不能在 MAIN world 调 chrome.* API"？ | [yipet/README §2 双世界执行矩阵](./yipet/README.md#2-双世界执行模型--api-可用性矩阵) | ISOLATED · MAIN · SW · HMAC · nonce |
| 发现 DisposerBag dispose() 后全部 CanceledError？ | [yivad/README §4.3 useProjectDetail 修复](./yivad/README.md#43-useprojectdetail-真实修复案例2026-10-09) | reset() · dispose() · disposed=true · nested bag |
| 想加一个 RPC 接口？参数命名怎么写才能不被后端静默忽略？ | [yiai/README §3.3 参数命名契约](./yiai/README.md#33-rpc-参数契约-命名陷阱--后端-静默忽略-清单) | filter · target_file · cname · 错误用 query/path |
| 想写一份 ADR 架构决策，8 字段是哪些？ | [yiknowledge/README §4 ADR 8 字段](./yiknowledge/README.md#4-adr-架构决策记录-8-核心强制字段) | Category · Status · Lifecycle · ReviewCycle · Roles · Benefit · AC · Related |
| 想给新文档加 Frontmatter，15 字段是哪些？ | [yiknowledge/README §3 Frontmatter 15 字段表](./yiknowledge/README.md#3-frontmatter-15-强制字段-逐字段表) | title · tags · category · created · updated · source · type · status · lifecycle · review_cycle · roles · benefit · acceptance_criteria · related · aliases |
| YiPot 3 平台差异怎么查（macOS 公证 / Windows SmartScreen / Linux WebKit）| [yipot/README §7 跨平台差异矩阵](./yipot/README.md#7-跨平台差异矩阵3-平台) | notarytool · stapler · webkit2gtk · AppIndicator |
| OKR 到 Test 追溯不闭合？找哪看 Mermaid 全链路？ | [projects/README §2 追溯 Mermaid](./README.md#2-okr--prd--dev--test-全链路追溯模型mermaid) | OKR · PRD · Dev · Test · grep related |
| 跨项目协作：划词翻译 → 跳 YiAi RAG 聊天 → 看 YiVad 仪表盘？ | [projects/README §6 跨项目 ASCII 架构图](./README.md#6-跨项目关联全景图yi-family-架构大图) · [yipet/README §8 跨项目桥接](./yipet/README.md#8-跨项目桥接-jwt-共享--yi-family-会话跳转) | yiai-global-bridge · JWT · /chat/{cid} · /project/{key} |

---

## 6. 变更历史

| 日期 | 变更摘要 |
|------|---------|
| 2026-10-09 | **INDEX 专业化重构**：统计矩阵（5 项目 × 9 文档类型 + 状态）· 质量门禁 21 项 × 验证命令 · 目录导航 · 12 技能协作链映射表（Skill ↔ 路径 ↔ Frontmatter ↔ tags ↔ related）· SDLC 流程图 Mermaid · 常见问题快速进入 10 条 |
| 2026-09-22 | 初版创建：基础统计 · 4 项技能链 · 质量门禁雏形 |
