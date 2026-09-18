---
doc_type: test
title: "主题系统与暗色模式 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
source_prds: ["09-prd-主题系统与暗色模式"]
source_modules: ["09-prd-task-主题系统与暗色模式"]
---

# 主题系统与暗色模式 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

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
| FR-1.1 | 参见 PRD | UT | ✅ 已完成 |
| FR-1.2 | 参见 PRD | UT | ✅ 已完成 |
| FR-1.3 | 参见 PRD | UT | ✅ 已完成 |
| FR-1.4 | 参见 PRD | UT | ✅ 已完成 |
| FR-1.5 | 参见 PRD | UT | ✅ 已完成 |
| FR-1 | 参见 PRD | UT | ✅ 已完成 |
| FR-2 | 参见 PRD | UT | ✅ 已完成 |





## 目录

- [一、测试分层](#sec-1)
- [二、测试用例](#sec-2)
- [三、追溯](#sec-3)
- [四、出口准则](#sec-4)

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/hooks/useTheme.ts` | 主题切换 hook | `YiVad/src/hooks/useTheme.ts` |
| `src/utils/chart/themes.ts` | 图表主题定义 | `YiVad/src/utils/chart/themes.ts` |
| `src/stores/chartTheme.ts` | 图表主题 store | `YiVad/src/stores/chartTheme.ts` |
| `src/styles/element-dark.scss` | 暗色模式样式 | `YiVad/src/styles/element-dark.scss` |
| `src/styles/theme/` | 主题样式目录 | `YiVad/src/styles/theme/` |
| `src/components/SwitchDark/` | 暗色切换组件 | `YiVad/src/components/SwitchDark/` |
| `src/layouts/components/ThemeDrawer/` | 主题抽屉 | `YiVad/src/layouts/components/ThemeDrawer/` |

---

## 覆盖矩阵

| 编号 | 用例 | 覆盖 FR | 优先级 | 自动化 |
|------|------|--------|--------|--------|
| TC-TH-001 | 亮/暗切换 | FR-9.1 | P0 | ✅ useTheme.test.ts |
| TC-TH-002 | 主题持久化 | FR-9.6 | P0 | ✅ useTheme.test.ts |
| TC-TH-003 | ECharts 4 套预设 | FR-9.3 | P0 | ✅ chart-themes.test.ts |
| TC-TH-004 | 自定义主题 CRUD | FR-9.5 | P1 | ✅ chartThemeStore.test.ts |
| TC-TH-005 | Mermaid 15 套主题 | FR-9.4 | P1 | ✅ mermaidThemes.test.ts |
| TC-TH-006 | 暗色默认 tokyo-night | FR-9.4 | P1 | ✅ mermaidThemes.test.ts |



<a id="sec-1"></a>
## 一、测试分层

| 层级 | 覆盖 |
|------|------|
| L1 单元 | CSS 变量切换逻辑 |
| L2 集成 | Pinia globalStore 主题状态 |
| L3 组件 | 主题切换按钮、暗色模式渲染 |

<a id="sec-2"></a>
## 二、测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-THEME-001 | 切换暗色模式 | `<html data-theme="dark">` 生效 | P0 |
| TC-THEME-002 | 刷新保持主题 | localStorage 持久化恢复 | P0 |
| TC-THEME-003 | 跟随系统 | prefers-color-scheme: dark → 自动暗色 | P1 |
| TC-THEME-004 | 预加载防闪烁 | index.html 内联脚本阻塞渲染 | P0 |

<a id="sec-3"></a>
## 三、追溯

| 需求 | 用例 |
|------|------|
| 暗色模式切换 | TC-THEME-001 |
| 主题持久化 | TC-THEME-002 |
| 自动跟随系统 | TC-THEME-003 |

<a id="sec-4"></a>
## 四、出口准则

- [ ] P0 用例 100% 通过
- [ ] 切换无闪烁 (FOUC)

---

## 执行状态

> 复核日期：2026-09-15

| 指标 | 值 |
|------|-----|
| 全局测试 | 67 文件 · 594 用例 · 100% 通过 |
| 本模块 Hook 测试 | 1 文件 · 已纳入 `pnpm test` |
| 本模块组件测试 | 0 文件 · 已纳入 `pnpm test` |
| 本模块工具测试 | 1 文件 · 已纳入 `pnpm test` |
| 执行命令 | `cd YiVad && pnpm test` |

