# YryQuickstart · 快速开始组件

> Vue 3 组件 · 自定义元素 `<yry-quickstart>` · 快速入门指南

## 文件

```
yry-quickstart/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-quickstart-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-quickstart/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-quickstart/index.js"></script>
<div id="quickstart-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryQuickstart, { /* props */ }).mount('#quickstart-app');
  }
  if (window.YryQuickstart) mount();
  else document.addEventListener('yry-quickstart-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `steps` | Array | ✅ | `[]` | 快速开始步骤 |
| `title` | String | — | — | 标题 |
| `subtitle` | String | — | — | 副标题 |
| `layout` | String | — | `vertical` | 布局: vertical/horizontal |
| `numbered` | Boolean | — | true | 编号 |

## 步骤数据 schema

```json
{
  "title": "安装",
  "cmd": "npm install yry-cdn",
  "desc": "或通过 jsDelivr CDN 引用",
  "duration": "30s"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 4KB | 3KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 5 步渲染 | ≤ 50ms | 40ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 步骤列表 | `role="list"` | 1.3.1 |
| 步骤项 | `role="listitem"` | 1.3.1 |
| 命令 | `role="code"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |