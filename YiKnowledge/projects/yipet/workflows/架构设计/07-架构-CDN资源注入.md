---
title: CDN 资源注入模式
tags: [yipet, patterns, cdn, injection, loader, chrome-extension, mv3, csp]
category: projects/yipet/specs
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: pattern
status: active
---

# Pattern: CDN Injection

> CDN 资源注入完整模式：资源目录管理、按需注入策略、加载顺序控制、重复注入防护、加载失败降级、聊天组件 CSS 拼接、MV3 CSP 合规、构建集成、性能优化。

## 概述

YiPet 作为 Chrome MV3 扩展，需要将 Vue 3、Bootstrap 等大型库注入到宿主页面。由于 MV3 禁止远程代码执行，所有资源必须预打包到扩展内，通过 `chrome.runtime.getURL` 获取本地路径后注入。

**核心挑战**：
1. 资源必须本地化（MV3 CSP 禁止远程代码）
2. 资源有依赖顺序（Bootstrap 依赖 Vue）
3. 注入不能重复（多页面导航时 SPA 可能多次触发 content_scripts）
4. 加载失败需要降级（非关键资源不应阻塞核心功能）

**相关规范**：
- [扩展架构](./架构设计/02-扩展架构.md)
- [核心模块](./架构设计/05-核心模块.md)
- [构建部署](../workflows/build-deploy.md)

---

## 资源目录管理

### 目录结构

```
public/cdn/
├── vendor/                   # 50+ 第三方库（版本化路径）
│   ├── vue@3.5.13/           # Vue 3.5.13 运行时
│   ├── jquery@3.7.1/         # jQuery 3.7.1
│   ├── bootstrap@5.2.3/      # Bootstrap 5.2.3 (JS + CSS)
│   ├── gsap/                 # GSAP TweenMax
│   ├── apexcharts@3.46.0/    # ApexCharts 3.46.0
│   ├── dayjs@1.11.21/        # Day.js + 7 插件
│   ├── marked.min.js         # Markdown 解析
│   └── ...                   # 50+ 条目（动画/图表/图标/轮播/工具）
├── styles/                   # 样式表
│   ├── variables.css         # 设计变量（CSS 自定义属性）
│   ├── reset.css             # CSS Reset
│   ├── themes/               # 5 个颜色主题（quantum-violet 等）
│   └── ...
└── utils/                    # 工具脚本
    └── index.js              # 统一工具包（UrlBuilder + LoggerUtils + YiPetApi）
```

### 资源目录（Catalog）

```typescript
// src/content/cdn/catalog.ts
interface CdnEntry {
  key: string;        // 短键，如 'vue', 'dayjs'
  path: string;       // 相对于 CDN base 的路径，如 'vendor/vue@3.5.13/vue.global.prod.js'
  type: 'js' | 'css';
  global?: string;    // window 属性名，用于检测已加载
  desc: string;       // 人类可读标签
}

export const CDN_CATALOG: CdnEntry[] = [
  // 框架与核心
  { key: 'vue',          path: 'vendor/vue@3.5.13/vue.global.prod.js',  type: 'js',  global: 'Vue',     desc: 'Vue 3.5.13' },
  { key: 'jquery',       path: 'vendor/jquery@3.7.1/jquery.min.js',     type: 'js',  global: 'jQuery',  desc: 'jQuery 3.7.1' },
  { key: 'bootstrap',    path: 'vendor/bootstrap@5.2.3/js/bootstrap.bundle.min.js', type: 'js', global: 'bootstrap', desc: 'Bootstrap 5.2.3 JS' },
  { key: 'bootstrap-css',path: 'vendor/bootstrap@5.2.3/css/bootstrap.min.css', type: 'css', desc: 'Bootstrap 5.2.3 CSS' },

  // 动画
  { key: 'gsap',         path: 'vendor/gsap/TweenMax.min.js',           type: 'js',  global: 'TweenMax', desc: 'GSAP TweenMax' },
  { key: 'anime',        path: 'vendor/anime@3.0.0/anime.min.js',       type: 'js',  global: 'anime',   desc: 'Anime.js 3.0' },

  // 图表
  { key: 'apexcharts',   path: 'vendor/apexcharts@3.46.0/apexcharts.min.js', type: 'js', global: 'ApexCharts', desc: 'ApexCharts 3.46.0' },
  { key: 'mermaid',      path: 'vendor/mermaid.min.js',                  type: 'js',  global: 'mermaid', desc: 'Mermaid' },

  // 日期
  { key: 'dayjs',        path: 'vendor/dayjs@1.11.21/dayjs.min.js',     type: 'js',  global: 'dayjs',   desc: 'Day.js 1.11.21' },
  { key: 'dayjs-zh',     path: 'vendor/dayjs@1.11.21/locale/zh-cn.js',  type: 'js',  desc: 'Day.js 中文语言包' },

  // 导出/文档
  { key: 'html2canvas',  path: 'vendor/html2canvas@1.4.1/html2canvas.min.js', type: 'js', global: 'html2canvas', desc: 'html2canvas 1.4.1' },
  { key: 'jspdf',        path: 'vendor/jspdf@2.5.2/jspdf.umd.min.js',   type: 'js',  global: 'jspdf',   desc: 'jsPDF 2.5.2' },
  { key: 'xlsx',         path: 'vendor/xlsx@0.20.3/xlsx.full.min.js',   type: 'js',  global: 'XLSX',    desc: 'SheetJS 0.20.3' },
  { key: 'marked',       path: 'vendor/marked.min.js',                   type: 'js',  global: 'marked',  desc: 'Marked MD→HTML' },

  // 图标
  { key: 'feather',      path: 'vendor/feather-icons/feather.min.js',   type: 'js',  global: 'feather', desc: 'Feather Icons' },
  { key: 'fa-css',       path: 'vendor/font-awesome@4.7.0/css/font-awesome.min.css', type: 'css', desc: 'Font Awesome 4.7.0' },

  // YiPet 工具
  { key: 'api-client',   path: 'utils/index.js',                         type: 'js',  global: 'YiPetApi', desc: 'YiPet HTTP API client' },
  { key: 'log',          path: 'utils/index.js',                         type: 'js',  global: 'LoggerUtils', desc: 'LoggerUtils' },

  // YiPet 样式
  { key: 'variables-css',path: 'styles/variables.css',                   type: 'css', desc: 'YiPet 设计变量' },
  { key: 'reset-css',    path: 'styles/reset.css',                       type: 'css', desc: 'YiPet CSS reset' },

  // 颜色主题
  { key: 'theme-quantum-violet', path: 'styles/themes/quantum-violet.css', type: 'css', desc: 'Quantum Violet 主题' },
  // ... 50+ 条目
];
```

---

## 注入策略

### 重复注入防护

```typescript
// src/content/bootstrap.ts
const YIPET_LOADED_KEY = "__YIPET_LOADED__";

async function bootstrap(): Promise<void> {
  // 防止重复注入
  if ((window as any)[YIPET_LOADED_KEY]) {
    console.debug("[YiPet] Already injected, skipping");
    return;
  }

  try {
    await injectCdnResources();
    (window as any)[YIPET_LOADED_KEY] = true;
    await injectMainWorldScripts();
  } catch (error) {
    // 注入失败，清除标志允许下次重试
    delete (window as any)[YIPET_LOADED_KEY];
    console.error("[YiPet] Bootstrap failed:", error);
  }
}
```

### 按需注入

```typescript
// src/content/cdn/injector.ts
export function createInjector(baseUrl: string): CdnInjector {
  const loaded = new Map<string, boolean>();

  function loadJS(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (loaded.has(path)) { resolve(false); return; }
      const el = document.createElement('script');
      el.src = resolveUrl(path);
      el.onload = () => { loaded.set(path, true); resolve(true); };
      el.onerror = () => reject(new Error(`Failed to load: ${path}`));
      (document.head || document.documentElement).appendChild(el);
    });
  }

  function loadCSS(path: string): boolean {
    if (loaded.has(path)) return false;
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = resolveUrl(path);
    (document.head || document.documentElement).appendChild(el);
    loaded.set(path, true);
    return true;
  }

  function loadByKey(key: string): Promise<boolean> | boolean {
    const entry = catalogByKey[key];
    if (!entry) { console.warn(`Unknown resource: "${key}"`); return false; }
    // 全局存在性检查短路重复注入
    if (entry.global && (window as any)[entry.global] !== undefined) {
      return entry.type === 'js' ? Promise.resolve(false) : false;
    }
    return entry.type === 'js' ? loadJS(entry.path) : loadCSS(entry.path);
  }

  async function injectAll(): Promise<void> {
    // CSS 优先（并行）
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'css') loadCSS(entry.path);
    }
    // JS 串行（保证依赖顺序）
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'js') {
        try { await loadJS(entry.path); } catch { /* continue */ }
      }
    }
  }

  return { loadJS, loadCSS, loadByKey, injectAll, isLoaded, getLoadedKeys };
}
```

### 脚本注入

```typescript
function loadJS(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (loaded.has(path)) { resolve(false); return; }
    const el = document.createElement('script');
    el.src = resolveUrl(path);
    el.onload = () => { loaded.set(path, true); resolve(true); };
    el.onerror = () => reject(new Error(`Failed to load: ${path}`));
    (document.head || document.documentElement).appendChild(el);
  });
}
```

### 样式注入

```typescript
function loadCSS(path: string): boolean {
  if (loaded.has(path)) return false;
  const el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = resolveUrl(path);
  (document.head || document.documentElement).appendChild(el);
  loaded.set(path, true);
  return true;
}
```

---

## 加载顺序控制

### 注入策略

`injectAll()` 采用两阶段加载：
1. **CSS 优先**：所有样式表并行加载，避免页面闪烁
2. **JS 串行**：脚本按 CDN_CATALOG 数组顺序依次加载，保证依赖关系

```
variables.css ──┐
reset.css ──────┤
themes/*.css ───┤ 并行加载（CSS 阶段）
bootstrap CSS ──┘
                  │
vue.js ──────────┤
jquery.js ───────┤
bootstrap.js ────┤
gsap.js ─────────┤ 串行加载（JS 阶段，按 catalog 顺序）
dayjs.js ────────┤
marked.js ───────┤
... ─────────────┘
```

### 加载时机

| 阶段 | 资源 | 说明 |
|------|------|------|
| 1. CSS | 所有 `type: 'css'` 条目 | 优先加载，避免页面闪烁 |
| 2. 核心框架 | vue, jquery | 最先加载的脚本 |
| 3. UI 库 | bootstrap, swiper | 依赖核心框架 |
| 4. 动画/图表 | gsap, anime, apexcharts, mermaid | 独立库 |
| 5. 工具 | dayjs, marked, xlsx, html2canvas | 独立工具 |
| 6. YiPet | utils/index.js, styles/*.css | 扩展自身资源 |

---

## 降级策略

### 资源加载失败处理

| 资源 | 级别 | 失败行为 | 降级影响 |
|------|------|----------|----------|
| vue.js | critical | 放弃整个注入流程，扩展不工作 | 无 YiPet 功能 |
| api-client (utils/index.js) | critical | 放弃整个注入流程 | 无 API 通信能力 |
| bootstrap.js | non-critical | 静默降级，聊天窗口仍可用 | 无 UI 组件库，使用原生 HTML 元素 |
| variables.css | non-critical | 静默降级 | 无 CSS 变量，使用浏览器默认值 |
| chat.css | non-critical | 静默降级 | 聊天窗口无样式，功能可用 |
| pet.css | non-critical | 静默降级 | 宠物无皮肤样式，仍可交互 |

### 重试机制

```typescript
async injectWithRetry(
  resource: CdnResource,
  maxRetries = 3,
  baseDelay = 500
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await this.inject(resource);
      return;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        if (resource.critical) throw error;
        console.warn(`[YiPet] CDN resource failed after ${maxRetries} retries: ${resource.path}`);
        return;
      }
      // 指数退避：500ms → 1000ms → 2000ms
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
}
```

---

## 聊天组件 CSS 拼接

### 构建时拼接

```typescript
// scripts/build-chat-css.ts
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

function collectCssFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectCssFiles(fullPath));
    } else if (extname(entry) === ".css") {
      files.push(fullPath);
    }
  }

  return files;
}

function buildChatCSS(): void {
  const componentsDir = "src/chat/components";
  const cssFiles = collectCssFiles(componentsDir);

  // 拼接所有组件 CSS
  const combined = cssFiles
    .map(f => {
      const relativePath = f.replace("src/chat/components/", "");
      return `/* ${relativePath} */\n${readFileSync(f, "utf-8")}`;
    })
    .join("\n\n");

  // 写入 dist
  const outputDir = "dist/cdn/styles";
  writeFileSync(join(outputDir, "chat.css"), combined);
  console.log(`Built chat.css from ${cssFiles.length} component CSS files`);
}

buildChatCSS();
```

### 就近放置约定

```
src/chat/components/
├── ChatWindow/
│   ├── ChatWindow.vue       # 组件
│   └── ChatWindow.css       # 样式（同目录，自动收集）
├── MessageBubble/
│   ├── MessageBubble.vue
│   └── MessageBubble.css
└── ChatInput/
    ├── ChatInput.vue
    └── ChatInput.css
```

**规则**：
- 每个组件的 CSS 文件与组件文件放在同一目录
- 构建脚本递归收集所有 `.css` 文件
- 拼接顺序按文件路径字母序，保证可预测性

---

## MV3 CSP 合规

### CSP 约束与处理

| 约束 | 说明 | 处理方式 | 违规后果 |
|------|------|----------|----------|
| 禁止远程代码 | 不能加载外部 JS | 所有 vendor 库本地化到 `public/cdn/vendor/` | 扩展拒绝加载 |
| 禁止 eval | 不能使用 `eval()` / `new Function()` | 代码中避免动态执行 | CSP 违规报错 |
| 禁止内联脚本 | 不能使用 `<script>...</script>` | 所有脚本通过 `src` 属性加载 | CSP 违规报错 |
| 资源路径限制 | 只能加载扩展内资源 | 使用 `chrome.runtime.getURL` 获取路径 | 404 错误 |
| web_accessible_resources | 必须声明可访问的资源 | manifest.json 中配置 | 资源不可访问 |

### manifest.json 配置

```json
{
  "web_accessible_resources": [
    {
      "resources": [
        "cdn/vendor/*",
        "cdn/styles/*",
        "cdn/utils/*",
        "assets/chat.js",
        "assets/bootstrap.js"
      ],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 资源路径获取

```typescript
// 正确：通过 chrome.runtime.getURL 获取扩展内资源路径
const vueUrl = chrome.runtime.getURL("cdn/vendor/vue@3.5.13/vue.global.prod.js");
// → "chrome-extension://abc123def456/cdn/vendor/vue@3.5.13/vue.global.prod.js"

// 错误：硬编码路径或使用外部 CDN
// const vueUrl = "https://unpkg.com/vue@3.5.0/dist/vue.global.prod.js";
```

---

## 性能优化

### 资源预加载

```typescript
// 在 bootstrap 早期阶段预加载关键资源
function preloadCriticalResources(): void {
  const criticalResources = CDN_CATALOG.filter(r => r.critical);

  for (const resource of criticalResources) {
    const url = chrome.runtime.getURL(resource.path);

    if (resource.type === "script") {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = url;
      document.head.appendChild(link);
    }
  }
}
```

### 缓存策略

| 策略 | 说明 | 实现 |
|------|------|------|
| 浏览器缓存 | 扩展资源 URL 包含 extension ID，天然支持缓存 | 无需额外配置 |
| 注入状态缓存 | `this.injected` Set 防止同一资源重复注入 | 内存级 |
| 全局标志 | `__YIPET_LOADED__` 防止整个注入流程重复 | window 属性 |

### 体积优化

```typescript
// rsbuild.config.cdn.ts
export default {
  output: {
    // CDN 资源使用生产模式压缩
    minify: true,
    // 禁用文件名哈希（manifest 引用固定路径）
    filenameHash: false,
  },
  tools: {
    rspack: {
      optimization: {
        // 外部化大型依赖，不打包到 CDN
        minimize: true,
      },
    },
  },
};
```

---

## 特殊页面处理

### 已有 Vue 的页面

```typescript
// 检测页面是否已有 Vue
function detectExistingVue(): boolean {
  return typeof (window as any).Vue !== "undefined";
}

async function injectVue(): Promise<void> {
  if (detectExistingVue()) {
    // 页面已有 Vue，但仍注入扩展自己的版本
    // 原因：版本可能不兼容，扩展需要自己的 Vue 实例
    console.debug("[YiPet] Page has existing Vue, injecting own version");

    // 保存页面原有的 Vue 引用
    (window as any).__PAGE_VUE__ = (window as any).Vue;
  }

  await injectScript(chrome.runtime.getURL("cdn/vendor/vue@3.5.13/vue.global.prod.js"));

  // 保存扩展的 Vue 引用
  (window as any).__YIPET_VUE__ = (window as any).Vue;

  // 恢复页面原有的 Vue（如果存在）
  if ((window as any).__PAGE_VUE__) {
    (window as any).Vue = (window as any).__PAGE_VUE__;
  }
}
```

### CSP 严格的页面

部分网站有严格的 CSP 策略，可能阻止扩展注入脚本。处理方式：

```typescript
async function injectWithCspFallback(resource: CdnResource): Promise<void> {
  try {
    await this.inject(resource);
  } catch (error) {
    if (isCspError(error)) {
      // CSP 阻止，尝试使用 blob URL 方式
      const url = chrome.runtime.getURL(resource.path);
      const response = await fetch(url);
      const code = await response.text();
      const blob = new Blob([code], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);

      try {
        await this._injectScript(blobUrl);
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    } else {
      throw error;
    }
  }
}
```

---

## 反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 使用外部 CDN | `<script src="https://unpkg.com/vue">` | 本地化到 `public/cdn/vendor/`，通过 `chrome.runtime.getURL` 加载 | MV3 禁止远程代码执行 |
| 不检查重复注入 | 每次页面加载都注入 | 检查 `window.__YIPET_LOADED__` 短路 | 重复注入导致 Vue 多次初始化 |
| 不检查全局已加载 | 已有 `window.Vue` 仍注入 | `loadByKey` 检查 `global` 属性，已存在则跳过 | 覆盖宿主页面功能 |
| 不处理加载失败 | 核心资源失败后继续执行 | 调用方捕获异常 | Vue 未加载时无法挂载应用 |
| 内联脚本 | `<script>console.log("hi")</script>` | 所有代码通过外部脚本文件加载 | MV3 CSP 禁止内联脚本 |
| 未声明 web_accessible_resources | 资源文件不在 manifest 声明中 | manifest.json 中声明所有需注入的资源 | 资源 404 不可访问 |
| 忽略页面已有框架 | 直接覆盖 `window.Vue` | `loadByKey` 检查 `global` 属性，已存在则跳过 | 破坏宿主页面功能 |

---

## 约束

### 必须遵守
- 所有资源本地化到 `public/cdn/vendor/`，使用 `chrome.runtime.getURL` 加载
- 注入前检查 `window.__YIPET_LOADED__` 防止重复
- 资源按 CDN_CATALOG 数组顺序加载（CSS 并行 → JS 串行）
- 通过 `loadByKey` 按需加载，`global` 属性检查避免重复注入
- manifest.json 中声明所有 `web_accessible_resources`
- 注入失败时清除 `__YIPET_LOADED__` 标志，允许下次重试

### 禁止
- 不使用外部 CDN 加载 JS 资源
- 不使用 `eval()` 或 `new Function()`
- 不使用内联 `<script>` 标签
- 不覆盖宿主页面的 `window.Vue`（`global` 属性检查短路）
- 不在 manifest.json 中遗漏 `web_accessible_resources` 声明