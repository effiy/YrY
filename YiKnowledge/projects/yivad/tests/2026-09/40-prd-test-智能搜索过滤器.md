---
doc_type: test
title: "YV-09-87: 智能搜索过滤器 — 自然语言查询、保存过滤预设、过滤器分享、使用模式建议、语法高亮、布尔组合(AND/OR/NOT) — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-87"
source_prds: ["40-prd-智能搜索过滤器"]
source_modules: []
---
# YV-09-87: 智能搜索过滤器 — 自然语言查询、保存过滤预设、过滤器分享、使用模式建议、语法高亮、布尔组合(AND/OR/NOT) — 测试规格

> 来源 PRD：[40-prd-智能搜索过滤器.md](../../prds/2026-09/40-prd-智能搜索过滤器.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---


---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |

### 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 当前过滤器构建流程 | CT + IT | ✅ 已完成 |
| FR-2 | 当前过滤器能力矩阵 | CT + IT | ✅ 已完成 |
| FR-3 | 改造前数据流 | CT + IT | ✅ 已完成 |
| FR-4 | 根因矩阵 | CT + IT | ✅ 已完成 |
| FR-5 | 双向同步数据流 | CT + IT | ✅ 已完成 |
| FR-6 | DSL 语法规范 | CT + IT | ✅ 已完成 |
| FR-7 | 过滤器 DSL 解析器 | IT | ✅ 已完成 |
| FR-8 | 自然语言解析引擎 | CT + IT | ✅ 已完成 |
| FR-9 | 智能过滤器搜索栏 UI | CT + IT | ✅ 已完成 |
| FR-10 | 语法高亮实现 | CT + IT | ✅ 已完成 |
| FR-11 | 文件变更清单 | CT + IT | ✅ 已完成 |
| FR-12 | 后端预设 API | CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：自然语言解析 — 简单查询

**GIVEN** 用户在自然语言输入框中输入 "高优先级 bug"
**WHEN** 规则引擎解析
**THEN** 应解析为 `priority:high AND status:bug`
**AND** DSL 编辑器同步显示 "priority:high status:bug"
**AND** GUI 面板显示两个过滤条件（priority=high, status=bug, 逻辑=AND）

### 场景 2：自然语言解析 — 复杂查询触发 LLM

**GIVEN** 用户输入 "跟支付相关的那个紧急问题"
**WHEN** 规则引擎无法完全解析（unmatched = ["支付", "紧急"]）
**THEN** 标记 needsLLM = true
**AND** 异步调用 YiAi LLM 解析
**AND** 显示 loading 状态（骨架屏）
**AND** LLM 返回 `tags:payment priority:urgent` 后更新过滤器

### 场景 3：DSL 编辑器语法高亮

**GIVEN** 用户在 DSL 编辑器中输入 "NOT status:closed (priority:high OR priority:urgent)"
**WHEN** 实时词法分析
**THEN** NOT 应显示为紫色粗体
**AND** status 应显示为蓝色
**AND** closed 应显示为绿色
**AND** 括号应显示为灰色
**AND** OR 应显示为紫色粗体

### 场景 4：GUI 和 DSL 双向同步

**GIVEN** 在 GUI 中添加条件 `status = bug`，逻辑为 AND
**WHEN** 查看 DSL 编辑器
**THEN** DSL 应显示 "status:bug"
**WHEN** 在 DSL 编辑器中追加 " OR status:issue"
**THEN** GUI 应显示 OR 分组，包含两个 status 条件

### 场景 5：保存和加载过滤预设

**GIVEN** 当前过滤器为 "assignee:@me priority:high status:bug"
**WHEN** 用户点击"保存预设"，输入名称"我的高优 bug"
**AND** 选择可见性为"团队"
**THEN** 预设保存到后端
**AND** 团队成员在预设列表中可见"我的高优 bug"
**WHEN** 团队成员点击加载该预设
**THEN** 过滤器自动应用为 "assignee:@me priority:high status:bug"

### 场景 6：过滤器 URL 分享

**GIVEN** 当前过滤器为 "status:bug priority:high"
**WHEN** 用户点击"复制链接"
**THEN** 生成 URL: `yivad/bugs?filter=eyJzdGF0dXMiOiJidWciLCJwcmlvcml0eSI6ImhpZ2gifQ==`
**AND** 剪贴板中应复制完整 URL
**WHEN** 其他用户打开该 URL
**THEN** 自动应用过滤器 "status:bug priority:high"
**AND** SmartFilterBar 显示当前的过滤条件

---

