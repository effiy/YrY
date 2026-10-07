---

doc_type: module
prd_task_id: "YP-09-08"
title: "YP-09-08: CDN 资源加载系统 — CDN_CATALOG 统一清单 + CdnInjector 工厂 + window[global] 去重 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "15-基础设施-CDN资源加载系统.md"
source_okr: [yipet-001]

type: task
---

# YP-09-08: CDN 资源加载系统 — 开发方案

> 来源 PRD：[15-基础设施-CDN资源加载系统.md](../../prds/2026-09/15-基础设施-CDN资源加载系统.md)
> 需求编号：YP-09-08 · 优先级：P1 · 人天：1.0d

---

## 一、方案概述

CDN 资源散落在各处独立声明，导致重复注入、版本不一致、维护成本高。本方案建立统一的 CDN_CATALOG 清单 + CdnInjector 工厂 + `window[global]` 去重机制。

### 修复前问题

```
bootstrap.ts: 注入 vue@3.5.13 → window.Vue
overlay.ts:   注入 vue@3.5.12 → window.Vue 被覆盖 (版本冲突!)
chat.js:      注入 element-plus@2.14 → 重复注入 CSS
→ 多个入口各自声明 CDN 资源，无统一管理
```

### 修复后

```
CDN_CATALOG (单一真相来源)
  └── CdnInjector (统一注入器)
        ├── window[global] 检查 → 已加载则跳过
        ├── JS: <script async> 加载
        └── CSS: <link> 同步加载 (阻塞渲染防闪烁)
```

---

## 二、核心模块设计

### 2.1 CDN_CATALOG (`src/content/cdn/catalog.ts`)

```typescript
interface CdnEntry {
  path: string;           // 相对路径: "vendor/vue.global.prod.js"
  global?: string;        // window 全局名: "Vue"
  version: string;        // 版本: "3.5.13"
  type: "js" | "css";
  async?: boolean;        // JS 异步加载 (默认 true)
}

const CDN_CATALOG: CdnEntry[] = [
  // Vendor JS
  { path: "vendor/vue.global.prod.js", global: "Vue", version: "3.5.13", type: "js" },
  { path: "vendor/pinia.iife.prod.js", global: "Pinia", version: "4.0.1", type: "js" },
  { path: "vendor/element-plus.js", global: "ElementPlus", version: "2.14.3", type: "js" },
  { path: "vendor/marked.esm.js", global: "marked", version: "15.0.4", type: "js" },
  // Vendor CSS
  { path: "vendor/element-plus.css", version: "2.14.3", type: "css" },
  // YiPet 内部样式
  { path: "styles/variables.css", version: "1.0.0", type: "css" },
  { path: "styles/reset.css", version: "1.0.0", type: "css" },
  { path: "styles/chat.css", version: "1.0.0", type: "css" },
];
```

### 2.2 CdnInjector (`src/content/cdn/injector.ts`)

```typescript
class CdnInjector {
  private loaded = new Set<string>();
  private baseUrl: string;

  constructor() {
    this.baseUrl = chrome.runtime.getURL("cdn/");
  }

  async injectAll(entries: CdnEntry[] = CDN_CATALOG): Promise<void> {
    const cssEntries = entries.filter(e => e.type === "css");
    const jsEntries = entries.filter(e => e.type === "js");

    // CSS 同步注入 (阻塞渲染，避免 FOUC)
    for (const entry of cssEntries) {
      await this.injectCSS(entry);
    }

    // JS 异步注入
    await Promise.all(jsEntries.map(e => this.injectJS(e)));
  }

  private async injectJS(entry: CdnEntry): Promise<void> {
    // window[global] 去重 — 防止重复注入
    if (entry.global && (window as any)[entry.global]) {
      console.debug(`[CDN] Already loaded: ${entry.global}@${entry.version}`);
      return;
    }
    if (this.loaded.has(entry.path)) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = this.baseUrl + entry.path;
      script.async = entry.async !== false;
      script.onload = () => { this.loaded.add(entry.path); resolve(); };
      script.onerror = () => reject(new Error(`CDN load failed: ${entry.path}`));
      document.head.appendChild(script);
    });
  }

  private injectCSS(entry: CdnEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = this.baseUrl + entry.path;
      link.onload = () => { this.loaded.add(entry.path); resolve(); };
      link.onerror = () => reject(new Error(`CDN CSS failed: ${entry.path}`));
      document.head.appendChild(link);
    });
  }
}
```

### 2.3 加载失败处理

```typescript
// injectAll 失败累计 → 用户可见提示
let failureCount = 0;
const FAILURE_THRESHOLD = 3;

async function injectAllSafe(injector: CdnInjector, entries: CdnEntry[]) {
  for (const entry of entries) {
    try {
      if (entry.type === "css") await injector.injectCSS(entry);
      else await injector.injectJS(entry);
      failureCount = 0;
    } catch (err) {
      failureCount++;
      if (failureCount >= FAILURE_THRESHOLD) {
        showUpdateNotification(); // 显示 "扩展已更新，请刷新页面"
      }
    }
  }
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 人天 |
|------|------|---------|------|
| 1 | CDN_CATALOG 统一清单 | `catalog.ts` | 0.25 |
| 2 | CdnInjector 工厂 + window[global] 去重 | `injector.ts` | 0.5 |
| 3 | 迁移现有入口到 CdnInjector | `bootstrap.ts`, `overlay.ts` | 0.25 |

**合计：1.0d**

## 四、完成定义

- [ ] CDN_CATALOG 作为所有 CDN 资源的唯一真相来源
- [ ] CdnInjector 统一管理 JS/CSS 注入
- [ ] window[global] 去重防重复注入
- [ ] JS 异步 / CSS 同步加载
- [ ] 连续 3 次加载失败显示用户提示
- [ ] MV3 CSP 合规 (所有资源来自扩展内)