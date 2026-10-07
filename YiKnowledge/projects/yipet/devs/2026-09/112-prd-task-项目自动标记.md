---

doc_type: module
prd_id: "PE-09-112"
title: "PE-09-112-dev: 项目自动标记 — 开发方案"
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

# PE-09-112-dev: 项目自动标记 — 开发方案

## 改动

### chat/stores/chat.ts — detectProject + 标签增强

```typescript
function detectProject(url: string): string {
  if (url.includes('localhost:8848') || url.includes('yivad')) return 'YiVad';
  if (url.includes('localhost:10086') || url.includes('yiai')) return 'YiAi';
  if (url.includes('yipet://')) return 'YiPet';
  if (url.includes('github.com')) return 'GitHub';
  return '';
}
```

会话创建时：
```typescript
const project = detectProject(url);
const tags = ['source:YiPet', `from:${url}`];
if (project) tags.push(`project:${project}`);
```

createEmptySession 时：
```typescript
const project = detectProject(state.pageInfo?.url || '');
const tags = ['source:YiPet'];
if (project) tags.push(`project:${project}`);
```

### 效果

在 YiVad 页面创建会话 → tags: `["source:YiPet", "from:...", "project:YiVad"]`