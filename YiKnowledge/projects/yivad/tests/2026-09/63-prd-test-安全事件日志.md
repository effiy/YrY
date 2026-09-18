---
doc_type: test
title: "YV-09-133: 安全事件日志 — 登录失败/密码修改/权限变更/API 密钥使用记录、严重度分级、实时告警、安全仪表盘 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-133"
source_prds: ["63-prd-安全事件日志"]
source_modules: []
---
# YV-09-133: 安全事件日志 — 登录失败/密码修改/权限变更/API 密钥使用记录、严重度分级、实时告警、安全仪表盘 — 测试规格

> 来源 PRD：[63-prd-安全事件日志.md](../../prds/2026-09/63-prd-安全事件日志.md)

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
| FR-1 | 当前安全事件记录现状 | IT | ✅ 已完成 |
| FR-2 | 安全事件生命周期 | IT | ✅ 已完成 |
| FR-3 | 根因矩阵 | IT | ✅ 已完成 |
| FR-4 | 数据模型 | IT | ✅ 已完成 |
| FR-5 | YiAi 后端 — SecurityEventService | IT | ✅ 已完成 |
| FR-6 | 暴力破解检测 | IT | ✅ 已完成 |
| FR-7 | YiVad 前端 — 安全仪表盘 | IT | ✅ 已完成 |
| FR-8 | 文件变更清单 | IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：记录登录失败安全事件

**GIVEN** 用户尝试登录但密码错误
**WHEN** 登录请求返回 401
**THEN** `security_events` 集合中插入一条 login_failure 事件
**AND** severity 为 medium
**AND** 事件包含 actor（IP + User-Agent）和 details（失败原因）

### 场景 2：检测暴力破解

**GIVEN** 同一 IP 在 5 分钟内登录失败 10 次
**WHEN** 第 10 次登录失败
**THEN** 记录一条 login_failure_brute 事件
**AND** severity 为 critical
**AND** 触发企业微信实时告警
**AND** 前端安全仪表盘显示未确认 critical 事件数 +1

### 场景 3：记录权限变更事件

**GIVEN** 管理员将用户张三的角色从"普通用户"提升为"管理员"
**WHEN** 权限变更操作成功
**THEN** 记录一条 admin_privilege_esc 事件
**AND** severity 为 critical
**AND** target 包含被操作用户信息

### 场景 4：查询安全事件

**GIVEN** 系统中有 100 条安全事件
**WHEN** 管理员访问安全事件列表，筛选 severity=critical，时间范围=近 7 天
**THEN** 显示匹配的 critical 事件列表
**AND** 列表包含时间、类型、严重度、操作人、目标、详情
**AND** 支持分页

### 场景 5：安全仪表盘数据聚合

**GIVEN** 近 7 天有 50 条安全事件
**WHEN** 管理员访问安全仪表盘
**THEN** 显示按严重度分布（critical: 3, high: 8, medium: 25, low: 14）
**AND** 显示事件类型 Top 10
**AND** 显示每日趋势折线图
**AND** 显示未确认 critical 事件数

### 场景 6：管理员确认安全事件

**GIVEN** 有一条未确认的 critical 安全事件
**WHEN** 管理员点击"确认"按钮
**THEN** 事件 acknowledged 变为 true
**AND** 记录确认人 username 和确认时间
**AND** 未确认 critical 事件计数 -1

---

