---

doc_type: module
prd_id: "PE-09-116"
title: "PE-09-116-dev: 时间分组 — 开发方案"
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

# PE-09-116-dev: 时间分组 — 开发方案

## 改动

### ChatSidebar.vue — groupedSessions + 模板 + CSS

```typescript
const groupedSessions = computed(() => {
  const todayMs = new Date().setHours(0,0,0,0);
  const weekMs = todayMs - 7*86400000;
  const groups = [
    { group: 'Today', items: [] },
    { group: 'This Week', items: [] },
    { group: 'Older', items: [] },
  ];
  for (const ses of filteredSessions.value) {
    const ts = ses.updatedAt || ses.createdAt;
    if (ts >= todayMs) groups[0].items.push(ses);
    else if (ts >= weekMs) groups[1].items.push(ses);
    else groups[2].items.push(ses);
  }
  return groups.filter(g => g.items.length > 0);
});
```

模板改为嵌套循环：`v-for="g in groupedSessions"` → 分组头 → `v-for="ses in g.items"`