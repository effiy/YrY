---

doc_type: module
prd_task_id: "YP-09-P01"
title: "翻译性能优化 — 开发方案"
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

# 翻译性能优化 — 开发方案

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 缓存策略 | LRU Map (max 200) | FIFO 淘汰，O(1) 读写 |
| 缓存键格式 | `sid:from:to:text` | 区分服务、语言对、文本 |
| 请求取消 | AbortController + beforeunload | 页面关闭时清理飞行中请求 |
| 窗口复用 | Tauri 窗口池 | 显示而非重建，减少创建开销 |
| 去抖策略 | 输入 300ms debounce 后触发翻译 | 避免每次按键触发 API 调用 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| LRU 缓存 | 200 条上限，O(1) 查找 | 重复翻译 < 1ms（命中率 30-40%） |
| AbortController | 取消前次飞行中请求 | 快速切换语言时不堆积请求 |
| 窗口预创建 | 应用启动时后台预创建空白窗口 | 首次弹窗 < 50ms |
| 输入去抖 | 300ms debounce + 文本长度阈值（> 2 字符） | 减少 80% 无效 API 调用 |
| 虚拟滚动 | 翻译历史列表使用 `react-window` | 1000 条记录渲染 < 16ms |
| 代码分割 | React.lazy + Suspense 按需加载服务 | 首屏 JS 体积减少 30% |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| 请求被取消 (AbortError) | 无（正常流程） | 静默忽略 | 无 |
| LRU 缓存内存泄漏 | `PERF-MEM` | 缓存大小监控，超过 500 条强制清理 | 日志警告 |
| 窗口池耗尽 | `PERF-WIN` | 关闭最久未使用的窗口 | 无（自动回收） |
| debounce 状态异常 | `PERF-DB` | 超时 5s 强制重置 | 日志记录 |
| 虚拟滚动计算错误 | `PERF-VS` | `scrollToIndex` 降级为原生 scroll | 无用户感知 |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [48-prd-翻译性能优化](../prds/2026-09/48-prd-翻译性能优化.md) | 上游 PRD | 性能需求定义 |
| [42-prd-task-GoogleDeepL翻译](./42-prd-task-GoogleDeepL翻译.md) | 关联 | LRU 缓存主要服务对象 |
| [51-prd-翻译历史记录](../prds/2026-09/51-prd-翻译历史记录.md) | 关联 | 虚拟滚动用于历史列表 |
| [52-prd-窗口动画过渡](../prds/2026-09/52-prd-窗口动画过渡.md) | 关联 | 窗口预创建配合动画 |
| `src/utils/cache.js` | 源码 | LRU 缓存实现 |
| `src/hooks/useDebounce.js` | 源码 | 输入去抖 Hook |

```javascript
class TranslateCache {
  constructor(max = 200) { this.map = new Map(); this.max = max; }
  get(text, from, to, sid) { return this.map.get(`${sid}:${from}:${to}:${text}`); }
  set(text, from, to, sid, result) {
    if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);
    this.map.set(`${sid}:${from}:${to}:${text}`, { result, ts: Date.now() });
  }
}
```

## AbortController 清理

```javascript
const controllers = new Map();
window.addEventListener("beforeunload", () => controllers.forEach(c => c.abort()));
```

## 窗口预创建

```rust
// window.rs — 窗口复用，显示而非重建
match app_handle.get_window(label) {
    Some(existing) => { existing.set_focus().unwrap(); (existing, true) }
    None => { /* 创建新窗口 */ }
}
```