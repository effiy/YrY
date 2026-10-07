---

doc_type: module
prd_id: "PE-09-113"
title: "PE-09-113-dev: /sessions 命令 — 开发方案"
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

# PE-09-113-dev: /sessions 命令 — 开发方案

## 改动

### chat/stores/chat.ts — sendMessage 新增分支

```typescript
if (content.startsWith('/sessions')) {
  const recent = [...state.sessions]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 10);
  const rows = recent.map((s, i) => {
    // project from project: tag, age from updatedAt, active marker
  });
  // push markdown table as pet message
}
```

### /help 列表新增

```
| `/sessions` | List recent sessions |
```