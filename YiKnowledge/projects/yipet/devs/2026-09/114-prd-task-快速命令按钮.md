---

doc_type: module
prd_id: "PE-09-114"
title: "PE-09-114-dev: 快速命令按钮 — 开发方案"
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

# PE-09-114-dev: 快速命令按钮 — 开发方案

## 改动

### QuickButtons.vue — 新增命令行

```typescript
const COMMANDS = [
  { cmd: '/stats', label: 'Stats', icon: '📊' },
  { cmd: '/sessions', label: 'Sessions', icon: '💬' },
  { cmd: '/help', label: 'Help', icon: '❓' },
];

function runCommand(cmd: string) {
  if (s.isProcessing) return;
  store.sendMessage?.(cmd);
}
```

模板新增第二行：
```html
<div v-if="s.messages.length === 0" class="qb-row qb-row--commands">
  <button v-for="c in COMMANDS" class="qb-chip qb-chip--cmd"
    @click="runCommand(c.cmd)">
    <span>{{ c.icon }}</span> <span>{{ c.cmd }}</span> <span>{{ c.label }}</span>
  </button>
</div>
```

CSS：`.qb-chip--cmd` 虚线边框区分于提示词按钮