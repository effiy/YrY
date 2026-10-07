---

doc_type: task
prd_task_id: "YP-09-116"
title: "YP-09-116: chrome.storage 配额处理 — 技术实施计划"
status: planned
priority: P1
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "116-架构-chrome-storage配额处理.md"
tags: [storage, quota, reliability, planned]

type: task
---

# YP-09-116: chrome.storage 配额处理 — 技术实施计划

## 1. 实施步骤

### Phase 1: 配额检测 (0.5d)

新增 `src/shared/storage/quota.ts`：

```typescript
const WARN_THRESHOLD = 0.7;
const EVICT_THRESHOLD = 0.9;

export async function checkQuota(): Promise<{ pct: number; level: 'ok' | 'warn' | 'critical' }> {
  const used = await chrome.storage.local.getBytesInUse();
  const pct = used / chrome.storage.local.QUOTA_BYTES;
  const level = pct > EVICT_THRESHOLD ? 'critical' : pct > WARN_THRESHOLD ? 'warn' : 'ok';
  return { pct, level };
}
```

### Phase 2: IndexedDB 归档层 (1.0d)

```typescript
// src/shared/storage/archive.ts
export async function archiveSession(session: SessionItem): Promise<void> { ... }
export async function restoreSession(id: string): Promise<SessionItem | null> { ... }
export async function listArchivedSessions(): Promise<SessionItem[]> { ... }
```

### Phase 3: 集成 (0.5d)

在 `persistActive` 和 `_persistSetting` 中集成配额检查。

## 2. 验证

```bash
npm run typecheck && npm test && npm run build
```