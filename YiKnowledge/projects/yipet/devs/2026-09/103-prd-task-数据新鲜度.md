---

doc_type: module
prd_id: "PE-09-103"
title: "PE-09-103-dev: 数据新鲜度指示器 — 开发方案"
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

# PE-09-103-dev: 数据新鲜度指示器 — 开发方案

## 改动清单

### 1. `chat/types.ts` — ChatState 新增字段

```typescript
/** Timestamp of last successful session sync (Date.now()) */
lastSyncTime: number;
```

### 2. `chat/stores/chat.ts` — 初始化 + 设置时间戳

```typescript
// 初始状态
lastSyncTime: 0,

// 会话加载完成时
state.sessionsLoaded = true;
state.lastSyncTime = Date.now();
```

### 3. `chat/components/StatsBar.vue` — 新鲜度指示器

```typescript
const ageSeconds = computed(() =>
  s.lastSyncTime ? Math.floor((Date.now() - s.lastSyncTime) / 1000) : -1
);
const ageLabel = computed(() => {
  if (ageSeconds.value < 0) return '';
  if (ageSeconds.value < 5) return 'just now';
  if (ageSeconds.value < 60) return `${ageSeconds.value}s ago`;
  const m = Math.floor(ageSeconds.value / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
});
const isFresh = computed(() => ageSeconds.value >= 0 && ageSeconds.value < 60);
```

**UI 新增**：
```html
<div v-if="ageLabel" class="stats-bar__freshness" :class="{ 'is-fresh': isFresh }">
  <span class="stats-bar__pulse" :class="{ 'is-live': isFresh }" />
  <span class="stats-bar__age">{{ ageLabel }}</span>
  <el-button :icon="Refresh" size="small" text @click="refresh" />
</div>
```

**CSS 脉冲动画**（对齐 YiVad Home 页面）：
```scss
.stats-bar__pulse.is-live {
  background: var(--el-color-success);
  animation: sb-pulse 2s ease-in-out infinite;
}
@keyframes sb-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(103,194,58,0.4); }
  50% { box-shadow: 0 0 0 5px rgba(103,194,58,0); }
}
```

### 4. 数据流

```
Store.mount()
  → SessionService.list() → YiAi data_service.query_documents
    → sessions[] 加载完成
      → state.lastSyncTime = Date.now()
        → StatsBar.ageLabel 实时计算
          → < 60s: 绿点脉冲 "just now"
          → > 60s: 灰点 "2m ago"
```