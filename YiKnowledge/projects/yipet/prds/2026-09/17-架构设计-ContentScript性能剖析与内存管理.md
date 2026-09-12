---
title: "YP-09-10: Content Script 性能剖析与内存管理 — 长期运行性能预算与泄漏检测"
tags: [需求文档, 性能, 内存管理, Content Script, 性能预算, 泄漏检测, 前端]
category: 项目/浏览器扩展/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 已完成
priority: P1
project: YiPet
project_id: yipet
owner: 陈铭
prd_month: "202609"
prd_task_id: YP-09-10
estimate_frontend: 2.0
review_status: 待评审
issue_type: 架构
roles: [engineer, srer]
---

# YP-09-10: Content Script 性能剖析与内存管理 — 长期运行性能预算与泄漏检测

> 需求编号：YP-09-10 · 优先级：P1 · 人天：2.0d · 状态：需求已编写
> 依赖：YP-09-01（Content Script 稳定性）

## 背景

YiPet Content Script 注入到用户浏览的每个页面，随页面生命周期长期运行（数小时到数天）。作为寄生在宿主页面的脚本，Content Script 的性能直接影响宿主页面的用户体验。Chrome Web Store 审核对扩展性能有隐性要求——性能低下的扩展在用户投诉后可能被下架。

当前缺少系统化的性能监视和内存管理机制：

| # | 问题 | 严重程度 |
|---|------|----------|
| 1 | 无性能预算——不知道 Content Script 消耗了多少 CPU/内存 | 中 |
| 2 | 无内存泄漏检测——MutationObserver、事件监听器、闭包可能累积 | 高 |
| 3 | 长时间运行后的性能退化无感知 | 中 |
| 4 | 宿主页面性能劣化无法归因（是页面自己的问题还是 YiPet 导致的？） | 中 |
| 5 | `requestIdleCallback` 回调在低端设备上可能饥饿 | 低 |

---

## 一、现状分析

### 1.1 Content Script 资源消耗模型

```
Content Script 注入到宿主页面
  │
  ├── 常驻资源（整个页面生命周期）
  │   ├── MutationObserver × 1         (~1KB)
  │   ├── history.pushState 包装 × 2    (~1KB)
  │   ├── 事件监听器 × 4                (~2KB)
  │   ├── #yipet-overlay DOM 子树       (~5-20KB，取决于宠物复杂度)
  │   └── window.YiPet API 命名空间     (~1KB)
  │
  ├── 条件资源（用户打开聊天窗口时）
  │   ├── Vue 3.5 应用实例              (~100-200KB)
  │   ├── Pinia Store                   (~50-100KB)
  │   ├── 聊天消息 DOM                  (~10-100KB，取决于消息数量)
  │   ├── Element Plus 组件             (~50-100KB)
  │   └── marked Markdown 渲染          (~10-50KB)
  │
  └── 临时资源（流式聊天期间）
      ├── SSE EventSource / fetch stream (~5-20KB)
      ├── 流式 chunk 缓冲区              (~10-50KB)
      └── RAG 来源数据                   (~5-20KB)
```

### 1.2 性能预算基线

| 指标 | 预算 | 测量方式 | 超出后果 |
|------|------|----------|----------|
| Content Script 同步执行时间 | < 50ms/次 | `performance.measure('yipet:sync')` | 宿主页面渲染卡顿 |
| MutationObserver 回调 CPU | < 0.5% | Performance Observer | 高频 DOM 变化页面性能劣化 |
| 常驻内存（无聊天窗口） | < 50KB | `performance.memory.usedJSHeapSize` 增量 | 低端设备内存压力 |
| 聊天窗口打开时内存 | < 500KB | 同上 | 低端设备可能 OOM |
| 事件监听器数量 | < 10 个 | `getEventListeners(window)` | 内存泄漏风险 |
| MutationObserver 实例 | = 1 个 | DOM 检查 | 重复监听 → 性能劣化 |

### 1.3 已知内存泄漏风险点

| # | 风险点 | 泄漏机制 | 当前缓解 | 风险等级 |
|---|--------|----------|----------|----------|
| 1 | `MutationObserver` 回调闭包持有 DOM 引用 | 回调中的闭包引用了已移除的 DOM 节点，GC 无法回收 | 无 | 中 |
| 2 | `history.pushState` 包装未在页面卸载时恢复 | 包装函数替换了原生方法，页面卸载后包装函数仍在内存 | 无 | 低 |
| 3 | 事件监听器未在聊天窗口关闭时移除 | `window.addEventListener('yipet:routeChange', ...)` 持续累积 | 无（仅 4 个监听器） | 低 |
| 4 | Pinia store 订阅未取消 | `store.$subscribe()` 在组件卸载后未取消 | Pinia 自动管理 | 低 |
| 5 | SSE fetch 流未在 Tab 切换时 abort | 用户在聊天中途切换 Tab，fetch 流继续接收数据 | 无 | 中 |
| 6 | `requestIdleCallback` 未 cancel | 回调已调度但页面状态变化后不再需要 | `requestIdleCallback` 返回的 ID 未保存 | 低 |

### 1.4 改造前数据流

```
Content Script 注入
  → 创建 MutationObserver（常驻，无 disconnect 时机）
  → 包装 history.pushState/replaceState（常驻，无恢复时机）
  → 添加 4 个事件监听器（常驻，无移除时机）
  → 用户打开聊天窗口
    → 创建 Vue 3.5 应用实例
    → 创建 Pinia Store
    → 加载聊天历史消息 → DOM 节点累积
  → 用户关闭聊天窗口
    → Vue 应用实例未销毁（仅 CSS display:none）
    → Pinia Store 仍持有历史消息数据
    → MutationObserver 仍在运行
  → 用户在页面上停留 4 小时
    → MutationObserver 回调累计执行数千次
    → 事件监听器累积（SPA 路由切换可能添加额外监听器）
  → 内存: 初始 ~50KB → 4 小时后 ~200KB（增长 4×）
  → 排查耗时: heap snapshot 对比 → 定位泄漏源 → 修复
```

---

## 二、设计决策

### 决策 1：性能监视策略 — Sampling Profiler vs Performance Observer vs 自报告

| 选项 | 开销 | 数据精度 | 生产可用 |
|------|------|----------|----------|
| Sampling Profiler (Chrome DevTools) | 中（开发时） | 高 | 否（仅开发环境） |
| Performance Observer | 极低 | 中 | 是 |
| 自报告（`performance.mark/measure`） | 极低 | 低（仅标注点） | 是 |

**选择：Performance Observer（长期趋势） + 自报告（关键路径）。** Performance Observer 监控长任务（Long Task API），自报告在关键路径（注入、MO 回调、路由切换）埋点。

### 决策 2：内存泄漏检测 — 定时快照 vs 趋势监控 vs 引用计数

| 选项 | 精度 | 性能开销 | 实现复杂度 |
|------|------|----------|-----------|
| 定时 heap snapshot | 最高 | 极高（~50-200ms） | 低 |
| `performance.memory` 趋势 | 低（采样误差大） | 极低 | 低 |
| 弱引用计数 | 中 | 低 | 中 |

**选择：`performance.memory` 趋势 + 阈值告警。** Chrome 的 `performance.memory` API 提供 `usedJSHeapSize`，虽精度有限（采样粒度 ~10MB），但零开销适合长期趋势监控。异常增长（1 小时 > 2× 基线）触发告警。

### 决策 3：聊天窗口关闭策略 — 销毁 vs 隐藏 vs 混合

| 选项 | 内存释放 | 重新打开速度 | 实现 |
|------|----------|-------------|------|
| 完全销毁（`app.unmount()`） | 最高 | 慢（重新创建 Vue 实例） | 中 |
| 仅 CSS 隐藏（当前） | 最低 | 最快 | 低 |
| 混合（5 分钟后销毁） | 中 | 高（5 分钟内秒开） | 中 |

**选择：混合策略。** 关闭时隐藏（快速重新打开），5 分钟未重新打开则完全销毁（释放内存）。`setTimeout` 延迟销毁。

### 设计决策记录

| 决策 | 选项 A | 选项 B | 选项 C | 选择 | 理由 |
|------|--------|--------|--------|------|------|
| 性能监视 | Sampling Profiler | Performance Observer | 自报告 | **PO + 自报告** | 生产可用+关键路径覆盖 |
| 泄漏检测 | heap snapshot | performance.memory | — | **趋势+阈值** | 零开销，长期趋势可见 |
| 聊天关闭 | 销毁 | 隐藏 | — | **混合** | 快速重新打开+最终释放 |

---

## 三、目标架构

### 3.1 性能监视模块

```typescript
// YiPet/src/content/performance/monitor.ts

interface PerformanceMark {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;   // 已使用 JS 堆 (bytes)
  totalJSHeapSize: number;  // 总 JS 堆 (bytes)
  jsHeapSizeLimit: number;  // JS 堆上限 (bytes)
}

class ContentScriptMonitor {
  private marks: PerformanceMark[] = [];
  private memoryLog: MemorySnapshot[] = [];
  private memoryInterval: number | null = null;
  private baselineMemory = 0;
  private readonly MEMORY_CHECK_INTERVAL = 60_000;  // 1 分钟
  private readonly MEMORY_GROWTH_THRESHOLD = 2.0;   // 2× 基线

  /** 开始性能监视（Content Script 注入时调用）。 */
  start() {
    // 1. 记录内存基线
    if (performance.memory) {
      this.baselineMemory = performance.memory.usedJSHeapSize;
    }

    // 2. 定时采样内存
    this.memoryInterval = window.setInterval(() => {
      this.sampleMemory();
    }, this.MEMORY_CHECK_INTERVAL);

    // 3. 观察长任务（> 50ms）
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.reportLongTask(entry);
          }
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
    }
  }

  /** 测量关键路径耗时。 */
  measure(name: string, fn: () => void): number {
    const markStart = `${name}:start`;
    const markEnd = `${name}:end`;
    performance.mark(markStart);
    fn();
    performance.mark(markEnd);
    const measure = performance.measure(name, markStart, markEnd);
    this.marks.push({
      name,
      startTime: measure.startTime,
      duration: measure.duration,
    });

    // 清理 Performance API 条目（避免内存泄漏）
    performance.clearMarks(markStart);
    performance.clearMarks(markEnd);
    performance.clearMeasures(name);

    return measure.duration;
  }

  /** 内存采样 + 泄漏检测。 */
  private sampleMemory() {
    if (!performance.memory) return;

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
    this.memoryLog.push(snapshot);

    // 保留最近 60 个采样点（1 小时）
    if (this.memoryLog.length > 60) {
      this.memoryLog.shift();
    }

    // 异常增长检测
    if (this.baselineMemory > 0) {
      const growthRatio = snapshot.usedJSHeapSize / this.baselineMemory;
      if (growthRatio > this.MEMORY_GROWTH_THRESHOLD) {
        console.warn(
          `[YiPet:Perf] 内存异常增长: ${(growthRatio * 100).toFixed(0)}% 基线, ` +
          `当前 ${(snapshot.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`
        );
        this.reportMemoryAnomaly(snapshot, growthRatio);
      }
    }
  }

  /** 停止性能监视（页面卸载时调用）。 */
  stop() {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    // 导出最终性能报告（开发模式）
    if (import.meta.env.DEV) {
      console.table(this.getReport());
    }
  }

  /** 获取性能报告。 */
  getReport() {
    const criticalPaths = this.marks.filter(m =>
      ['inject', 'route-change', 'create-overlay'].includes(m.name)
    );
    const avgDuration = (name: string) => {
      const entries = this.marks.filter(m => m.name === name);
      return entries.length > 0
        ? entries.reduce((s, e) => s + e.duration, 0) / entries.length
        : 0;
    };

    return {
      marks: {
        total: this.marks.length,
        critical: criticalPaths.map(m => ({
          name: m.name,
          p50: avgDuration(m.name),
        })),
      },
      memory: {
        baseline: this.baselineMemory,
        latest: this.memoryLog[this.memoryLog.length - 1]?.usedJSHeapSize ?? 0,
        trend: this.memoryLog.length >= 2
          ? this.memoryLog[this.memoryLog.length - 1].usedJSHeapSize /
            this.memoryLog[0].usedJSHeapSize
          : 1.0,
      },
    };
  }

  private reportLongTask(entry: PerformanceEntry) {
    console.debug(`[YiPet:Perf] Long task: ${entry.duration.toFixed(0)}ms`);
  }

  private reportMemoryAnomaly(snapshot: MemorySnapshot, ratio: number) {
    // 上报到扩展存储（后续可通过 Popup 查看）
    chrome.storage.local.set({
      'yipet:perf:lastAnomaly': { snapshot, ratio, time: Date.now() },
    });
  }
}

export const perfMonitor = new ContentScriptMonitor();
```

### 3.2 聊天窗口混合关闭策略

```typescript
// YiPet/src/chat/stores/chat.ts

const CHAT_DESTROY_DELAY = 5 * 60 * 1000;  // 5 分钟

let destroyTimer: number | null = null;

function closeChatWindow() {
  // 1. 立即隐藏（CSS display:none）
  chatVisible.value = false;

  // 2. Abort 进行中的 SSE 流式请求
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  // 3. 5 分钟后未重新打开则完全销毁
  destroyTimer = window.setTimeout(() => {
    destroyChatWindow();
  }, CHAT_DESTROY_DELAY);
}

function openChatWindow() {
  // 取消延迟销毁 Timer
  if (destroyTimer) {
    clearTimeout(destroyTimer);
    destroyTimer = null;
  }

  // 正常显示
  chatVisible.value = true;
}

function destroyChatWindow() {
  // 1. 销毁 Vue 应用实例
  chatApp?.unmount();

  // 2. 清理 Pinia Store
  chatStore.$dispose();

  // 3. 移除聊天窗口 DOM
  document.getElementById('yipet-chat-root')?.remove();

  // 4. 清理事件监听器
  window.removeEventListener('yipet:chat:close', handleChatClose);

  chatApp = null;
  console.debug('[YiPet:Perf] Chat window destroyed after inactivity');
}
```

### 3.3 关键路径性能标记

```typescript
// YiPet/src/content/bootstrap.ts

import { perfMonitor } from './performance/monitor';

// 启动监视
perfMonitor.start();

// 测量注入耗时
perfMonitor.measure('inject', () => {
  createPetOverlay(window, BASE, color, role, visible);
});

// 测量路由切换响应耗时
window.addEventListener('yipet:routeChange', () => {
  perfMonitor.measure('route-change', () => {
    ensurePetOverlay();
  });
});

// 页面卸载时停止监视
window.addEventListener('beforeunload', () => {
  perfMonitor.stop();
});
```

### 3.4 性能预算告警

```typescript
// 关键路径超预算告警
const PERF_BUDGETS = {
  'inject': 20,          // ms — 宠物 DOM 注入
  'route-change': 15,    // ms — 路由切换响应
  'create-overlay': 10,  // ms — overlay 创建
  'mo-callback': 5,      // ms — MutationObserver 回调
} as const;

function checkBudget(name: string, duration: number) {
  const budget = PERF_BUDGETS[name as keyof typeof PERF_BUDGETS];
  if (budget && duration > budget) {
    console.warn(
      `[YiPet:Perf] ${name} 超预算: ${duration.toFixed(1)}ms > ${budget}ms`
    );
  }
}
```

---

## 四、具体改动

### 4.1 新增文件

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/content/performance/monitor.ts` | ~180 | 性能监视 + 内存采样 + 泄漏检测 |
| `src/content/performance/budgets.ts` | ~30 | 性能预算常量 |

### 4.2 修改文件

| 文件 | 改动 |
|------|------|
| `src/content/bootstrap.ts` | 集成 `perfMonitor.start/stop` + 关键路径标记 |
| `src/chat/stores/chat.ts` | 聊天窗口混合关闭策略 (`CHAT_DESTROY_DELAY`) |
| `src/content/rendering/overlay.ts` | `createPetOverlay` 添加性能标记 |

---

## 五、实施步骤

| 步骤 | 内容 | 验证方式 | 人天 |
|------|------|----------|------|
| 1 | 新增 `ContentScriptMonitor` 性能监视模块 | 注入后 `perfMonitor.getReport()` 返回数据 | 0.5 |
| 2 | bootstrap.ts 集成关键路径标记 | `performance.measure` 日志可见 | 0.25 |
| 3 | 新增内存采样 + 泄漏检测 | 模拟内存增长 → console.warn 触发 | 0.5 |
| 4 | 聊天窗口混合关闭策略 | 关闭 → 5 分钟内重开秒开 / 5 分钟后内存释放 | 0.5 |
| 5 | 回归测试——性能不退化 | 注入耗时 < 20ms，MO 回调 < 5ms | 0.25 |

**总计：2.0d**

---

## 六、测试规格

### Requirement: 性能监视

#### Scenario: 关键路径耗时测量
- **Given** Content Script 注入到页面
- **When** `perfMonitor.measure('inject', fn)` 执行
- **Then** `perfMonitor.getReport()` 返回 `inject` 的平均耗时

#### Scenario: 长任务检测
- **Given** Content Script 执行了 > 50ms 的同步操作
- **When** Performance Observer 捕获 Long Task
- **Then** `console.debug` 输出长任务耗时

### Requirement: 内存泄漏检测

#### Scenario: 异常内存增长告警
- **Given** 内存基线 = 50KB
- **When** 1 小时后 `usedJSHeapSize` = 120KB（> 2× 基线）
- **Then** `console.warn` 输出内存异常增长告警

#### Scenario: 正常内存波动不告警
- **Given** 内存基线 = 50KB
- **When** `usedJSHeapSize` 在 40-80KB 之间波动
- **Then** 无告警

### Requirement: 聊天窗口混合关闭

#### Scenario: 5 分钟内重开秒开
- **Given** 聊天窗口关闭（隐藏）
- **When** 3 分钟后用户重新打开
- **Then** 窗口立即显示（无 Vue 实例重建延迟）

#### Scenario: 5 分钟后内存释放
- **Given** 聊天窗口关闭（隐藏）
- **When** 6 分钟未重新打开
- **Then** Vue 实例已销毁，`yipet-chat-root` DOM 已移除，内存释放

---

## 七、性能分析

| 操作 | 开销 | 说明 |
|------|------|------|
| `performance.mark/measure` | < 0.01ms/次 | 浏览器原生 API，开销极低 |
| `performance.memory` 采样 | < 0.01ms/次 | 仅读取属性，无计算 |
| Performance Observer (longtask) | < 0.1ms/次 | 仅 > 50ms 任务触发，低频 |
| `getReport()` | < 1ms | 纯数据聚合，无 I/O |

---

## 八、风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| `performance.memory` API 非标准（Chrome only） | 低 | 低 | 使用 `?.` 可选链，Firefox/Safari 跳过内存采样 |
| Performance Observer 在 Service Worker 不可用 | N/A | — | Performance Observer 仅在 Content Script (MAIN world) 使用 |
| 内存采样误差（采样粒度 ~10MB） | 中 | 低 | 趋势监控（多采样点），不依赖单点精度 |

---

## 九、可观测性

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|----------|----------|------|
| 注入耗时 P95 | `perfMonitor.measure('inject')` | > 50ms | Content Script 注入不应阻塞页面 |
| MO 回调耗时 P95 | `perfMonitor.measure('mo-callback')` | > 10ms | 高频 DOM 变化页面需关注 |
| 内存增长率 | `performance.memory` 趋势 | > 2×/小时 | 可能存在泄漏 |
| 长任务次数 | Performance Observer | > 5 次/小时 | Content Script 阻塞了宿主页面 |

---

---

## 回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| `ContentScriptMonitor` 的定时器（`setInterval` 每分钟）在页面长期运行时累积——多个页面 Tab 的定时器导致 Chrome 整体 CPU 占用增加 | Feature Flag 禁用自动采样——仅保留手动 `takeSnapshot()` 和 `getReport()`，关闭定时器 | 性能监视 | < 1min（远程 Flag） |
| `performance.memory` API 在 Chrome 更新后行为变化——`usedJSHeapSize` 数值异常（如返回 0 或负值）触发误报 | 添加数值合理性校验——`if (used <= 0 || used > limit) skip`——跳过异常采样点 | 内存监控 | < 5min（校验逻辑） |
| 聊天窗口混合关闭策略的 5 分钟 Timer 在窗口快速开/关时累积多个 Timer——内存中同时存在 5+ 个延迟销毁 Timer | 关闭时先 `clearTimeout` 旧 Timer——确保任何时候只有 0 或 1 个活跃的销毁 Timer | 内存泄漏 | < 5min（代码修复） |
| `PerformanceObserver` 的 `longtask` 观察在生产环境中产生大量 `console.debug` 输出——用户打开 DevTools 时看到刷屏日志 | 生产构建中 `console.debug` 被 Tree shaking 移除——或使用条件编译 `if (import.meta.env.DEV)` | 日志噪音 | < 5min（构建配置） |
| 内存泄漏告警误报——GC 未及时回收导致 `usedJSHeapSize` 短暂升高 2× 基线，触发告警后 GC 回收恢复正常 | 提高告警阈值——从 "1 小时内 2× 基线" 改为 "连续 3 次采样 2× 基线"（3 次 = 3 分钟持续增长，排除 GC 延迟） | 误报 | < 5min（阈值调整） |

**回滚验证**：Content Script 注入后 `perfMonitor` 正常工作 → 内存采样日志正常 → 聊天窗口关闭 5 分钟后内存释放 → 无误报告警。

---

## 回归问题预测

| # | 预测问题 | 原因 | 验证方法 |
|---|---------|------|---------|
| 1 | `performance.memory` API 在跨域 iframe 中的 Content Script 不可用——`performance.memory` 是 Chrome 特有 API，在 `cross-origin-isolated` 上下文中返回 `null` | 某些页面设置了 `Cross-Origin-Embedder-Policy: require-corp` 和 `Cross-Origin-Opener-Policy: same-origin`——在此上下文中 `performance.memory` 可能不可用。`ContentScriptMonitor` 调用 `performance.memory.usedJSHeapSize` 抛出 `TypeError` | 在设置了 COEP/COOP 头的页面中注入 Content Script——检查 `perfMonitor.start()` 是否优雅降级（跳过内存采样而非崩溃） |
| 2 | `PerformanceObserver` 的 `longtask` 条目累积在 `PerformanceObserverEntryList` 中——`takeRecords()` 未被调用导致内存泄漏 | `PerformanceObserver` 的 `buffered: true` 选项使 observer 接收历史条目。如果 `observe()` 回调中未处理完所有条目（`getEntries()` 后未清理），Performance Timeline 中的条目累积 | 在包含高频 Long Task 的页面中运行 30 分钟——检查 `performance.getEntriesByType('longtask')` 的条目数是否持续增长 |
| 3 | 聊天窗口混合关闭的 5 分钟 Timer 在用户实际出发场景中不合适——用户在 4 分 50 秒时重新打开聊天，Timer 被清除；但 Vue 实例的 Pinia Store 数据在隐藏期间已过时 | 用户在 3 分钟后重新打开聊天——Timer 被 `clearTimeout` 清除，Vue 实例保留。但 Pinia Store 中的 `messages` 数据仍是 3 分钟前的状态——用户看到的消息列表可能与服务端最新数据不一致 | 关闭聊天 → 在另一个 Tab 中修改会话（新增消息）→ 3 分钟后重新打开聊天 → 检查消息列表是否拉取了最新数据 |
| 4 | `ContentScriptMonitor` 的 `getReport()` 返回的 `marks[]` 数组在页面长期运行时无限增长——1000+ 个性能标记导致内存占用增加和报告生成变慢 | `this.marks.push(...)` 在每次 `measure()` 调用时追加——无上限。页面运行 1 小时后 `marks` 数组达到数百个条目，`getReport()` 的 `filter` + `reduce` 遍历耗时增加 | 运行 1 小时后调用 `getReport()`——测量耗时是否 < 5ms，检查 `marks` 数组大小是否被限制在 200 条以内 |
| 5 | `WeakRefTracker.collect()` 中的 `deref()` 调用在 GC 尚未运行时返回非 undefined——已被移除的 DOM 节点在 GC 前仍被 WeakRef 持有，误报为"泄漏" | `WeakRef.deref()` 在目标对象被 GC 回收后返回 `undefined`——但 GC 执行时机不确定（可能在对象变为不可达后的数秒甚至数分钟）。`collect()` 报告"仍有 12 个 DOM 节点"但实际上它们只是等待 GC | 在 `collect()` 中添加 `FinalizationRegistry` 计数器——对比 WeakRef deref 结果和 FinalizationRegistry 回调计数——两数不一致时添加注释"Waiting for GC" |
| 6 | `import.meta.env.DEV` 在生产构建中被错误替换为 `true`——性能监视代码在生产环境中运行，`console.debug` 输出到所有用户的 DevTools Console | Vite/Rsbuild 的 `import.meta.env.DEV` 在 `mode: 'production'` 时应被替换为 `false`。如果构建配置错误（如使用了 `mode: 'development'` 生产构建）——所有 `if (import.meta.env.DEV)` 分支在生产环境中执行 | 检查生产构建产物（`npm run build` + `grep 'console.debug' dist/`）——确认无 `console.debug` 调用或已被移除 |

## 相关文档

- [Content Script 稳定性](../01-稳定性-ContentScript.md) — Content Script 是性能剖析的载体，稳定性是性能监控的前提
- [内存快照泄漏追踪](../50-需求-内存快照泄漏追踪.md) — 内存泄漏检测是性能剖析的关键输出，共享 WeakRef 和 FinalizationRegistry 技术
- [资源生命周期管理](../32-需求-资源生命周期管理.md) — 性能剖析识别出的资源占用问题通过生命周期管理策略解决