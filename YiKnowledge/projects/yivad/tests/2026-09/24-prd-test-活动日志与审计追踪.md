---
doc_type: test
title: "活动日志与审计追踪 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
source_prds: ["24-prd-活动日志与审计追踪"]
source_modules: ["24-prd-task-活动日志与审计追踪"]
---

# 活动日志与审计追踪 — 测试用例

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
| FR-1 | 活动日志类型定义 | UT + CT + IT | ✅ 已完成 |
| FR-2 | 活动日志 API 服务 | IT | ✅ 已完成 |
| FR-3 | useActivityLog Composable | UT + CT + IT | ✅ 已完成 |
| FR-4 | DiffViewer 变更差异对比组件 | UT + CT + IT | ✅ 已完成 |
| FR-5 | ActivityTimeline 活动时间线组件 | UT + CT + IT | ✅ 已完成 |
| FR-6 | ActivityFilter 活动过滤器组件 | UT + CT + IT | ✅ 已完成 |





## 目录

- [一、测试分层](#sec-1)
- [二、测试用例](#sec-2)
- [三、出口准则](#sec-3)

---

<a id="sec-1"></a>
## 一、测试分层

| 层级 | 覆盖 |
|------|------|
| L1 单元 | 审计事件枚举 |
| L2 集成 | auditService API + ProTable 筛选 |
| L3 组件 | 日志列表 + 详情弹窗 |

<a id="sec-2"></a>
## 二、测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-AUDIT-001 | 日志列表渲染 | ProTable 正确展示审计记录 | P0 |
| TC-AUDIT-002 | 按操作类型筛选 | 仅显示选中类型的日志 | P0 |
| TC-AUDIT-003 | 时间范围筛选 | 仅显示范围内日志 | P1 |
| TC-AUDIT-004 | 详情弹窗 | 展示完整审计信息 | P1 |
| TC-AUDIT-005 | 操作创建后可见 | 创建文档→日志列表出现新记录 | P0 |

<a id="sec-3"></a>
## 三、出口准则

- [ ] P0 用例 100% 通过
- [ ] 5 种审计事件类型全覆盖