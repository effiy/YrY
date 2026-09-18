---
title: CDN 资源注入
tags: [yipet, cdn, injection, loader, chrome-extension, mv3, csp]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-15
source: YiPet
type: pattern
roles: [engineer]
benefit: "50+ 第三方库本地化管理、按需注入、MV3 CSP 合规"
status: active
---

# CDN 资源注入

> Chrome MV3 扩展的资源注入模式：50+ 第三方库的本地化管理、按需注入策略、加载顺序控制、重复注入防护、MV3 CSP 合规。

**相关文档**：[扩展架构](./02-架构-扩展架构.md) · [构建部署](../流程规范/05-流程-构建部署.md)

## 一、核心挑战

MV3 扩展需将 Vue 3、Bootstrap 等大型库注入宿主页面，面临四个约束：

1. **资源必须本地化**（MV3 CSP 禁止远程代码）
2. **依赖顺序**（Bootstrap 依赖 Vue）
3. **不可重复注入**（SPA 多次触发 content_scripts）
4. **加载失败需降级**（非关键资源不阻塞核心功能）

## 二、资源目录

```
public/cdn/
├── vendor/                   # 50+ 第三方库（版本化路径）
│   ├── vue@3.5.13/           # Vue 3.5.13 运行时
│   ├── bootstrap@5.2.3/      # Bootstrap 5.2.3 (JS + CSS)
│   ├── jquery@3.7.1/         # jQuery 3.7.1
│   ├── dayjs@1.11.21/        # Day.js + 插件
│   ├── gsap/, apexcharts@3.46.0/, marked, ...
│   └── ...                   # 50+ 条目
├── styles/                   # 全局样式
│   ├── variables.css         # CSS 自定义属性
│   ├── chat.css              # 聊天组件样式（构建时拼接）
│   ├── pet.css               # 宠物皮肤样式
│   └── themes/               # 5 个颜色主题
└── utils/
    └── index.js              # 统一工具包
```

## 三、资源目录（CDN_CATALOG）

```typescript
interface CdnEntry {
  key: string;        // 短键，如 'vue'
  path: string;       // 相对路径，如 'vendor/vue@3.5.13/vue.global.prod.js'
  type: 'js' | 'css';
  global?: string;    // window 属性名，用于检测已加载
}

// 示例条目
{ key: 'vue',       path: 'vendor/vue@3.5.13/vue.global.prod.js', type: 'js', global: 'Vue' }
{ key: 'bootstrap', path: 'vendor/bootstrap@5.2.3/js/bootstrap.bundle.min.js', type: 'js', global: 'bootstrap' }
{ key: 'marked',    path: 'vendor/marked.min.js', type: 'js', global: 'marked' }
{ key: 'api-client',path: 'utils/index.js', type: 'js', global: 'YiPetApi' }
```

## 四、注入策略

### 加载顺序

```
阶段 1 — CSS 并行：variables.css → chat.css → pet.css → themes/*.css
阶段 2 — JS 串行（保证依赖顺序）：
  vue → jquery → bootstrap → gsap → dayjs → marked → api-client → ...
```

### 重复注入防护

两层检查：
1. `window.__YIPET_LOADED__` → 整流程短路
2. `window[entry.global]` → 单资源短路（如 `window.Vue` 已存在则跳过）

### 加载失败降级

| 资源级别 | 资源 | 失败行为 |
|----------|------|----------|
| critical | vue, api-client | 放弃注入，清除标志允许重试 |
| non-critical | bootstrap, gsap, 样式 | 静默降级，核心功能可用 |

**重试**：关键资源失败重试 3 次，指数退避（500ms → 1000ms → 2000ms）。

## 五、MV3 CSP 合规

| 约束 | 处理方式 |
|------|----------|
| 禁止远程代码 | 所有 vendor 本地化到 `public/cdn/vendor/` |
| 禁止 eval/new Function | 代码避免动态执行 |
| 禁止内联 `<script>` | 所有脚本通过 `src` 属性加载 |
| 资源路径限制 | `chrome.runtime.getURL` 获取扩展内路径 |
| web_accessible_resources | manifest.json 声明所有需注入资源 |

## 六、聊天组件 CSS 拼接

构建时递归收集 `src/chat/components/` 下所有 `.css` 文件，按路径字母序拼接为 `dist/cdn/styles/chat.css`。组件 CSS 与组件文件同目录就近放置。

## 七、特殊页面处理

| 场景 | 策略 |
|------|------|
| 页面已有 Vue | `loadByKey` 检测 `window.Vue`，已存在跳过注入 |
| CSP 严格页面 | 尝试 blob URL 降级方案 |
| iframe 页面 | 仅顶层窗口注入（`window.top === window.self`） |
| SPA 路由变化 | MutationObserver + URL 监听，重新评估注入 |

## 八、反模式

| 反模式 | 正确做法 | 原因 |
|--------|----------|------|
| 使用外部 CDN | 本地化 + `chrome.runtime.getURL` | MV3 禁止远程代码 |
| 不检查重复注入 | `__YIPET_LOADED__` + `global` 检查 | 重复初始化 |
| 内联 `<script>` | 外部脚本文件 `src` 加载 | MV3 CSP 禁止 |
| 未声明 web_accessible | manifest.json 声明所有资源 | 资源 404 |
| 忽略页面已有框架 | `global` 属性检查短路 | 破坏宿主页面 |

## 九、约束

**必须遵守：**
- 所有资源本地化到 `public/cdn/vendor/`
- 注入前检查 `__YIPET_LOADED__`
- CSS 并行 → JS 串行（保证依赖顺序）
- manifest.json 声明所有 `web_accessible_resources`
- 注入失败清除标志，允许下次重试

**禁止：**
- 不使用外部 CDN 加载 JS
- 不使用 `eval()` / `new Function()`
- 不使用内联 `<script>` 标签
- 不覆盖宿主页面 `window.Vue`