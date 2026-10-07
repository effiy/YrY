---

doc_type: module
prd_id: "PE-09-111"
title: "PE-09-111-dev: /stats 命令 — 开发方案"
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

# PE-09-111-dev: /stats 命令 — 开发方案

## 改动

### `chat/stores/chat.ts` — sendMessage 新增命令分支

在 `/compact` 后插入 `/stats` 处理：

```typescript
if (content.startsWith('/stats')) {
  // 汇总 store 数据 → markdown 表格 → 推入 messages
  const statsMsg: Message = {
    type: 'pet',
    content: [
      '## Personal Stats',
      `| Sessions | ${state.sessions.length} (${todaySessions} today) |`,
      `| Total Messages | ${totalMsgs} |`,
      `| Knowledge Files | ${knowledgeCount} |`,
      ...
    ].join('\n'),
    timestamp: Date.now(),
  };
  state.messages.push(statsMsg);
  persistActive();
  return;
}
```

### /help 列表新增

```
| `/stats` | Show personal usage stats |
```