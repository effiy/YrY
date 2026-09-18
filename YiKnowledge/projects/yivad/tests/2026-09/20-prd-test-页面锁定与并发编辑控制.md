---
doc_type: test
title: "页面锁定与并发编辑控制 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
source_prds: ["20-prd-页面锁定与并发编辑控制"]
source_modules: ["20-prd-task-页面锁定与并发编辑控制"]
---

# 页面锁定与并发编辑控制 — 测试用例

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
| FR-1 | 锁定状态类型定义 | UT + CT + IT | ✅ 已完成 |
| FR-2 | 锁定 API 客户端 | CT + IT | ✅ 已完成 |
| FR-3 | useEditLock Composable | UT + CT + IT | ✅ 已完成 |
| FR-4 | 锁心跳 Hook | UT + CT + IT | ✅ 已完成 |
| FR-5 | 并发编辑检测 Hook | UT + CT + IT | ✅ 已完成 |
| FR-6 | LockIndicator 锁定指示器组件 | UT + CT + IT | ✅ 已完成 |
| FR-7 | ConflictResolver 冲突解决组件 | UT + CT + IT | ✅ 已完成 |
| FR-8 | WebSocket 锁定状态监听 | CT + IT | ✅ 已完成 |





## 目录

- [一、测试策略](#sec-1)
- [二、测试用例](#sec-2)
- [三、出口准则](#sec-3)

---

<a id="sec-1"></a>
## 一、测试策略

| 测试类型 | 场景 |
|---------|------|
| 乐观锁 | 同一文档被两人同时编辑→后者保存时冲突提示 |
| 悲观锁 | 进入编辑→锁定→另一用户看到锁定状态 |

<a id="sec-2"></a>
## 二、测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-LOCK-001 | 乐观锁冲突检测 | version 不匹配→提示刷新 | P0 |
| TC-LOCK-002 | 乐观锁正常保存 | version 匹配→保存成功 | P0 |
| TC-LOCK-003 | 悲观锁获取 | 进入编辑→文档锁定 | P1 |
| TC-LOCK-004 | 离开释放锁 | 离开页面→锁释放 | P1 |

<a id="sec-3"></a>
## 三、出口准则

- [ ] P0 用例 100% 通过
- [ ] 并发编辑不丢数据