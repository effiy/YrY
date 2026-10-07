---

doc_type: module
prd_task_id: "YP-09-S29"
title: "翻译历史记录 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "51-prd-翻译历史记录.md"

type: task
---

# 翻译历史记录 — 开发方案

> 来源 PRD：[51-prd-翻译历史记录](../../prds/2026-09/51-prd-翻译历史记录.md)
> 需求编号：YP-09-S29 · 优先级：P2 · 人天：0.5d

## 一、架构

翻译历史内嵌于翻译窗口组件，纯内存存储（进程退出即清除，隐私设计）。

```
TranslateWindow
  └── TargetArea
        └── HistoryOverlay          ← 翻译窗口内嵌历史浮层（最近 20 条）
              ├── HistoryList       ← 虚拟滚动列表
              │     └── HistoryItem ← 单条记录（原文截断 + 译文 + 时间）
              └── SearchBar         ← 历史搜索

Settings / HistoryPage              ← 设置页完整历史
  └── HistoryTable                  ← 表格视图（原文/译文/语言/服务/时间）
        ├── SearchBar + ClearButton
        └── VirtualScroll (> 50 条启用)
```

## 二、核心实现

### HistoryStore (Jotai atom)

```typescript
// src/hooks/useHistory.js
import { atom, useAtom } from "jotai";

interface HistoryEntry {
  id: string;
  source: string;
  target: string;
  fromLang: string;
  toLang: string;
  service: string;
  timestamp: number;
}

const MAX_OVERLAY_ITEMS = 20;

const historyAtom = atom<HistoryEntry[]>([]);

export function useHistory() {
  const [history, setHistory] = useAtom(historyAtom);

  const push = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    setHistory(prev => {
      const next = [{ id: crypto.randomUUID(), ...entry, timestamp: Date.now() }, ...prev];
      return next.slice(0, MAX_OVERLAY_ITEMS); // LRU: discard oldest
    });
  };

  const remove = (id: string) => setHistory(prev => prev.filter(h => h.id !== id));
  const clear = () => setHistory([]);
  const search = (query: string) => {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return history.filter(h => new RegExp(escaped, "i").test(h.source + h.target));
  };

  return { history, push, remove, clear, search };
}
```

### 翻译窗口集成

```jsx
// TranslateWindow — onTranslateComplete 回调
function onTranslateComplete(result) {
  push({
    source: result.source,
    target: result.target,
    fromLang: result.from,
    toLang: result.to,
    service: result.service
  });
}
```

## 三、设计决策

| 决策点 | 方案 | 理由 | 权衡 |
|--------|------|------|------|
| 存储位置 | Jotai atom (内存) | 隐私优先：关闭应用即清除 | 重启后历史丢失（符合预期） |
| 容量上限 | 翻译窗口 20 条，设置页无上限 | 窗口浮层需限制高度；设置页可滚动 | 内存无限增长风险（需虚拟滚动） |
| LRU 淘汰 | `slice(0, 20)` | 简单可靠，O(1) | 无淘汰回调（不需要） |
| 搜索 | 正则转义 + `RegExp.test` | 支持模糊搜索，防止正则注入 | 每字符触发重搜索（小数据量无影响） |
| 时间戳 | `Date.now()` (毫秒) | 并发翻译排序精确 | 系统时间异常时顺序错乱 |

## 四、性能优化

| 优化点 | 手段 | 效果 |
|--------|------|------|
| 虚拟滚动 | react-window (< 50 条不启用) | 1000 条记录渲染 < 20 DOM 节点 |
| 搜索去抖 | 300ms debounce | 快速输入不频繁触发搜索 |
| 空翻译过滤 | 入口判断 `text.trim().length > 0` | 零写入开销 |

## 五、错误处理

| 场景 | 处理 | 用户感知 |
|------|------|---------|
| 文本超长 (> 10000 字) | 显示截断 200 字 + hover tooltip | "...点击查看全文" |
| 特殊字符导致渲染异常 | React Error Boundary + 显示纯文本 | "原文包含特殊格式" |
| crypto.randomUUID 不可用 | fallback: `Date.now() + Math.random()` | 无感知 |

## 六、交叉引用

| 文档 | 路径 |
|------|------|
| PRD | [51-prd-翻译历史记录](../../prds/2026-09/51-prd-翻译历史记录.md) |
| 测试 | [96-prd-test-翻译历史记录](../../tests/2026-09/96-prd-test-翻译历史记录.md) |
| 源码 | `YiPot/src/hooks/useHistory.js` |
| 翻译窗口 | `YiPot/src/window/Translate/` |