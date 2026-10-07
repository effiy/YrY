---

doc_type: module
prd_task_id: "YP-09-237"
title: "YP-09-237: RAG 按钮样式功能对齐 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: "2026-09-23"
updated: "2026-09-23"
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "237-体验优化-rag按钮样式功能对齐.md"
related_tests: ["237-prd-test-rag按钮样式功能对齐.md"]

type: task
---

# YP-09-237: RAG 按钮样式功能对齐 — 开发方案

> 来源 PRD：[237-体验优化-rag按钮样式功能对齐.md](../../prds/2026-09/237-体验优化-rag按钮样式功能对齐.md)
> 需求编号：YP-09-237 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 一、改动清单

### 1.1 ChatToolbar.vue — 组件逻辑 + 模板

**新增 `derivedScope` 计算属性**：

```ts
const derivedScope = computed(() => {
  const ctxPaths = props.contextFiles ?? [];
  if (!ctxPaths.length) return null;
  if (ctxPaths.length === 1) return { label: ctxPaths[0], count: 1 };
  const parts = ctxPaths.map(p => p.split('/'));
  const minLen = Math.min(...parts.map(p => p.length));
  const common: string[] = [];
  for (let i = 0; i < minLen; i++) {
    if (parts.every(p => p[i] === parts[0][i])) common.push(parts[0][i]);
    else break;
  }
  return { label: common.join('/') || 'mixed roles', count: ctxPaths.length };
});
```

逻辑与 YiVad `ChatToolbar/index.vue` 完全一致。从 `contextFiles` prop 计算公共路径前缀。

**新增派生范围栏**（RAG 弹出框内，`ragIndexAvailable` 条件块开头）：

```html
<div v-if="derivedScope" class="ct-rag-scope-bar">
  <span class="ct-rag-scope-bar-icon">ctx</span>
  <span class="ct-rag-scope-bar-label">{{ derivedScope.label }}</span>
  <span class="ct-rag-scope-bar-count">{{ derivedScope.count }} file(s)</span>
</div>
```

**新增 7 个 `el-tooltip` 信息圆圈**，为以下标签各添加 `<span class="ct-rag-info">?</span>`：

| 标签 | Tooltip 内容 |
|------|-------------|
| Chat Mode | "How conversation history is used for retrieval" |
| Fast Mode | "Skip retrieval entirely — direct LLM answer for speed" |
| Query Variants | "Number of query variations for fusion retrieval (1 = no expansion)" |
| Hybrid (BM25 + Vector) | "Combine keyword matching with semantic search for better recall" |
| Rerank (LLM) | "Cross-encoder re-ranks retrieved chunks for precision (~8 LLM calls)" |
| HyDE | "Generate hypothetical answer first to improve embedding match" |
| Inline Citations [N] | "Prefix chunks with [Source N] markers for traceable answers" |

**更新空状态消息**：

```html
Knowledge index not built. Run a build from the RAG dashboard or
use <code>python -m scripts.build_index</code> on the server.
```

### 1.2 global.scss — 弹出框样式对齐

| 样式类 | 修改前 | 修改后 |
|--------|--------|--------|
| `.el-popover.ct-rag-console-pop` | `padding: 12px 14px; border-radius: 10px` | `padding: 14px 16px; border-radius: 8px; box-shadow` |
| `.ct-rag-pop-head` | `padding: 0 2px 10px; margin-bottom: 10px` | `padding: 4px 0 12px; margin-bottom: 4px` |
| `.ct-rag-pop-title` | `gap: 6px` | `gap: 7px` |
| `.ct-rag-pop-docs` | 纯文本 | 胶囊徽章 (`padding: 2px 8px; border-radius: 999px`) |
| `.ct-rag-pop-section` | `margin-bottom: 6px` | `display: flex; flex-direction: column; gap: 2px; padding: 10px 0` |
| `.ct-rag-pop-section-title` | 无分隔线 | `::after` 伪元素横线 |
| `.ct-rag-row` | `padding: 3px 8px; margin: 1px -4px; border-radius: 6px` | `padding: 2px 6px; margin: 0 -6px; border-radius: 5px` |

**新增样式类**：

- `.ct-rag-info` — `14×14px` 圆形，hover 时边框+背景变主色
- `.ct-rag-scope-bar` — 绿色范围栏（`ctx` 徽章 + 路径 + 文件数），含子元素 `-icon`/`-label`/`-count`

## 二、设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| derivedScope 数据源 | 直接读 `contextFiles` prop | prop 已是去 `ctx:` 前缀的路径数组，无需穿透 store |
| 弹出框样式 | 全局 SCSS | popover teleport 到 body，scoped 无法穿透 |
| 分区标题分隔线 | `::after` 伪元素 | 纯 CSS，无额外 DOM，与 YiVad 一致 |
| 信息提示 | `el-tooltip` + 内联 `?` | 复用 Element Plus，无需新组件 |

## 三、验证

| 验证项 | 方法 | 结果 |
|--------|------|------|
| TypeScript 类型 | `vue-tsc --noEmit --skipLibCheck` | 通过 |
| 构建 | `npm run build` | 通过 (chat.js 1008.7 kB) |
| 视觉对齐 | 对比 YiVad `localhost:8848/#/ai-chat` 的 RAG 弹出框 | 一致 |