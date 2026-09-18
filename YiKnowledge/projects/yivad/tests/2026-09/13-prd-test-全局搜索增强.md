---
doc_type: test
title: "全局搜索增强 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-36"
source_prds: ["13-prd-全局搜索增强"]
source_modules: []
---
# 全局搜索增强 — 测试规格

> 来源 PRD：[13-prd-全局搜索增强.md](../../prds/2026-09/13-prd-全局搜索增强.md)

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
| FR-1 | 命令面板主组件 | UT + CT + IT | ✅ 已完成 |
| FR-2 | 搜索 Composable | CT | ✅ 已完成 |
| FR-3 | 模糊搜索引擎 | UT + CT + IT | ✅ 已完成 |
| FR-4 | 搜索结果分组组件 | UT + CT + IT | ✅ 已完成 |
| FR-5 | 搜索结果项组件 | UT + CT + IT | ✅ 已完成 |
| FR-6 | 搜索历史 Composable | UT + CT + IT | ✅ 已完成 |
| FR-7 | 搜索索引服务 | UT + CT + IT | ✅ 已完成 |
| FR-8 | 类型定义 | UT + CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 组件测试：CommandPalette

#### Scenario: Ctrl+K 打开命令面板
- **GIVEN** 用户在任意页面
- **WHEN** 按下 Ctrl+K（Mac 为 Cmd+K）
- **THEN** 命令面板可见，搜索输入框自动聚焦

#### Scenario: Esc 关闭命令面板
- **GIVEN** 命令面板打开
- **WHEN** 按下 Esc 键
- **THEN** 命令面板关闭，搜索内容清空

#### Scenario: 输入搜索词后显示结果
- **GIVEN** 命令面板打开，搜索索引包含 "PLANE" 项目
- **WHEN** 输入 "PLANE"
- **THEN** 搜索结果中显示 "PLANE" 项目，按实体类型分组

### 单元测试：搜索语法解析

#### Scenario: 解析 type 过滤器
- **GIVEN** 输入字符串 `type:issue 登录`
- **WHEN** 调用 `parseSearchSyntax`
- **THEN** `keyword` 为 `"登录"`，`filters.type` 为 `"issue"`

#### Scenario: 解析多个过滤器
- **GIVEN** 输入字符串 `type:bug status:open project:PLANE`
- **WHEN** 调用 `parseSearchSyntax`
- **THEN** `filters` 包含 `{ type: "bug", status: "open", project: "PLANE" }`，`keyword` 为 `""`

#### Scenario: 搜索历史持久化
- **GIVEN** 搜索历史为空
- **WHEN** 搜索 "PLANE" 后关闭面板，再次打开面板
- **THEN** 搜索历史中显示 "PLANE"

---


## 补充：单元测试用例

### UT-GS01: Fuse.js 搜索集成

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 模糊搜索 | keyword='projct'(typo) | 匹配 'project' |
| 2 | 多字段搜索 | 搜索词匹配 title + description | 返回合并排序结果 |
| 3 | 阈值配置 | threshold=0.4 | 仅返回相似度 >= 0.4 的结果 |
| 4 | 实体类型过滤 | type:issue keyword | 仅搜索 Issue 实体 |

### UT-GS02: 命令面板

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 打开面板 | Ctrl+K | 命令面板显示 |
| 2 | 搜索导航 | 输入 '项目' | 显示相关页面/操作 |
| 3 | 键盘选择 | ↓↑ 选择 + Enter 确认 | 执行选中操作 |

