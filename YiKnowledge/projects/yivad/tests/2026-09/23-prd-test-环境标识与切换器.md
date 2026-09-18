---
doc_type: test
title: "环境标识与切换器 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-49"
source_prds: ["23-prd-环境标识与切换器"]
source_modules: []
---
# 环境标识与切换器 — 测试规格

> 来源 PRD：[23-prd-环境标识与切换器.md](../../prds/2026-09/23-prd-环境标识与切换器.md)

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
| FR-1 | 环境配置 | CT | ✅ 已完成 |
| FR-2 | 环境 Store | UT | ✅ 已完成 |
| FR-3 | 环境 Composable | UT | ✅ 已完成 |
| FR-4 | 环境标识徽章组件 | UT + CT | ✅ 已完成 |
| FR-5 | 环境切换器组件 | UT + CT | ✅ 已完成 |
| FR-6 | 生产环境危险操作警告对话框 | UT + CT | ✅ 已完成 |
| FR-7 | 页面标题工具 | UT + CT | ✅ 已完成 |
| FR-8 | 环境变量文件 | UT + CT | ✅ 已完成 |
| FR-9 | 全局布局集成 | UT + CT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 组件测试：EnvironmentBadge

#### Scenario: 开发环境显示横幅
- **GIVEN** 当前环境为 `dev`
- **WHEN** 挂载 EnvironmentBadge 组件
- **THEN** 渲染绿色横幅，显示"开发环境"和"当前非生产环境，数据可能被重置"

#### Scenario: 生产环境不显示横幅
- **GIVEN** 当前环境为 `prod`
- **WHEN** 挂载 EnvironmentBadge 组件
- **THEN** 组件不渲染任何内容

### 组件测试：EnvironmentSwitcher

#### Scenario: 管理员切换环境
- **GIVEN** 当前用户为管理员，当前环境为 `dev`
- **WHEN** 点击环境切换器，选择 `staging`
- **THEN** localStorage 存储 "staging"，页面刷新

#### Scenario: 普通用户不可切换环境
- **GIVEN** 当前用户为普通用户
- **WHEN** 查看环境切换器
- **THEN** 仅显示当前环境，无下拉选项

### 组件测试：ProdWarningDialog

#### Scenario: 生产环境操作确认
- **GIVEN** 当前环境为 `prod`，操作为"删除项目"
- **WHEN** 调用 `open()` 并输入 "CONFIRM" 点击确认
- **THEN** Promise resolve 为 `true`

#### Scenario: 输入错误取消操作
- **GIVEN** 当前环境为 `prod`，操作为"删除项目"
- **WHEN** 调用 `open()` 并输入 "confirm"（小写）点击确认
- **THEN** 确认按钮仍为禁用状态

### Composable 测试：useEnvironment

#### Scenario: 页面标题更新
- **GIVEN** 当前环境为 `dev`
- **WHEN** 调用 `useEnvironment()`
- **THEN** `document.title` 以 `[DEV]` 开头

---

