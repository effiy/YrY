---
doc_type: test
title: "YV-09-106: 用户角色与权限矩阵 — 权限矩阵可视化、角色-权限网格、角色对比视图、权限继承可视化、有效权限计算器、权限审计日志 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-106"
source_prds: ["50-prd-用户角色与权限矩阵"]
source_modules: []
---
# YV-09-106: 用户角色与权限矩阵 — 权限矩阵可视化、角色-权限网格、角色对比视图、权限继承可视化、有效权限计算器、权限审计日志 — 测试规格

> 来源 PRD：[50-prd-用户角色与权限矩阵.md](../../prds/2026-09/50-prd-用户角色与权限矩阵.md)

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
| FR-1 | 当前权限管理能力 | CT + IT | ✅ 已完成 |
| FR-2 | 管理员权限分析工作流（现状 vs 目标） | CT + IT | ✅ 已完成 |
| FR-3 | 根因矩阵 | CT + IT | ✅ 已完成 |
| FR-4 | 有效权限计算流程 | CT + IT | ✅ 已完成 |
| FR-5 | 权限矩阵类型定义 | CT + IT | ✅ 已完成 |
| FR-6 | 权限矩阵组件 | CT + IT | ✅ 已完成 |
| FR-7 | 后端权限服务 | CT + IT | ✅ 已完成 |
| FR-8 | 文件变更清单 | CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：权限矩阵渲染

**GIVEN** 系统有 5 个角色和 20 个权限
**WHEN** 打开权限矩阵页面（按角色查看）
**THEN** 渲染 5 行 x 20 列的网格表
**AND** 每个单元格显示正确的权限状态（✓/○/—）
**AND** 行悬停时高亮整行
**AND** 列悬停时高亮整列

### 场景 2：权限继承展开

**GIVEN** 权限树定义：`user:write` → `user:read`，`user:delete` → `user:read`
**WHEN** 角色 A 拥有 `user:write`（无 `user:read`）
**THEN** 有效权限计算显示：直接 = [`user:write`]，继承 = [`user:read`]
**AND** `user:read` 单元格显示为"继承获得"（○）

### 场景 3：多角色有效权限

**GIVEN** 用户拥有 2 个角色：角色 A 有 `user:read`、角色 B 有 `user:write`
**WHEN** 在有效权限计算器中查询该用户
**THEN** 有效权限 = [`user:read`, `user:write`]（并集）
**AND** `user:read` 来源 = [`角色A`]
**AND** `user:write` 来源 = [`角色B`]

### 场景 4：角色对比

**GIVEN** 角色 Admin: [`user:*`, `project:*`]，角色 Editor: [`project:read`, `project:write`, `content:*`]
**WHEN** 对比 Admin 和 Editor
**THEN** Venn 图显示重叠度为约 20%
**AND** 差异列表显示 "Admin 有 Editor 没有: [`user:*`]"
**AND** "Editor 有 Admin 没有: [`content:*`]"
**AND** "两者都有: [`project:read`, `project:write`]"

### 场景 5：权限审计日志

**GIVEN** 管理员授予用户 Bob "Editor" 角色，原因为 "需要管理内容"
**WHEN** 查看审计日志
**THEN** 日志条目显示：操作人=管理员、目标用户=Bob、操作=授予角色、角色=Editor、原因="需要管理内容"、时间戳正确
**AND** 按用户筛选只看到 Bob 的相关日志

### 场景 6：角色重叠度热力图

**GIVEN** 5 个角色的权限矩阵
**WHEN** 查看角色重叠度图表
**THEN** 展示 5x5 热力图，对角线为 100%
**AND** 任何两个角色的重叠度值显示在对应的 (i, j) 单元格
**AND** 颜色从绿（100%）到红（0%）渐变

---

