# YryCmdHead · 命令头部组件

> Vue 3 组件 · 自定义元素 `<yry-cmd-head>` · 管线命令头部区域

## 文件

```
yry-cmd-head/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-cmd-head-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-cmd-head/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-cmd-head/index.js"></script>
<div id="cmd-head-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryCmdHead, { /* props */ }).mount('#cmd-head-app');
  }
  if (window.YryCmdHead) mount();
  else document.addEventListener('yry-cmd-head-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `title` | String | ✅ | — | 标题 |
| `subtitle` | String | — | — | 副标题 |
| `stage` | String | — | — | 步骤标识 |
| `icon` | String | — | — | 图标 |
| `count` | Number | — | — | 命令数 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 头部 | `role="banner"` | 1.3.1 |
| 标题 | `aria-level="2"` | 1.3.1 |
| 计数 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |