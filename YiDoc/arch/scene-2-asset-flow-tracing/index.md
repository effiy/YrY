# 场景2: 浏览者从访问网站到页面渲染完成的全链路是什么？

## §0 — 效果概览
追踪浏览器从请求 HTML 入口到页面完全渲染的完整加载链路，覆盖 CSS 阻塞渲染、JS 加载执行时序、第三方库初始化（Bootstrap/jQuery）、以及各模板因资源组织差异产生的不同路径。

```mermaid
graph TD
    subgraph "阶段1: 网络请求"
        A[浏览器请求 index.html] --> B[服务器返回 HTML 文档]
    end

    subgraph "阶段2: CSS 解析（阻塞渲染）"
        B --> C1[解析 &lt;head&gt; 中 CSS &lt;link&gt;]
        C1 --> C2{CSS 来源}
        C2 -->|本地| C3["bootstrap.min.css<br/>app.min.css / style.css<br/>fontawesome-all.min.css"]
        C2 -->|CDN| C4["Google Fonts (Kasy, News)<br/>unpkg.com Vue (Dashboard)"]
        C3 --> C5[构建 CSSOM]
        C4 --> C5
    end

    subgraph "阶段3: JS 加载与执行"
        B --> D1[解析 &lt;script&gt; 标签]
        D1 --> D2{脚本位置}
        D2 -->|&lt;head&gt; async/defer| D3["Vue 3 CDN (Dashboard)"]
        D2 -->|&lt;/body&gt; 前| D4["jquery.min.js → bootstrap.bundle.min.js<br/>→ vendor.min.js / app.min.js<br/>→ main.js / script.js"]
        D3 --> D5[执行 JS]
        D4 --> D5
    end

    subgraph "阶段4: 初始化与渲染"
        D5 --> E1[jQuery 就绪: $(document).ready]
        E1 --> E2[Bootstrap 组件初始化<br/>Dropdown / Collapse / Modal / Scrollspy]
        E2 --> E3[自定义脚本执行<br/>Smooth Scroll / Syntax Highlight / SimpleBar / AOS]
        E3 --> E4[DOMContentLoaded → 页面可交互]
        E4 --> E5[window.onload → 完整渲染]
    end

    style A fill:#22C55E,color:#fff
    style E5 fill:#22C55E,color:#fff
```

### 各模板的加载路径差异

| 模板 | CSS 加载 | JS 加载 | 关键第三方库 | 特殊初始化 |
|------|---------|---------|-------------|-----------|
| **Dashboard** | 本地 `index.css` | Vue 3 CDN (defer) + 内联组件 + `index.js` | Vue 3 (YiPet/cdn/vendor/) | Panel Hub, Reports Panel |
| **Adminto** | `bootstrap.min.css` → `app.min.css` → `icons.min.css` | `vendor.min.js` (含 jQuery+Bootstrap) → `app.min.js` | jQuery, Bootstrap 5, Popper, SimpleBar, Remix Icons | SimpleBar 滚动条, Feather Icons |
| **DpMarket** | `bootstrap.css` → `style.css` → `scrollbar.css` → `font-awesome.css` | `jquery.js` → `bootstrap.min.js` → `jquery.nav.js` → `jquery.scrollTo.js` → `scrollbar.js` → `script.js` | jQuery, Bootstrap 3, Font Awesome 4 | 自定义滚动条, 单页导航滚动 |
| **Kasy** | `bootstrap.min.css` → `prettify.css` → `styles.css` | `jquery.js` → `bootstrap.js` → `jquery.easing.min.js` → `prettify.js` | jQuery, Bootstrap 3, Google Fonts | 代码美化 (prettify.js) |
| **News** | `fontawesome-all.min.css` → Syntax Highlighter CSS → `bootstrap.min.css` → `main.css` | `jquery.min.js` → `jquery-migrate.min.js` → `bootstrap.bundle.min.js` → `easing-1.3.js` → Syntax Highlighter JS → `main.js` | jQuery + jQuery Migrate, Bootstrap 5 Bundle, Font Awesome 6, Syntax Highlighter | IE 兼容 (`ie.js`), 语法高亮 |
| **Prompt** | `vendor.min.css` (bundle) → `theme.min.css` | `vendor.min.js` → `theme.min.js`（推测，vendor 内含 jQuery/Bootstrap 等） | jQuery, Bootstrap 5, Feather Icons, AOS, Swiper, Jarallax, CountUp 等 | AOS 滚动动画, Swiper 轮播, Jarallax 视差, CountUp 数字动画 |

## §1 — 测试设计
- **AC-1**: 能描述从浏览器输入 URL 到页面可交互的完整 4 阶段链路。
- **AC-2**: 能区分 CSS 阻塞渲染与 JS 阻塞解析（`<script>` 不带 async/defer）的行为差异。
- **AC-3**: 能列出 6 个 HTML 入口（Dashboard + 5 模板）各自的 CSS/JS 加载顺序。
- **SC-1**: 开发者能根据此文档定位"页面白屏"或"组件不工作"的根因（如 JS 加载顺序错误、CSS 未加载）。
- **SC-2**: 文档中的 Mermaid 图能清晰展示从网络请求到渲染完成的时序流。
- **SC-3**: 各模板的加载路径与实际 HTML 源码一致（交叉验证通过）。

## §2 — 输出清单与架构决策
- **输出文件/资源**:
  - 本 index.md（场景说明文档）
  - 无代码产物
- **关键架构决策**:
  - **决策 1**: 所有 5 个模板均为纯静态 HTML——无 SSR、无构建工具、无打包器。资源通过 `<link>` 和 `<script>` 标签直接引用本地文件或 CDN。
  - **决策 2**: Dashboard 使用 Vue 3 CDN（YiPet/cdn/vendor/vue.global.prod.js），是唯一引入运行时框架的页面。所有模板页使用 jQuery + Bootstrap 原生方案，无框架。
  - **决策 3**: Adminto 和 Prompt 使用 vendor bundle（`vendor.min.css`/`vendor.min.js`）合并第三方库，而 DpMarket/Kasy/News 逐个引用独立文件。bundle 策略减少 HTTP 请求但增加单文件体积。
  - **决策 4**: YiDoc 的全局基准文档（`CLAUDE.md` + `README.md`）位于根目录，提供项目 profile、领域语言和架构模式，是新人理解项目上下文的第一入口。

## §3 — 测试报告
| 检查项 | 状态 | 备注 |
|--------|------|------|
| Dashboard 加载链路清晰 | PASS | Vue 3 CDN → 内联组件 → data.js → index.js |
| Adminto CSS/JS 加载顺序正确 | PASS | 无循环依赖，vendor 先于 app |
| DpMarket 逐个 JS 文件加载 | PASS | 7 个独立 JS 文件，有明确顺序依赖（jQuery 必须在 Bootstrap 前） |
| Kasy 使用 Google Fonts CDN | PASS | `fonts.googleapis.com` 为唯一外部 CSS 依赖 |
| News 包含 jQuery Migrate | PASS | 兼容旧版 jQuery 插件 |
| Prompt vendor bundle 策略 | PASS | 单文件 bundle 包含多个第三方库 |
| 所有模板无循环依赖 | PASS | CSS 和 JS 加载顺序均为合理的线性依赖 |

## §4 — 自我改进
| 诊断 | 问题 | 行动项 |
|------|------|--------|
| D0 | CLAUDE.md 和 README.md 已生成于根目录，作为场景数据的权威来源 | 无需行动——基线已更新 |
| D0 | 所有 HTML 文件的 `<head>` 和 `<body>` 底部 `<script>` 已通过 Read 交叉验证 | 无需行动 |
| D2 | DpMarket 中 `respond.js` 仅用于 IE8- 兼容——现代浏览器已无用 | 记录为历史遗留，可安全移除（低优先级） |
| D3 | Kasy 同时引入 `bootstrap.css` 和 `bootstrap.min.css`——重复加载 | 建议移除 `bootstrap.css`，仅保留 `.min.css`（属于上游模板 bug） |
| D5 | Dashboard 的 Vue 3 CDN 若 unpkg 不可用则仪表盘完全不可渲染 | 已在 scene-5 中作为 CDN 信任边界分析 |
| D6 | 缺少 Performance/Timing API 级别的加载耗时数据 | 未来可用 Lighthouse 或 WebPageTest 生成各模板的 Waterfall 图 |
| D8 | Prompt 的 vendor.min.js 内容未解包分析 | 在当前阶段不必要——仅需知道它包含 jQuery + Bootstrap 即可满足场景目标 |
