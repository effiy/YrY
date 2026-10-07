---

doc_type: module
prd_id: "YP-09-117"
title: "YP-09-117: Chat Store 模块化拆分 — 单一 1700 行 Store 拆分为领域 Store"
status: planned
priority: P2
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
tags: [architecture, refactoring, store, planned]
related_tasks: ["117-prd-task-ChatStore拆分.md"]
related_tests: ["117-prd-test-ChatStore拆分.md"]
related_modules: ["chat/stores/chat.ts"]

type: 需求
---

# YP-09-117: Chat Store 模块化拆分

> **PRD 版本**：v1.0 · **状态**：planned（待排期）

---

## 1. 背景

`src/chat/stores/chat.ts` 是 YiPet 最大的单文件——约 1700 行，集成了会话管理、流式编排、窗口管理、知识库/RAG、缺陷报告、上下文文件、提示词历史等全部聊天功能。虽然部分逻辑已提取到子 Store（streaming、toolEvents、contextFiles、watchSync、windowManager），但主 Store 仍是"上帝对象"。

## 2. 现状分析

```
chat/stores/
├── chat.ts          1700行 ← 目标拆分
├── streaming.ts      77行 ✓
├── toolEvents.ts     34行 ✓
├── contextFiles.ts  227行 ✓
├── watchSync.ts      27行 ✓
├── windowManager.ts 128行 ✓
├── chatUtils.ts     232行 ✓
├── chatExport.ts    116行 ✓
└── services.ts       53行 ✓
```

### 按领域分布（chat.ts 内）

| 领域 | 行数 | 功能 |
|------|------|------|
| 会话管理 | ~300 | CRUD、收藏、搜索、批量 |
| 流式编排 | ~200 | sendMessage、_runStream、stopSending |
| 窗口管理 | ~100 | 拖拽、调整大小、全屏 |
| 知识库/RAG | ~250 | 树加载、状态、范围、来源 |
| 上下文文件 | ~100 | 页面上下文、知识文件 |
| 缺陷报告 | ~200 | 表单草稿、提交 |
| 颜色/角色 | ~100 | setColorIndex、setRole |
| 提示词历史 | ~80 | push、recall、remove |
| 持久化 | ~100 | _persistSetting、_loadPersistedState、persistActive |
| 挂载/生命周期 | ~70 | mount、_onTabHidden、_onTabVisible |

## 3. 目标架构

```
chat/stores/
├── chat.ts               ~300行  核心编排（仅保留 sendMessage + _runStream + mount）
├── sessionStore.ts       ~200行  会话 CRUD + 搜索
├── ragStore.ts           ~200行  知识库/RAG 状态 + 操作
├── bugReportStore.ts     ~150行  缺陷报告表单
├── persistenceStore.ts   ~120行  持久化（_persistSetting + persistActive）
├── streaming.ts           77行  (不变)
├── toolEvents.ts          34行  (不变)
├── contextFiles.ts       227行  (不变)
├── windowManager.ts      128行  (不变)
├── chatUtils.ts          232行  (不变)
├── chatExport.ts         116行  (不变)
└── services.ts            53行  (不变)
```

## 4. 成功标准

| 指标 | 目标 |
|------|------|
| chat.ts 行数 | <400 |
| 子 Store 独立性 | 每个可独立进行单元测试 |
| 类型检查 | 0 error |
| 回归测试 | 138/138，新增子 Store 单元测试 |
| API 兼容 | `useChatStore().sendMessage()` 签名不变 |

## 5. 工作量

| 阶段 | 工作量 | 内容 |
|------|--------|------|
| sessionStore 提取 | 0.5d | 会话 CRUD → 独立 Store |
| ragStore 提取 | 0.5d | 知识库/RAG → 独立 Store |
| bugReportStore 提取 | 0.5d | 缺陷报告 → 独立 Store |
| persistenceStore 提取 | 0.5d | 持久化逻辑 → 独立 Store |
| 集成测试 | 0.5d | 跨 Store 交互测试 |
| **总计** | **2.5d** | |

## 6. 风险

| 风险 | 缓解 |
|------|------|
| 跨 Store 循环依赖 | 使用 `services.ts` 模式——共享引用通过注入而非直接导入 |
| 拆分引入时序 bug | `watch` 同步已在现有结构中验证，逐 Store 提取 + 测试 |
| 公共 API 破坏 | 主 Store 返回对象保持相同形状，子 Store 通过 getter 代理 |