# YrY CDN · Shared 共享基线

> 所有页面的必备基线资源: Reset · 动画 · 面包屑 · 横向导航 · 导出工具栏 · Toast · 健康报告容器

## 文件

```
shared/
├── index.html         # 测试预览页 (所有 CSS 组件 + JS API 交互演示)
├── index.css          # 全局 Reset + 面包屑 + 导航 + 工具栏 + Toast + 键盘提示 + 页脚 + 健康报告容器
├── index.js           # YrY.* 全局 API (9 个工具函数)
├── vue-ce-loader.js   # YrYVueCE.define(options) — Vue3 custom-element 统一注册 loader
└── html-sanitize.js  # YrYHtml.sanitize(html) — v-html 前的白名单过滤
```

## CSS 组件

| 组件 | CSS 类 | 说明 |
|------|--------|------|
| 面包屑 | `.yry-breadcrumb` · `.yry-bc-sep` · `.yry-bc-current` | 通用面包屑导航 |
| 横向导航 | `.yry-cross-nav` · `.yry-cross-link` · `.yry-cross-sep` | 跨页链接导航 |
| 导出工具栏 | `.yry-toolbar` · `.yry-toolbar-toggle` · `.yry-toolbar-actions` | 导出操作按钮组 |
| Toast 提示 | `.yry-toast` | 浮动消息提示 |
| 键盘提示 | `.yry-kbd-hint` | 快捷键提示标签 |
| 页脚 | `.yry-footer` | 统一页脚 |
| 健康报告 | `.h-container` · `.h-tabs` · `.h-tab` · `.h-panel` · `.h-score-ring` | 健康报告专用布局 |

## JS API (`window.YrY`)

| 分类 | 函数 | 说明 |
|------|------|------|
| 反馈 | `YrY.toast(msg, dur?)` | 显示 Toast 消息 |
| | `YrY.copyCmd(el, cmd)` | 复制按钮交互 |
| | `YrY.clipboardWrite(text, ok?, fail?)` | 剪贴板写入 |
| 面板 | `YrY.switchPanel(name, tab?, panel?)` | 标签面板切换 |
| | `YrY.initTabs(container?)` | 自动绑定标签点击 |
| 折叠 | `YrY.initSuiteToggle(container?)` | 折叠套件初始化 |
| | `YrY.expandAllSuites(scope?)` | 展开全部 |
| | `YrY.collapseAllSuites(scope?)` | 收起全部 |
| 代码 | `YrY.initCodeCopy(container?)` | 代码块点击复制 |
| | `YrY.initStepToggle(container?)` | 步骤条切换 |
| 工具 | `YrY.fmtDur(ms)` | 格式化耗时 |
| | `YrY.esc(str)` | HTML 转义 |

## 加载要求

在所有页面中**最先加载**:

```html
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
<script src="../../../../cdn/shared/index.js"></script>
```

Category A (Mono 主题) 页面需在 shared 前加载字体:

```html
<link rel="stylesheet" href="../../../../cdn/fonts/index.css">
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
```

## 自动初始化

`shared/index.js` 加载后自动绑定:
- `pre` 元素点击复制内容
- `.step-header` 点击切换 `.step-body.open`

## 性能基线

| 资源 | 体积 (未压缩) | 体积 (gzip) | 体积 (brotli) | 加载优先级 |
|------|:---:|:---:|:---:|:---:|
| index.css | ~18KB | ~5KB | ~4KB | P0 最高 |
| index.js | ~30KB | ~10KB | ~8KB | P0 最高 |
| vue-ce-loader.js | ~3KB | ~1KB | ~1KB | P1 |
| html-sanitize.js | ~8KB | ~3KB | ~2KB | P1 |

## 加载顺序约束

| 顺序 | 资源 | 依赖 | 阻断 |
|:---:|------|------|:---:|
| 1 | `shared/index.css` | — | ✅ |
| 2 | `theme/index.css` (或 theme-mono) | shared | ✅ |
| 3 | 组件 CSS | shared + theme | ✅ |
| 4 | `vue.global.prod.js` | — | ✅ |
| 5 | `shared/index.js` | Vue 3 | ✅ |
| 6 | 组件 JS | shared.js | ✅ |

## API 错误处理

| API | 失败模式 | 降级 | 调用方提示 |
|-----|---------|------|------|
| `toast` | DOM 未就绪 | console.warn | 不阻塞 |
| `copyCmd` | 权限拒绝 | execCommand 回退 | toast 提示 |
| `switchPanel` | 面板不存在 | 无操作 + 日志 | 静默 |
| `clipboardWrite` | 非 HTTPS | 回退到 textarea | 返回 false |
| `initTabs` | 容器不存在 | 跳过 | 静默 |
| `fmtDur` | NaN 输入 | 返回 '—' | 静默 |
| `esc` | 非字符串 | 转为字符串 | 静默 |

## Vue CE Loader 使用

```javascript
// 统一注册 Vue 3 自定义元素
YrYVueCE.define({
  name: 'yry-my-component',
  template: '<div>...</div>',
  props: { foo: String },
  emits: ['my-event']
});
// 等价于
// const Ctor = Vue.defineCustomElement(options);
// customElements.define('yry-my-component', Ctor);
```

| 优势 | 实现 |
|------|------|
| 统一注册 | 自动处理 name + customElements.define |
| 错误隔离 | IIFE + try/catch |
| 事件派发 | 自动派发 `{name}-ready` 事件 |
| 模板加载 | 自动 fetch + DOMParser |

## HTML Sanitize 使用

```javascript
// v-html 前过滤
element.innerHTML = YrYHtml.sanitize(userInput);

// 白名单
const ALLOWED = {
  tags: ['div', 'span', 'p', 'a', 'strong', 'em', 'code', 'pre'],
  attrs: { 'a': ['href', 'title'], 'code': ['class'] },
  protocols: ['http', 'https', 'mailto']
};
```

| 威胁 | 缓解 |
|------|------|
| XSS | 标签白名单 + 属性过滤 |
| JS 注入 | 移除 `<script>` / `on*` |
| URL 注入 | 协议白名单 |
| CSS 注入 | 移除 `style` 属性 |

## 浏览器兼容性

| 浏览器 | 最低版本 | 测试状态 | 降级 |
|--------|:---:|:---:|------|
| Chrome | 90+ | ✅ | — |
| Firefox | 88+ | ✅ | — |
| Safari | 14+ | ✅ | — |
| Edge | 90+ | ✅ | — |
| IE 11 | ❌ | — | 不支持 CSS 变量 |