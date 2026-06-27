# YryFooterNote · 页脚注释组件

> Vue 3 组件 · 自定义元素 `<yry-footer-note>` · 页面底部注释

## 文件

```
yry-footer-note/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-footer-note-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-footer-note/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-footer-note/index.js"></script>
<div id="footer-note-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryFooterNote, { text: '© 2026 YrY', links: [...] }).mount('#footer-note-app');
  }
  if (window.YryFooterNote) mount();
  else document.addEventListener('yry-footer-note-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `text` | String | ✅ | — | 注释文本 |
| `links` | Array | — | `[]` | 链接数组 `[{href, text, target}]` |
| `icon` | String | — | — | 前缀图标 |
| `align` | String | — | `center` | 对齐: left/center/right |
| `variant` | String | — | `default` | 样式: default/compact/prominent |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 2KB | 1.5KB | ✅ |
| CSS 体积 | ≤ 1KB | 0.8KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## variant 样式

| variant | 用途 | 字号 | 颜色 |
|---------|------|:---:|------|
| `default` | 标准 | 0.72rem | text2 |
| `compact` | 紧凑 | 0.68rem | text3 |
| `prominent` | 强调 | 0.76rem | text1 |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 注释容器 | `role="contentinfo"` | 1.3.1 |
| 链接 | `aria-label` | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |