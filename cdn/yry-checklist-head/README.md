# YryChecklistHead · 清单头部组件

> Vue 3 组件 · 自定义元素 `<yry-checklist-head>` · 计划清单顶部区域

## 文件

```
yry-checklist-head/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-checklist-head-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-checklist-head/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-checklist-head/index.js"></script>
<div id="checklist-head-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryChecklistHead, { /* props */ }).mount('#checklist-head-app');
  }
  if (window.YryChecklistHead) mount();
  else document.addEventListener('yry-checklist-head-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `title` | String | ✅ | — | 清单标题 |
| `version` | String | — | — | 版本号 |
| `date` | String | — | — | 日期 |
| `tags` | Array | — | `[]` | 标签数组 |
| `progress` | Number | — | 0 | 总进度 (0-100) |
| `showProgress` | Boolean | — | true | 显示进度条 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 渲染 | ≤ 30ms | 20ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 头部 | `role="banner"` | 1.3.1 |
| 标题 | `aria-level="1"` | 1.3.1 |
| 进度 | `role="progressbar"` | 1.3.1 |
| 版本 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |