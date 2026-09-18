---
doc_type: test
title: "YV-09-68: 全局搜索命令面板 — Ctrl+K 全局操作、模糊搜索、快速导航、计算器、AI 查询 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-68"
source_prds: ["34-prd-全局搜索命令面板"]
source_modules: []
---
# YV-09-68: 全局搜索命令面板 — Ctrl+K 全局操作、模糊搜索、快速导航、计算器、AI 查询 — 测试规格

> 来源 PRD：[34-prd-全局搜索命令面板.md](../../prds/2026-09/34-prd-全局搜索命令面板.md)

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
| FR-1 | 当前导航与操作入口 | CT + IT | ✅ 已完成 |
| FR-2 | 导航路径成本分析 | CT + IT | ✅ 已完成 |
| FR-3 | 改造前操作流程 | CT + IT | ✅ 已完成 |
| FR-4 | 根因矩阵 | CT + IT | ✅ 已完成 |
| FR-5 | 查询路由流程 | CT + IT | ✅ 已完成 |
| FR-6 | 命令注册接口 | CT + IT | ✅ 已完成 |
| FR-7 | 命令面板组件 | CT + IT | ✅ 已完成 |
| FR-8 | 计算器/转换器 | CT + IT | ✅ 已完成 |
| FR-9 | 文件变更清单 | CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：打开命令面板

**GIVEN** 用户在任意页面
**WHEN** 用户按下 Ctrl+K（或 Cmd+K）
**THEN** 应显示命令面板 overlay
**AND** 搜索输入框应自动聚焦
**AND** 应展示最近使用的命令

### 场景 2：搜索并执行命令

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "创建 Issue"
**THEN** 应过滤出包含"创建 Issue"的命令
**AND** 用户按 Enter 后应导航到创建 Issue 页面

### 场景 3：搜索实体

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "BUG-001"
**THEN** 应展示匹配的 Bug 实体结果
**AND** 点击后应导航到 Bug 详情页面

### 场景 4：计算器

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "100 * 1.5 + 20"
**THEN** 应识别为数学表达式
**AND** 应展示计算结果 "170"
**AND** 按 Enter 应复制结果到剪贴板

### 场景 5：单位转换

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "100 km to mi"
**THEN** 应识别为单位转换
**AND** 应展示转换结果 "62.1371 mi"

### 场景 6：AI 查询

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "? 如何优化 MongoDB 查询性能"
**THEN** 应识别为 AI 查询
**AND** 应通过 SSE 流式展示 AI 回答
**AND** 回答完成后用户可复制到剪贴板

---

