---
doc_type: test
title: "YV-09-121: 系统公告管理 — 定向公告、定时发布、模板管理、可关闭记忆与分析统计 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-121"
source_prds: ["55-prd-系统公告管理"]
source_modules: []
---
# YV-09-121: 系统公告管理 — 定向公告、定时发布、模板管理、可关闭记忆与分析统计 — 测试规格

> 来源 PRD：[55-prd-系统公告管理.md](../../prds/2026-09/55-prd-系统公告管理.md)

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
| FR-1 | 当前公告管理现状 | IT | ✅ 已完成 |
| FR-2 | 公告类型 | IT | ✅ 已完成 |
| FR-3 | 根因分析矩阵 | IT | ✅ 已完成 |
| FR-4 | 改造前数据流 | IT | ✅ 已完成 |
| FR-5 | 公告生命周期 | IT | ✅ 已完成 |
| FR-6 | 定向规则引擎 | IT | ✅ 已完成 |
| FR-7 | 核心类型定义 | IT | ✅ 已完成 |
| FR-8 | 核心 Composable | IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 组件测试：GlobalBanner

#### Scenario: 多条公告轮播
- **Given** 3 条 active Banner 公告（非 critical）
- **When** 渲染 GlobalBanner
- **Then** 显示轮播控件（圆点指示器），默认显示第一条
- **And** 每 5 秒自动切换到下一条

#### Scenario: 用户关闭公告
- **Given** 一条可关闭的 info 公告
- **When** 用户点击关闭按钮 (x)
- **Then** 公告消失，出现"公告已关闭"的短暂提示
- **And** 调用 `dismiss` API 记录关闭状态
- **And** 该公告在 7 天内不再显示

#### Scenario: critical 公告强制展示
- **Given** 一条 critical 级别公告（dismissible=false）
- **When** 渲染公告
- **Then** 显示模态框，无关闭按钮
- **And** 只有"我已了解"确认按钮
- **And** 确认后记录已读但不消失（下次访问仍显示直到过期）

### 组件测试：TargetRuleEditor

#### Scenario: 按角色定向
- **Given** TargetRuleEditor 空白状态
- **When** 选择"按角色" → 勾选 "admin" 和 "pm"
- **Then** 生成的规则为 `{type: 'roles', roles: ['admin', 'pm']}`

#### Scenario: 组合规则
- **Given** TargetRuleEditor
- **When** 选择"组合规则" → 添加子规则"角色=pm" AND "项目=proj-001"
- **Then** 生成的规则为 `{type: 'composite', operator: 'and', rules: [...]}`

### 组件测试：AnnounceForm

#### Scenario: 创建定时发布公告
- **Given** 管理员填写标题、内容、选择"定时发布"、设置时间
- **When** 提交表单
- **Then** 公告状态为 scheduled，publish_at 为设置的时间
- **And** 列表显示该公告的定时状态

#### Scenario: 表单校验
- **Given** 管理员未填写标题
- **When** 提交表单
- **Then** 显示"标题为必填项"的错误提示
- **And** 公告未被创建

---

