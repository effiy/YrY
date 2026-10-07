---

doc_type: module
prd_id: "PE-09-107"
title: "PE-09-107-dev: 服务器状态指示器 — 开发方案"
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

# PE-09-107-dev: 服务器状态指示器 — 开发方案

## 改动清单

### 1. `StatsBar.vue` — 新增服务检测

```typescript
import { getDashboard } from '../stores/services';

const serverOnline = ref<boolean | null>(null);
const serverUptime = ref(0);

async function checkServer() {
  try {
    const dashboard = getDashboard();
    if (!dashboard) return;
    const snap = await dashboard.getLiveSnapshot();
    serverOnline.value = true;
    serverUptime.value = snap.server_uptime || 0;
  } catch { serverOnline.value = false; }
}

onMounted(() => { checkServer(); });
```

### 2. `StatsBar.vue` — UI 显示

```html
<div v-if="serverOnline !== null" class="stats-bar__server"
     :title="serverOnline ? `YiAi up · ${serverUptime}h uptime` : 'YiAi unreachable'">
  <span class="stats-bar__server-dot" :class="{ 'is-online': serverOnline }" />
</div>
```

### 3. CSS

```scss
.stats-bar__server-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--el-color-danger); }
.stats-bar__server-dot.is-online { background: var(--el-color-success); box-shadow: 0 0 4px rgba(103,194,58,0.5); }
```

### 4. 数据流

```
StatsBar onMounted
  → checkServer()
    → getDashboard().getLiveSnapshot()
      → client.get('/dashboard/live-snapshot')
        → YiAi dashboard/live-snapshot endpoint
          ← {server_uptime: 48, ...} → serverOnline = true
          ← throw → serverOnline = false
    → 渲染绿点/红点
```

## 验证步骤

1. YiAi 运行时打开聊天窗口 → 绿点发光
2. 关闭 YiAi → 红点
3. Hover 绿点 → tooltip "YiAi up · 48h uptime"