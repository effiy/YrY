---

doc_type: task
prd_task_id: "YP-09-117"
title: "YP-09-117: Chat Store 模块化拆分 — 技术实施计划"
status: planned
priority: P2
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.5
source_prd: "117-架构-ChatStore模块化拆分.md"
tags: [architecture, refactoring, store, planned]

type: task
---

# YP-09-117: Chat Store 模块化拆分 — 技术实施计划

## 1. 实施步骤

### Phase 1: sessionStore (0.5d)

提取内容：`_loadSessions`, `_findOrCreateSession`, `selectSession`, `createSession`, `deleteSession`, `toggleFavorite`, `renameSession`, `_resortSessions`, `_loadSessionMessages`, `_extractMessages`

### Phase 2: ragStore (0.5d)

提取内容：`loadKnowledgeTree`, `loadRagStatus`, `toggleRag`, `setRagScope`, `clearRagScope`, `previewRagSources`, `openKnowledgePreview`, `closeKnowledgePreview`, `rebuildRagIndex`

### Phase 3: bugReportStore (0.5d)

提取内容：`openBugReport`, `closeBugReport`, `setBugReportDraft`, `confirmBugReport`

### Phase 4: persistenceStore (0.5d)

提取内容：`_persistSetting`, `_loadPersistedState`, `persistActive`, `_persistTimers`

### Phase 5: 集成 + 测试 (0.5d)

主 Store 通过 getter 代理子 Store 的公共 API：

```typescript
export const useChatStore = defineStore('chat', () => {
  const sessions = useSessionStore();
  const rag = useRagStore();
  const bugReport = useBugReportStore();
  const persistence = usePersistenceStore();

  return {
    // 保持向后兼容
    selectSession: sessions.selectSession,
    createSession: sessions.createSession,
    loadKnowledgeTree: rag.loadKnowledgeTree,
    // ...
  };
});
```

## 2. 验证

```bash
npm run typecheck && npm test && npm run build
```