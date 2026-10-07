---

doc_type: module
prd_task_id: "YP-09-M10"
title: "国际化与主题系统 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 3
source_prd: "08-prd-国际化与主题系统.md"

type: task
---

# 国际化与主题系统 — 开发方案

> 来源 PRD：[08-prd-国际化与主题系统.md](../../prds/2026-09/08-prd-国际化与主题系统.md)
> 需求编号：YP-09-M10 · 优先级：P2 · 人天：3d

> **文档职责**：本文档定义 i18n 多语言框架集成、主题系统（暗色/浅色/跟随系统）、RTL 布局适配的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、国际化（i18n）实现

### 1.1 技术栈

```
i18next (核心) + react-i18next (React 集成)
  ├─ i18next-browser-languagedetector (语言检测)
  └─ i18next-http-backend (按需加载语言包)
```

### 1.2 初始化配置

```typescript
// i18n.ts — 国际化初始化入口
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en_US',           // 缺失翻译回退到英语
    supportedLngs: SUPPORTED_LANGS, // 22 种语言
    interpolation: { escapeValue: false }, // React 已防 XSS
    detection: {
      order: ['store', 'navigator'], // 优先读取用户配置
      caches: [],                     // 不由 detector 缓存, 由 store 管理
    },
    resources: {},                    // 编译期空, 运行时按需加载
  });
```

### 1.3 语言包加载策略

```typescript
// 语言包按需动态导入 (Webpack/Vite code splitting)
const languageLoader = {
  zh_CN: () => import('../locales/zh_CN/translation.json'),
  en_US: () => import('../locales/en_US/translation.json'),
  ja_JP: () => import('../locales/ja_JP/translation.json'),
  // ... 共 22 个语言包
};

async function switchLanguage(lang: string): Promise<void> {
  // 1. 动态加载语言包 (仅首次, 后续内存缓存)
  const module = await languageLoader[lang]?.();
  if (!module) {
    console.warn(`语言包 ${lang} 缺失, 回退英语`);
    return i18n.changeLanguage('en_US');
  }
  
  // 2. 注册资源
  i18n.addResourceBundle(lang, 'translation', module.default, true, true);
  
  // 3. 切换
  await i18n.changeLanguage(lang);
  
  // 4. 持久化到 store
  await invoke('set_config', { key: 'app_language', value: lang });
  
  // 5. 设置 HTML dir 属性 (RTL/LTR)
  const isRTL = RTL_LANGS.includes(lang);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
}
```

**决策理由**：按需加载而非打包全部语言包，减少初始加载体积。22 个语言包总大小约 1.1MB（50KB/包），全部打包会导致初始加载过大。

### 1.4 RTL 布局适配

```css
/* 使用 CSS 逻辑属性, 自动适配 RTL/LTR */
.translate-window {
  margin-inline-start: 12px;  /* LTR → margin-left, RTL → margin-right */
  padding-inline-end: 8px;
  text-align: start;          /* LTR → left, RTL → right */
}

/* 图标镜像 */
[dir="rtl"] .icon-back {
  transform: scaleX(-1);
}
[dir="rtl"] .icon-forward {
  transform: scaleX(-1);
}
```

---

## 二、主题系统实现

### 2.1 next-themes 集成

```typescript
// ThemeProvider.tsx — 封装 next-themes
import { ThemeProvider as NextThemesProvider } from 'next-themes';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"          // HTML 属性名
      defaultTheme="system"           // 默认跟随系统
      enableSystem={true}             // 启用系统主题监听
      storageKey="app_theme"          // 优先读取用户配置
      themes={['light', 'dark', 'system']}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 2.2 CSS 变量方案

```css
/* theme.css — NextUI 兼容 */
:root[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b6b6b;
  --color-border: #e0e0e0;
  --color-accent: #3b82f6;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
}

:root[data-theme="dark"] {
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-text-primary: #e5e5e5;
  --color-text-secondary: #a0a0a0;
  --color-border: #3d3d3d;
  --color-accent: #60a5fa;
  
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
}

/* 高对比度模式 (accessibility) */
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #000000;
    --color-bg-primary: #ffffff;
    --color-border: #000000;
    --color-accent: #0000ff;
  }
}
```

### 2.3 字体系统

```rust
// Rust 侧 — 获取系统可用字体
#[tauri::command]
fn font_list() -> Vec<String> {
    #[cfg(target_os = "macos")]
    {
        // 遍历 /System/Library/Fonts/ 和 ~/Library/Fonts/
    }
    #[cfg(target_os = "windows")]
    {
        // 遍历 C:\Windows\Fonts\
    }
    #[cfg(target_os = "linux")]
    {
        // fc-list 命令输出
    }
}
```

```typescript
// 前端 — 字体切换
function applyFont(fontFamily: string, fallback: string): void {
  const root = document.documentElement;
  root.style.setProperty('--font-sans', `"${fontFamily}", "${fallback}", sans-serif`);
  
  // CJK fallback 检测
  if (!fontCoversCJK(fontFamily)) {
    root.style.setProperty('--font-sans', `"${fontFamily}", "PingFang SC", sans-serif`);
  }
}
```

---

## 三、设计决策

| 决策 | 理由 |
|------|------|
| 语言包按需加载 | 22 个语言包全量加载增加 1.1MB 初始体积；按需加载仅用户当前语言 |
| CSS 逻辑属性而非 JS 方向检测 | 逻辑属性是 CSS 标准方案，浏览器原生支持，比 JS 动态修改 style 更稳定 |
| NextUI + next-themes 组合 | NextUI 原生支持 next-themes 的 data-theme 属性，零配置集成暗色模式 |
| en_US 作为 fallback | 新 UI 文本先加入 en_US，其他语言通过社区翻译渐进补全 |
| Rust 侧获取字体列表 | 前端无法访问系统字体 API，必须通过 Tauri command 桥接 |

---

## 四、性能优化

| 优化 | 措施 |
|------|------|
| 语言包体积 | 每个语言包 ≤ 50KB，使用 JSON minify |
| 主题切换无闪烁 | next-themes 在 `<head>` 注入 inline script，渲染前已完成 data-theme 设置 |
| i18next 初始化 | 异步加载，不阻塞首屏渲染；使用 Suspense fallback |
| 字体列表缓存 | Rust 侧缓存字体列表，仅在设置页打开时刷新 |

---

## 五、错误处理

| 错误 | 处理 |
|------|------|
| 语言包 JSON 格式错误 | 回退 en_US，控制台输出解析错误 |
| 语言包文件缺失 | 回退 en_US，提示"语言包缺失" |
| 用户字体不支持 CJK | 自动检测并回退到 system-ui 或 PingFang SC |
| 系统不支持 matchMedia | 降级为手动主题切换 |
| 极深/浅自定义主题色 | 自动限制对比度 ≥ 4.5:1 (WCAG AA) |

---

## 六、交叉引用

- 开发方案: [07-prd-task-配置存储与备份实现](./07-prd-task-配置存储与备份实现.md)（配置持久化）
- PRD: [08-prd-国际化与主题系统](../../prds/2026-09/08-prd-国际化与主题系统.md)