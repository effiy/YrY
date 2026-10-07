---

doc_type: module
prd_id: "PE-09-109"
title: "PE-09-109-dev: 总消息计数 — 开发方案"
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

# PE-09-109-dev: 总消息计数 — 开发方案

## 改动

### ChatSidebar.vue — computed + 模板 + CSS

```typescript
const totalMessageCount = computed(() =>
  s.sessions.reduce((sum, ses) => sum + (ses.messageCount || 0), 0)
);
```

```html
<span v-if="totalMessageCount" class="yipet-footer-msgs">
  · {{ totalMessageCount }} msg{{ totalMessageCount !== 1 ? 's' : '' }}
</span>
```

```scss
.yipet-footer-msgs { color: var(--el-color-primary); }
```

### 效果

```
5 sessions · 142 msgs · 2 favorites
```