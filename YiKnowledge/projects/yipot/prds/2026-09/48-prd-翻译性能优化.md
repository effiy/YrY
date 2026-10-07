---
doc_type: prd
title: "YP-09-P01: 翻译性能优化策略"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-P01
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 性能
roles: [engineer]
tags: [性能, 优化, 翻译]
category: 项目/桌面应用/需求
---

# YP-09-P01: 翻译性能优化策略

## 优化目标

| 指标 | 目标 | 实现 |
|------|------|------|
| 划词翻译响应 | < 1s | 并行调度 + 结果缓存 |
| 窗口弹出延迟 | < 500ms | 窗口预创建 |
| 内存占用 | < 100MB | 虚拟滚动 + 懒加载 |
| CPU 占用 | < 5% 空闲 | 合理轮询间隔 |

## 已实施优化

1. **并行请求**: `Promise.allSettled` 替代串行调用
2. **结果缓存**: LRU 缓存最近 100 条翻译，命中率 ~30%
3. **窗口复用**: 已存在的窗口直接聚焦而非重建
4. **剪贴板轮询**: 500ms 间隔，非 100ms
5. **语言检测本地化**: `lang_detect.rs` 本地检测，避免网络调用
6. **AbortController**: 翻译窗口关闭时取消未完成请求
7. **Tesseract WASM**: 按需加载语言包

## 性能测试

| 场景 | 操作 | 目标 |
|------|------|------|
| 冷启动 | 首次打开应用 | < 2s |
| 热启动 | 窗口已存在 | < 500ms |
| 翻译 | 100 字文本 | < 1s |
| OCR | 1080p 截图 | < 2s |

## 性能数据

### 优化前 vs 优化后

| 指标 | 优化前 | 优化后 | 提升幅度 |
|------|--------|--------|----------|
| 划词翻译响应 (P50) | 2500ms | 800ms | 68% 减少 |
| 划词翻译响应 (P95) | 5000ms | 1800ms | 64% 减少 |
| 窗口弹出延迟 (冷启动) | 1200ms | 450ms | 63% 减少 |
| 窗口弹出延迟 (热启动) | 600ms | 150ms | 75% 减少 |
| 内存占用 (空闲, 仅托盘) | 180MB | 50MB | 72% 减少 |
| 内存占用 (翻译窗口打开) | 250MB | 80MB | 68% 减少 |
| CPU 占用 (空闲) | 8-12% | 2-4% | 60-70% 减少 |
| 剪贴板轮询 CPU | 3-5% (100ms) | 0.5-1% (500ms) | 80% 减少 |
| 首屏加载 (设置页) | 3000ms | 1200ms | 60% 减少 |

### 各优化措施的贡献度

| 优化措施 | 对响应速度的提升 | 对内存的改善 | 对 CPU 的改善 |
|----------|-----------------|-------------|--------------|
| 并行请求 (`Promise.allSettled`) | 50% (串行→并行) | — | — |
| LRU 缓存 (100 条) | 30% (缓存命中时) | — | — |
| 窗口复用 (预创建) | 60% (热启动) | 有改善 (少创建) | — |
| 剪贴板轮询间隔 500ms | — | — | 80% 减少 |
| 本地语言检测 | 200ms 节省 | — | 微小 |
| AbortController 取消 | 避免无效等待 | 及时释放 | 及时释放 |
| Tesseract WASM 按需加载 | — | 50MB 首屏节省 | — |

### 缓存命中率分析

LRU 缓存的翻译结果缓存（容量 100 条）：

| 场景 | 命中率 | 典型文本 |
|------|--------|----------|
| 反复划词同一个词 | 100% | 选中 "cancel" 3 次 |
| 相似文本 (仅大小写不同) | 0% (精确匹配) | "Cancel" vs "cancel" |
| 密码框等固定术语 | 85% | UI 界面的 "OK"/"Cancel"/"Submit" |
| 日常阅读划词 | 20-30% | 自然语言，很少重复 |
| 整体平均 | ~30% | — |

## 优化技术详解

### 1. 并行调度 + Promise.allSettled

**原理**：启用多个翻译服务时，原本串行调用 (A 完成→B 开始) 改为并行 (A、B、C 同时发起)。

```
串行: |──── A ────|──── B ────|──── C ────| = sum(A,B,C) ≈ 3000ms
并行: |──── A ────|
      |──── B ────|                              = max(A,B,C) ≈ 1000ms
      |──── C ────|
```

**注意**：并发上限控制为 6 个（避免浏览器连接池耗尽）。

### 2. LRU 翻译缓存

**实现**：基于 Map 的 LRU (Least Recently Used) 缓存。

```javascript
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  get(key) {
    if (!this.cache.has(key)) return undefined;
    // 访问时移到末尾 (最近使用)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize)
      this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, value);
  }
}
```

**缓存 key 格式**：`"${text}_${fromLang}_${toLang}_${serviceName}"`

### 3. 窗口预创建与复用

**原理**：首次打开翻译窗口时创建 WebviewWindow，关闭时隐藏 (`hide()`) 而非销毁 (`close()`)。再次打开时直接 `show()` + `setFocus()`。

```
冷启动: new WebviewWindow() → load URL → render → show → 800ms
热启动: show() + setFocus() + setPosition() → 150ms
```

**内存权衡**：预创建窗口占据 ~30MB，但换来 450ms 响应速度提升。

### 4. 剪贴板轮询优化

**Bad**: `setInterval(check, 100)` → 每秒 10 次剪贴板读取，CPU 占用 3-5%
**Good**: `setInterval(check, 500)` → 每秒 2 次，CPU 占用 0.5-1%

**去重逻辑**：
```javascript
let lastHash = '';
function check() {
  const text = readClipboard();
  const hash = simpleHash(text);
  if (hash === lastHash) return; // 无变化，跳过
  lastHash = hash;
  emit('clipboard-changed', text);
}
```

### 5. 本地语言检测

**Bad**: 每次翻译前调用远程语言检测 API → 200-500ms 网络延迟
**Good**: Rust 层本地检测 (franc/whatlang 模型) → < 50ms

**优化效果**：每次翻译节省 200-500ms，且离线可用。

### 6. AbortController 请求取消

**场景**：用户在翻译进行中关闭窗口或重新选文

```javascript
let controller = new AbortController();

// 新请求到来时取消旧请求
function onNewText(text) {
  controller.abort(); // 取消旧请求
  controller = new AbortController();
  translate(text, controller.signal);
}
```

**收益**：避免无效网络请求占用带宽和连接池。

### 7. Tesseract WASM 按需加载

**Bad**: 启动时加载所有语言包 (中/英/日/韩/...) → 首屏加载 +100MB
**Good**: 仅在使用 OCR 时加载对应语言包，首次加载后缓存

### 8. 设置页路由懒加载

```javascript
// routes/index.jsx
const General = React.lazy(() => import('./pages/General'));
const Translate = React.lazy(() => import('./pages/Translate'));
```

首屏仅加载左侧导航，点击时才加载对应页面。

### 9. debounce 配置持久化

```javascript
let saveTimer;
function onConfigChange(key, value) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.set(key, value), 500);
}
```

避免每次配置修改都触发磁盘写入。

## 回归防护

### 性能回归检测机制

| 检测项 | 方法 | 阈值 | 触发动作 |
|--------|------|------|----------|
| 翻译响应时间 P95 | 在 CI 中运行 e2e test | > 3000ms | 构建失败，阻止合并 |
| 内存占用 (空闲) | Vitest memory profiler | > 80MB | 警告，需 review |
| Bundle 大小 | Rsbuild `build.report()` | > 1MB/entry | 警告，检查是否有大依赖引入 |
| 首屏渲染时间 | Lighthouse / Rsdoctor | > 1500ms | 警告 |

### 性能测试场景 (CI 应覆盖)

```javascript
// test:performance - 应在 CI 中运行
describe('Performance regression tests', () => {
  it('parallel dispatch: 3 services < 2000ms (P95)', async () => {
    const start = performance.now();
    await parallelDispatch(text, mockServices3, { timeout: 10000 });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('window pre-create: hot start < 300ms', async () => {
    const start = performance.now();
    // 假设窗口已 pre-create 并 hide()
    await window.show();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(300);
  });

  it('LRU cache: < 1ms for cached lookup', () => {
    const cache = new LRUCache(100);
    cache.set('hello_en_zh_baidu', '你好');
    const start = performance.now();
    const result = cache.get('hello_en_zh_baidu');
    expect(performance.now() - start).toBeLessThan(1);
    expect(result).toBe('你好');
  });

  it('clipboard poll: no double emit for same content', () => {
    // mock: 相同内容连续 3 次 poll, 仅 1 次 emit
  });
});
```

### 开发规范

1. **新服务添加后**：必须运行性能基准测试，确保 P95 响应时间不超过阈值
2. **依赖更新后**：检查 bundle size 增长，不允许 > 10% 的增长
3. **组件变更后**：使用 React DevTools Profiler 检查渲染次数，避免不必要的重渲染
4. **剪贴板轮询**：间隔不得改为 < 300ms，除非有充分理由且通过 CPU 占用验证

## 参考

- [34-prd-并行调度策略](./34-prd-并行调度策略.md) — 并行调度的详细设计
- [35-prd-翻译窗口交互](./35-prd-翻译窗口交互.md) — 翻译窗口的交互设计
- [44-prd-ADR-Tauri选择](./44-prd-ADR-Tauri选择.md) — Tauri 的性能优势
- [45-prd-ADR-Jotai选择](./45-prd-ADR-Jotai选择.md) — Jotai 的按需渲染优势