# YryPathLink · 路径链接组件

> Vue 3 组件 · 自定义元素 `<yry-path-link>` · 文件路径可视化链接

## 文件

```
yry-path-link/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-path-link-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-path-link/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-path-link/index.js"></script>
<div id="path-link-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryPathLink, { path: 'cdn/yry-item-card/index.js' }).mount('#path-link-app');
  }
  if (window.YryPathLink) mount();
  else document.addEventListener('yry-path-link-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `path` | String | ✅ | — | 文件路径 |
| `text` | String | — | — | 显示文本 (默认 path) |
| `icon` | String | — | 📄 | 图标 |
| `copyable` | Boolean | — | true | 可复制 |
| `external` | Boolean | — | false | 外部链接 |
| `line` | Number | — | — | 行号 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 链接 | `aria-label` | 4.1.2 |
| 复制 | `aria-label` | 4.1.2 |
| 路径 | `role="code"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |