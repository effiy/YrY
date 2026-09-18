---
doc_type: test
title: "YV-09-85: 知识管理面板 — 知识库管理仪表盘、内容创建工作流、健康指标、贡献排行榜、知识缺口可视化、RAG 性能关联、YiKnowledge 同步状态 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-85"
source_prds: ["38-prd-知识管理面板"]
source_modules: []
---
# YV-09-85: 知识管理面板 — 知识库管理仪表盘、内容创建工作流、健康指标、贡献排行榜、知识缺口可视化、RAG 性能关联、YiKnowledge 同步状态 — 测试规格

> 来源 PRD：[38-prd-知识管理面板.md](../../prds/2026-09/38-prd-知识管理面板.md)

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
| FR-1 | 当前知识管理流程 | CT + IT | ✅ 已完成 |
| FR-2 | 当前可用能力 | CT + IT | ✅ 已完成 |
| FR-3 | 改造前数据流 | CT + IT | ✅ 已完成 |
| FR-4 | 根因矩阵 | CT + IT | ✅ 已完成 |
| FR-5 | 改造后知识管理流程 | CT + IT | ✅ 已完成 |
| FR-6 | 功能模块结构 | CT + IT | ✅ 已完成 |
| FR-7 | 知识管理仪表盘 | CT + IT | ✅ 已完成 |
| FR-8 | 知识文件编辑器 | CT + IT | ✅ 已完成 |
| FR-9 | 文件变更清单 | CT + IT | ✅ 已完成 |
| FR-10 | 后端 API | CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：仪表盘数据加载

**GIVEN** 知识库有 800+ 文件
**WHEN** 策展人打开知识管理仪表盘
**THEN** 应显示总文件数、分类数、字数概览
**AND** 分类分布饼图应正确渲染
**AND** 健康评分应介于 0-100 之间

### 场景 2：健康指标检测

**GIVEN** 知识库中有 10 个过期的文件、5 个 frontmatter 不完整的文件
**WHEN** 策展人查看健康指标
**THEN** 应显示过期文件数 10、不完整文件数 5
**AND** 点击每种问题类型应跳转到对应的文件列表

### 场景 3：在线创建知识文件

**GIVEN** 策展人在知识编辑器中填写 frontmatter 和 Markdown 内容
**WHEN** 点击保存
**THEN** 文件应通过 `/write-file` API 写入 YiKnowledge 文件系统
**AND** KnowledgeWatcher 应检测到变更并同步到 MongoDB
**AND** 应显示保存成功 + 同步完成的提示

### 场景 4：贡献排行榜

**GIVEN** 3 个作者分别贡献了 50/30/20 个文件
**WHEN** 策展人查看贡献排行榜
**THEN** 应按照文件数降序排列
**AND** 应显示每个作者的最近贡献日期

### 场景 5：知识缺口可视化

**GIVEN** 策展人定义了期望文档结构，但缺 3 个文件
**WHEN** 查看知识缺口图表
**THEN** 应高亮显示缺失的文件路径
**AND** 应显示缺失原因和优先级

### 场景 6：同步状态监控

**GIVEN** KnowledgeWatcher 最近一次同步失败
**WHEN** 策展人查看同步状态
**THEN** 应显示红色错误状态
**AND** 应显示错误详情（失败原因、失败文件数）

---

