---
doc_type: test
title: "YV-09-130: 用户会话管理 — 活跃会话查看、强制下线、会话超时配置、并发会话限制 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-130"
source_prds: ["60-prd-用户会话管理"]
source_modules: []
---
# YV-09-130: 用户会话管理 — 活跃会话查看、强制下线、会话超时配置、并发会话限制 — 测试规格

> 来源 PRD：[60-prd-用户会话管理.md](../../prds/2026-09/60-prd-用户会话管理.md)

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
| FR-1 | 当前会话管理现状 | CT + IT | ✅ 已完成 |
| FR-2 | 当前会话生命周期 | CT + IT | ✅ 已完成 |
| FR-3 | 根因矩阵 | CT + IT | ✅ 已完成 |
| FR-4 | 会话生命周期（目标） | CT + IT | ✅ 已完成 |
| FR-5 | 数据模型 | CT + IT | ✅ 已完成 |
| FR-6 | YiAi 后端 — SessionService | CT + IT | ✅ 已完成 |
| FR-7 | YiAi 后端 — Token 验证中间件增强 | CT + IT | ✅ 已完成 |
| FR-8 | YiVad 前端 — 会话管理页面 | CT + IT | ✅ 已完成 |
| FR-9 | YiVad 前端 — 会话配置组件 | CT + IT | ✅ 已完成 |
| FR-10 | 文件变更清单 | CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：管理员查看所有活跃会话

**GIVEN** 管理员已登录，系统中有 5 个活跃会话
**WHEN** 管理员访问 `/system/sessions` 页面
**THEN** 应显示 5 个会话，包含用户名、IP、设备、登录时间、最后活跃时间
**AND** 会话按最后活跃时间倒序排列
**AND** 顶部统计卡片显示活跃 5、闲置 0

### 场景 2：管理员强制下线指定会话

**GIVEN** 管理员在会话管理页面，用户张三有一个活跃会话
**WHEN** 管理员点击张三会话的"强制下线"按钮并确认
**THEN** 该会话状态变为 revoked
**AND** 张三的下一次请求返回 401 "Token 已被撤销"
**AND** session_activities 中记录一条 action=revoke 的日志

### 场景 3：并发会话限制 — 拒绝新登录

**GIVEN** 系统配置 max_concurrent=2，strategy=reject，用户李四已有 2 个活跃会话
**WHEN** 李四在第三台设备上尝试登录
**THEN** 登录请求返回错误 "并发会话数已达上限"
**AND** 不可创建第三个会话

### 场景 4：并发会话限制 — 踢出最旧会话

**GIVEN** 系统配置 max_concurrent=2，strategy=kick_oldest，用户王五已有 2 个活跃会话
**WHEN** 王五在第三台设备上登录
**THEN** 最旧的会话被撤销（Token 加入黑名单）
**AND** 新会话创建成功，王五在新设备登录成功
**AND** 旧设备的下一次请求返回 401

### 场景 5：会话超时自动过期

**GIVEN** 用户赵六在 08:00 登录，会话超时配置为 4 小时
**WHEN** 系统定时清理任务在 12:01 执行
**THEN** 赵六的会话状态变为 expired
**AND** 赵六的下一次请求返回 401 "Token 已过期"

### 场景 6：普通用户查看自己的会话

**GIVEN** 普通用户孙七已登录，有 2 个活跃会话
**WHEN** 孙七访问 `/user/my-sessions` 页面
**THEN** 仅显示孙七自己的 2 个会话
**AND** 不显示其他用户的会话
**AND** 可以下线自己的会话

---

