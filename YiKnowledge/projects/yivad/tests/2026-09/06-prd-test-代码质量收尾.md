---
doc_type: test
title: "代码质量收尾 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
source_prds: ["06-prd-代码质量收尾"]
source_modules: ["06-prd-task-代码质量收尾"]
---

# 代码质量收尾 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---


## 目录

- [一、测试策略](#sec-1)
- [二、测试用例](#sec-2)
- [三、出口准则](#sec-3)

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


## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/hooks/useCodeHealth.ts` | 代码健康检查 hook | `YiVad/src/hooks/useCodeHealth.ts` |

---

## 覆盖矩阵

| 编号 | 用例 | 覆盖 FR | 优先级 | 自动化 |
|------|------|--------|--------|--------|
| TC-CQ-001 | ESLint 零错误 | 代码质量 | P0 | ⬜ 人工检查 |
| TC-CQ-002 | vue-tsc 零错误 | 类型安全 | P0 | ⬜ AI 检查 |
| TC-CQ-003 | console.log 清理 | 代码质量 | P1 | ⬜ grep 检查 |
| TC-CQ-004 | getLevel 阈值判断 | 代码健康 | P0 | ✅ useCodeHealth.test.ts |
| TC-CQ-005 | fmtPct 格式化 | 代码健康 | P1 | ✅ useCodeHealth.test.ts |





## 单元测试规格

### UT-CQ `useCodeHealth`（P1·9用例）

| # | 用例 | 预期 |
|---|------|------|
| 1 | getLevel 正常指标 — 低于warn为good | getLevel(5, [10,20]) → "good" |
| 2 | getLevel 正常指标 — warn到danger间为warn | getLevel(15, [10,20]) → "warn" |
| 3 | getLevel 正常指标 — 超过danger为danger | getLevel(25, [10,20]) → "danger" |
| 4 | getLevel 反转指标 — 高于warn为good | getLevel(0.9, [0.7,0.5], true) → "good" |
| 5 | getLevel 反转指标 — warn到danger间为warn | getLevel(0.6, [0.7,0.5], true) → "warn" |
| 6 | getLevel 反转指标 — 低于danger为danger | getLevel(0.4, [0.7,0.5], true) → "danger" |
| 7 | fmtPct 格式化百分比 | fmtPct(0.856) → "85.6%" |
| 8 | fmtPct 格式化0 | fmtPct(0) → "0.0%" |
| 9 | fmtPct 格式化1 | fmtPct(1) → "100.0%" |

<a id="sec-1"></a>
## 一、测试策略

| 检查项 | 工具 | 目标 |
|--------|------|------|
| 类型检查 | vue-tsc --noEmit | 零错误 |
| Lint | ESLint + Stylelint | 零错误 |
| 未使用导入 | ESLint no-unused-vars | 零警告 |
| console.log | ESLint no-console | 零残留 |

<a id="sec-2"></a>
## 二、测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CQ-001 | vue-tsc 通过 | 退出码 0 | P0 |
| TC-CQ-002 | ESLint 零错误 | `pnpm lint` 退出码 0 | P0 |
| TC-CQ-003 | 无 console.log | `rg "console.log" src/` 零结果 | P1 |
| TC-CQ-004 | 无未使用导入 | `rg "unused-imports"` 零结果 | P1 |

<a id="sec-3"></a>
## 三、出口准则

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm lint` 通过

---

## 执行状态

> 复核日期：2026-09-15

| 指标 | 值 |
|------|-----|
| 全局测试 | 78 文件 · 680 用例 · 100% 通过 |
| 本模块 Hook 测试 | 1 文件 · 9 用例 · 全部通过 · 已纳入 `pnpm test` |
| 本模块组件测试 | 0 文件 · 已纳入 `pnpm test` |
| 本模块工具测试 | 0 文件 · 已纳入 `pnpm test` |
| 执行命令 | `cd YiVad && pnpm test` |

