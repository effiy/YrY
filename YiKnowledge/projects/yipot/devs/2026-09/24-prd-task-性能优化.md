---

doc_type: module
prd_task_id: "YP-09-P01"
title: "性能优化 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "48-prd-翻译性能优化.md"

type: task
---

# 性能优化 — 开发方案

## LRU 翻译缓存

```javascript
class TranslationCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  getKey(text, from, to, serviceId) {
    return `${serviceId}:${from}:${to}:${text}`;
  }

  get(text, from, to, serviceId) {
    return this.cache.get(this.getKey(text, from, to, serviceId));
  }

  set(text, from, to, serviceId, result) {
    const key = this.getKey(text, from, to, serviceId);
    if (this.cache.size >= this.maxSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, { result, timestamp: Date.now() });
  }
}
```

## 窗口预创建

```rust
// window.rs — 窗口复用而非重建
match app_handle.get_window(label) {
    Some(existing) => {
        existing.set_focus().unwrap();  // 直接聚焦
        return (existing, true);
    }
    None => {
        // 创建新窗口
    }
}
```

## AbortController 清理

```javascript
const abortControllers = new Map();

async function translateWithAbort(text, service, signal) {
  const response = await fetch(url, { signal });
  return response.json();
}

// 窗口关闭时
window.addEventListener("close", () => {
  abortControllers.forEach(c => c.abort());
  abortControllers.clear();
});
```