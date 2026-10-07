---

doc_type: module
prd_id: "PE-09-115"
title: "PE-09-115-dev: 自动刷新 — 开发方案"
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

# PE-09-115-dev: 自动刷新 — 开发方案

## 改动

### StatsBar.vue

```typescript
let _timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  _timer = setInterval(() => { checkServer(); }, 60000);
});
onUnmounted(() => {
  if (_timer) { clearInterval(_timer); _timer = null; }
});
```

## 验证

1. 打开聊天 → 绿点出现
2. 60s 后自动再次检测
3. 关闭聊天 → 定时器清理