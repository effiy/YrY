---

doc_type: module
prd_id: "PE-09-105"
title: "PE-09-105-dev: 项目健康摘要 — 开发方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: task
---

# PE-09-105-dev: 项目健康摘要 — 开发方案

## 改动清单

### 1. `chat/stores/services.ts` — 注入 DashboardService

```typescript
import type { ..., DashboardService } from '@/api/services';

let _dashboard: DashboardService;

export function injectServices(services: { ..., dashboard: DashboardService }) {
  _dashboard = services.dashboard;
}

export function getDashboard(): DashboardService { return _dashboard; }
```

### 2. `chat/components/ProjectHealthCard.vue` — 新建健康卡片

**检测逻辑**：
```typescript
const isOnProjectPage = computed(() => {
  const url = s.pageInfo?.url || '';
  return url.includes('localhost:8848') && url.includes('/project/');
});
```

**数据获取**：
```typescript
async function fetchSummary() {
  if (!isOnProjectPage.value) return;
  const dashboard = getDashboard();
  summary.value = await dashboard.getSummary();
  // {active_projects, total_issues, open_issues, open_bugs,
  //  today_done, overdue, blocked, projects: [...]}
}
```

**UI 结构**：
- header：图标 + "Project Health" + server_uptime
- 4 格统计（Issues 蓝/Bugs 红/Done 绿/Overdue 黄）
- 子项目列表（health 色彩点 + name + open_issues + open_bugs）

### 3. `chat/components/ChatWindow.vue` — 集成

```html
<StatsBar />
<ProjectHealthCard />  <!-- 仅在 /project/ 页面上显示 -->
```

### 4. `chat/index.ts` — 注入服务

```typescript
store.injectServices({
  ..., dashboard: api.dashboard,
});
```

### 5. 数据流

```
ProjectHealthCard (on YiVad /project/ page)
  → getDashboard().getSummary()
    → client.get('/dashboard/summary')
      → YiAi dashboard/summary endpoint
        → MongoDB aggregate (issues + bugs + sessions)
          ← {open_issues: 45, open_bugs: 12, today_done: 8, ...}
  → watch isOnProjectPage → auto-refresh on page navigation
  → render 4 stat cells + project list
```

## 验证步骤

1. 启动 YiAi + YiVad
2. 打开 YiVad 项目页（`localhost:8848/#/project/yivad`）
3. 打开 YiPet 聊天窗口
4. 确认显示 "Project Health" 卡片
5. 切换到其他页面（如百度），确认卡片消失