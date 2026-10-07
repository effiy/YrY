---

doc_type: module
prd_task_id: "YP-09-S23"
title: "并行调度 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "34-prd-并行调度策略.md"

type: task
---

# 并行调度 — 开发方案

## 核心实现

`YiPot/src/window/Translate/index.jsx`

### withTimeout 包装

```javascript
function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    )
  ]).finally(() => clearTimeout(timeout));
}
```

### 并行调度器

```javascript
async function translateAll(text, from, to) {
  const services = getEnabledServices("translate")
    .sort((a, b) => a.config.order - b.config.order);

  const startTimes = new Map();

  const results = await Promise.allSettled(
    services.map(async (s) => {
      startTimes.set(s.info.id, Date.now());
      const result = await withTimeout(
        s.translate(text, from, to, s.config),
        10000
      );
      return {
        ...result,
        elapsed: Date.now() - startTimes.get(s.info.id),
        serviceId: s.info.id,
        serviceName: s.info.name
      };
    })
  );

  return results.map((r, i) => ({
    service: services[i].info,
    status: r.status,
    data: r.status === "fulfilled" ? r.value : null,
    error: r.status === "rejected" ? classifyError(r.reason) : null
  }));
}
```

### 错误分类

```javascript
function classifyError(error) {
  if (error.message === "TIMEOUT") return { type: "timeout", message: "请求超时" };
  if (error.status === 401 || error.status === 403) return { type: "auth", message: "认证失败" };
  if (error.status === 429) return { type: "quota", message: "配额已用完" };
  return { type: "unknown", message: error.message };
}
```