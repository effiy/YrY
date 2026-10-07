---

doc_type: module
prd_id: "PE-09-118"
title: "PE-09-118-dev: /search 命令 — 开发方案"
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

# PE-09-118-dev: /search 命令 — 开发方案

## 改动清单

### 1. `api/endpoints.ts` — 新增端点
```typescript
SEARCH: '/knowledge-search',
```

### 2. `api/services/knowledge.ts` — 新增方法
```typescript
async search(query: string, category?: string) {
  return this.client.post(KNOWLEDGE.SEARCH, { query, category });
}
```

### 3. `chat/stores/chat.ts` — 命令处理
```typescript
if (content.startsWith('/search ')) {
  const q = content.slice(8).trim();
  const res = await knowledge.search(q);
  // render markdown table with results
}
```

### 4. 数据流
```
YiPet /search → knowledge.search(query)
  → POST /knowledge-search {query, category}
    → YiAi knowledge_search_route()
      → 全盘扫描 YiKnowledge/ + 内容 grep
      → 60s TTL 缓存
        ← {results: [{path, title, snippet}]}
  → 渲染 markdown 表格
```