---
doc_type: module
prd_task_id: "YP-09-101"
title: "项目概览活动模块优化 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "101-prd-项目概览活动模块优化.md"
related_tests: ["130-prd-test-项目概览活动模块优化"]
tags: [开发方案, 项目概览, 活动时间线, 内容预览, CSS修复]
category: 项目/管理后台/开发
source: 内部
type: task
---

# 项目概览活动模块优化 — 开发方案

> 来源 PRD：[101-prd-项目概览活动模块优化](../../prds/2026-09/101-prd-项目概览活动模块优化.md)

---

## 源码索引

| 文件 | 说明 | 变化 |
|------|------|------|
| `YiVad/src/styles/DetailOverview.scss` | 标题宽度 + 连接线修复 | ~6 行 |
| `YiVad/src/views/project/components/ActivityTimeline.vue` | 移除筛选 key 绑定 | 1 行 |
| `YiVad/src/views/project/composables/useActivityTimeline.ts` | 内容预览 + 回退链 | ~30 行 |

---

## 实现

### 1. CSS: 标题自适应宽度 (`DetailOverview.scss`)

**位置**：`.do-timeline-target` 选择器（第 420 行）

**Before:**
```scss
.do-timeline-target {
  max-width: 200px;  // 硬编码，宽屏浪费空间
  overflow: hidden;
  text-overflow: ellipsis;
  ...
}
```

**After:**
```scss
.do-timeline-target {
  flex: 1;           // 填充父 flex 容器剩余空间
  min-width: 0;      // flex 子元素中 text-overflow 生效的必要条件
  overflow: hidden;
  text-overflow: ellipsis;
  ...
}
```

**原理**：`.do-timeline-content` 已有 `flex: 1; min-width: 0`。其子元素 `.do-timeline-head` 为 flex row，`.do-timeline-target` 作为其中唯一的弹性项，设置 `flex: 1` 后自动吸收 badge/action/icon 之外的全部剩余空间。

### 2. CSS: 连接线溢出修复 (`DetailOverview.scss`)

**位置**：`.do-timeline-line` 选择器之后

```scss
.do-timeline-item--last .do-timeline-line {
  display: none;
}
```

**原理**：`v-if` 条件已覆盖模板层，此 CSS 规则作为双重保险，防止 `--last` class 误标或 edge case 下连接线溢出。

### 3. 模板: 筛选切换优化 (`ActivityTimeline.vue`)

**位置**：第 41 行 `.do-timeline` 容器

**Before:**
```vue
<div v-else-if="filteredActivity.length" class="do-timeline" :key="activityTypeFilter">
```

**After:**
```vue
<div v-else-if="filteredActivity.length" class="do-timeline">
```

**原理**：Vue 3 的 `v-for` 以 `:key="a.id"` 为稳定标识，`filteredActivity` 变化时通过 patch 算法高效增删 DOM 节点。`:key="activityTypeFilter"` 强制整个子树销毁重建，触发 `timeline-enter` CSS animation 重播，造成视觉闪烁。

### 4. 逻辑: 内容预览 — Issues

**位置**：`useActivityTimeline.ts` requirement builder（第 191 行）

```typescript
activity.push({
  // ... 现有字段
  contentPreview: cleanPreview(i.description || "")
});
```

`Issue.description` 类型为 `string | undefined`，`|| ""` 处理 undefined case。经 `cleanPreview` 清洗后输出 ≤ 150 字符的纯文本。

### 5. 逻辑: 内容预览 — Bugs

**位置**：`useActivityTimeline.ts` bug builder（第 211 行）

```typescript
activity.push({
  // ... 现有字段
  contentPreview: cleanPreview(b.description || "")
});
```

### 6. 逻辑: 文档预览回退链

**位置**：`useActivityTimeline.ts` composable 作用域内

**新增 `buildDocPreview` 辅助函数**：

```typescript
function buildDocPreview(meta?: Record<string, unknown>): string {
  if (!meta) return "";

  const desc = typeof meta.description === "string" && meta.description.trim();
  if (desc) return desc;

  if (Array.isArray(meta.acceptance_criteria) && meta.acceptance_criteria.length > 0) {
    const first = meta.acceptance_criteria[0];
    if (typeof first === "string" && first.trim()) return first;
  }

  const benefit = typeof meta.benefit === "string" && meta.benefit.trim();
  if (benefit) return benefit;

  return "";
}
```

**调用处修改**：
```typescript
// Before
contentPreview: cleanPreview((f.meta?.description as string) || "")

// After
contentPreview: cleanPreview(buildDocPreview(f.meta))
```

**类型安全**：每层回退均做 `typeof === "string"` 守卫。YAML 中的 `acceptance_criteria` 列表项可能为非 string 类型（如嵌套对象），`String()` 强制转换会产生 `[object Object]`，类型守卫可正确跳过。

### 7. 逻辑: `cleanPreview` 质量优化

**Before:**
```typescript
function cleanPreview(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/\n{2,}/g, " ")    // 所有换行 → 空格
    .replace(/\s+/g, " ")       // 所有空白 → 单空格
    .trim();                    // 无长度限制
}
```

**After:**
```typescript
function cleanPreview(text: string): string {
  if (!text) return "";
  const cleaned = text
    .replace(/<[^>]+>/g, "")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/\n{3,}/g, "\n\n")           // 3+ 换行 → 双换行
    .replace(/[^\S\n]+/g, " ")            // 非换行空白 → 单空格（保留 \n）
    .trim();
  return cleaned.length > 150
    ? cleaned.slice(0, 150).replace(/\s+\S*$/, "") + "…"
    : cleaned;
}
```

**改进点**：
- 保留段落结构：双换行 `\n\n` 不被挤压，2-line CSS clamp 仍正常截断
- 150 字符截断 + 末尾去半词：避免截断在单词中间
- `[^\S\n]` 替代 `\s`：匹配空格/制表符但保留 `\n`

---

## 实施进度

| 任务 | 状态 |
|------|------|
| CSS: 标题自适应宽度 | ✅ |
| CSS: 连接线溢出修复 | ✅ |
| 模板: 移除筛选 key 绑定 | ✅ |
| 逻辑: Issues 内容预览 | ✅ |
| 逻辑: Bugs 内容预览 | ✅ |
| 逻辑: 文档预览回退链 `buildDocPreview` | ✅ |
| 逻辑: `cleanPreview` 质量优化 | ✅ |
| `pnpm type:check` 通过 | ✅ |
| 文档: PRD + Dev + Test | ✅ |