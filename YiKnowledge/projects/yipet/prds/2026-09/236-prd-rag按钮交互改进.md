---
doc_type: prd
title: "YP-09-236: RAG 按钮交互改进 — 不可用状态下保持可操作性"
tags: [需求文档, 体验优化, 聊天窗口, RAG按钮, 交互改进, pointer-events]
category: 项目/浏览器扩展/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
implementation_progress: 全部完成（2 文件修改，CSS 精准拦截 + store 用户反馈）
implementation_updated: '2026-09-23'
priority: P1
project: YiPet
project_id: yipet
owner: Chengliang.Yi
prd_month: "202609"
related_dev: "236-prd-task-rag按钮交互改进.md"
related_test: "236-prd-test-rag按钮交互改进.md"
prd_task_id: YP-09-236
estimate_frontend: 0.25
review_status: 已评审
issue_type: 体验优化
roles: [product, engineer]
source_okr: [yipet-002]
related_modules: [236-prd-task-rag按钮交互改进]
related_tests: [236-prd-test-rag按钮交互改进]
---

# YP-09-236: RAG 按钮交互改进

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。

> 需求编号：YP-09-236 · 优先级：P1 · 人天：0.25d · 状态：已完成

实现方案见[开发方案](../../devs/2026-09/236-prd-task-rag按钮交互改进.md)，验证方式见[测试用例](../../tests/2026-09/236-prd-test-rag按钮交互改进.md)。

---

## 一、背景与动机

YiPet 聊天弹框工具栏中的 RAG 药丸按钮（`.ct-pill--rag`）在 RAG 索引未构建或不可用时，CSS 类 `.unavailable` 对**整个药丸**设置了 `pointer-events: none`，导致以下问题：

| # | 问题 | 影响 |
|---|------|------|
| 1 | RAG 索引未构建时，用户无法点击药丸的任何部分 | 无法打开设置弹框查看原因 |
| 2 | 齿轮按钮（设置入口）同样被禁用 | 用户无法通过 UI 了解"索引未构建"的状态信息 |
| 3 | 即使只是想查看 RAG 设置（不切换开关），也必须等索引构建完成 | 阻塞了正常的设置浏览流程 |
| 4 | 开关切换无用户反馈 | 用户尝试启用 RAG 但索引不可用时，没有任何提示说明原因 |

**设计原则**：不可用状态的视觉提示（opacity 降低）应保留，但**不应阻止用户访问设置弹框**或**了解不可用的原因**。仅主开关区域在不可用时应阻止操作，齿轮入口始终保持可交互。

---

## 二、现状与目标

### 2.1 改造前

- RAG 索引不可用时：整个 `.ct-pill--rag` 药丸 `pointer-events: none` + `opacity: 0.45`
- 齿轮设置按钮无法点击 → 用户无法打开 RAG 设置弹框
- `toggleRag()` 静默切换状态，无任何反馈

### 2.2 改造后

```
┌──────────────────────────────────┐
│  .ct-pill--rag.unavailable       │
│  ┌──────────────────┬──────────┐ │
│  │ .ct-pill--rag-main│  ⚙ Gear │ │
│  │ pointer-events:   │  ✅ 可点击│ │
│  │ none (仅此区域)    │          │ │
│  └──────────────────┴──────────┘ │
│  opacity: 0.45 (整颗药丸视觉提示)  │
└──────────────────────────────────┘
```

- 不可用时仅主开关区域 `.ct-pill--rag-main` 设置 `pointer-events: none`
- 齿轮按钮始终可点击 → 打开设置弹框查看"索引未构建"提示
- `toggleRag()` 在启用时若索引不可用，显示 warning 通知

---

## 三、用户故事

### US-1：作为用户，我希望 RAG 不可用时仍能查看设置

**作为** 使用 YiPet 聊天功能的用户
**我想要** 在 RAG 索引未构建时，仍能点击 RAG 药丸的齿轮按钮打开设置弹框
**以便于** 了解 RAG 的当前状态和不可用的原因

**验收标准（Given/When/Then）：**
- **Given** RAG 索引未构建（`ragStatus.built === false`）
- **When** 我点击 RAG 药丸右侧的齿轮图标
- **Then** 打开 RAG 设置弹框，显示"Knowledge index not built"提示

### US-2：作为用户，我尝试启用 RAG 时应收到反馈

**作为** 尝试使用 RAG 功能的用户
**我想要** 在索引未构建时尝试启用 RAG，收到明确的提示信息
**以便于** 知道为什么 RAG 可能不工作，以及需要做什么

**验收标准：**
- **Given** RAG 索引未构建
- **When** 我点击 RAG 药丸的主开关区域（或使用快捷键 Ctrl+Shift+R）
- **Then** 显示 warning 通知："RAG index not built — enable and ask, or build index from YiAi first"

---

## 四、功能需求

### FR-01: 精准的 pointer-events 拦截
- `.ct-pill--rag.unavailable` 仅设置 `opacity: 0.45`（视觉提示保留）
- 新增 `.ct-pill--rag.unavailable .ct-pill--rag-main { pointer-events: none }` 仅拦截主开关
- `.ct-pill--rag-gear` 不受影响，始终可点击

### FR-02: toggleRag 用户反馈
- 启用 RAG 时，若 `ragStatus` 已加载且索引不可用（`!built || num_docs === 0`），调用 `notify(msg, 'warning')`
- 通知消息清晰说明原因和建议操作

### FR-03: 键盘快捷键保持一致
- `Ctrl+Shift+R` 快捷键行为与点击主开关一致，不可用时同样触发 warning 通知

---

## 五、非功能需求

| ID | 要求 |
|----|------|
| NFR-01 | `vue-tsc --noEmit` 通过，无类型错误 |
| NFR-02 | 4 个 Rsbuild 入口全部构建成功 |
| NFR-03 | 不改动 RAG 药丸的视觉外观（仅交互行为变更） |
| NFR-04 | 不引入新的 UI 组件或依赖 |

---

## 六、验收标准

| AC | 描述 |
|----|------|
| AC-01 | RAG 索引不可用时，齿轮按钮可点击并打开设置弹框 |
| AC-02 | RAG 索引不可用时，主开关区域不可点击 |
| AC-03 | 启用 RAG 且索引不可用时，显示 warning 通知 |
| AC-04 | RAG 药丸不可用状态下保持 `opacity: 0.45` 视觉提示 |
| AC-05 | TypeScript 类型检查通过 |
| AC-06 | 构建 4/4 入口成功 |
| AC-07 | RAG 索引可用时，所有交互恢复正常（主开关 + 齿轮均可点击） |

---

## 七、涉及文件

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/chat/components/ChatToolbar/styles/toolbar.scss` | 修改 | 将 `pointer-events: none` 从 `.ct-pill--rag.unavailable` 移至其子选择器 `.ct-pill--rag-main` |
| `src/chat/stores/chat.ts` | 修改 | `toggleRag()` 增加索引不可用时的 warning 通知 |

---

## 八、风险与缓解

| 风险 | 概率 | 缓解 |
|------|------|------|
| 用户误以为 RAG 已启用但实际不可用 | 低 | 通知明确说明索引未构建 + 建议操作 |
| scoped CSS 子选择器不生效 | 低 | 父子组件在同一 SFC 内，scoped 属性选择器正常匹配 |

---

## 九、关联需求

- [YP-09-235: Context 按钮与文件预览弹框样式对齐](../235-体验优化-context按钮与文件预览弹框样式对齐.md)