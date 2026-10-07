---

doc_type: module
prd_id: "PE-09-110"
title: "PE-09-110-dev: 会话陈旧标记 — 开发方案"
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

# PE-09-110-dev: 会话陈旧标记 — 开发方案

## 改动

### SessionListItem.vue — computed + 模板 + CSS

```typescript
const isStale = computed(() => {
  const ts = props.session.updatedAt || props.session.createdAt;
  if (!ts) return false;
  return (Date.now() - ts) / 86400000 > 7;
});
```

```html
<span v-if="isStale" class="yipet-session-stale"
      title="Not updated in 7+ days">stale</span>
```

```scss
.yipet-session-stale {
  font-size: 9px; font-weight: 600; padding: 1px 4px; border-radius: 3px;
  color: var(--el-color-warning); background: var(--el-color-warning-light-9);
}
```

### 效果

```
📄 CR YiVad bug fix    3w ago stale
```