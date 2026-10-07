---

doc_type: module
prd_id: "PE-09-108"
title: "PE-09-108-dev: 阅读时间估算 — 开发方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: task
---

# PE-09-108-dev: 阅读时间估算 — 开发方案

## 改动清单

### 1. `MessageBubble.vue` — 新增 computed

```typescript
const WORDS_PER_MIN = 200;
const readingTimeSecs = computed(() => {
  const words = props.message.content?.trim()
    ? props.message.content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil((words / WORDS_PER_MIN) * 60));
});
const showReadingTime = computed(() =>
  props.message.type === 'pet' && !props.message.streaming
  && readingTimeSecs.value >= 10
);
```

### 2. `MessageBubble.vue` — 模板

```html
<span v-if="showReadingTime" class="mb-read-time"
      title="Estimated reading time at 200 wpm">
  ~{{ readingTimeSecs }}s read
</span>
```

### 3. `bubble.scss` — 样式

```scss
.mb-read-time {
  padding: 0 4px; border-radius: 3px;
  color: var(--el-text-color-placeholder);
  border-left: 1px solid var(--el-border-color-lighter);
  margin-left: 2px; padding-left: 6px;
}
```

### 4. 效果

```
~320 tok  ↑+45  ~30s read
```