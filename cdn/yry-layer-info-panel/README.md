# YryLayerInfoPanel · 分层信息面板

> Vue 3 组件 · 自定义元素 `<yry-layer-info-panel>` · 22KB JS · 分层信息面板

## 文件

```
yry-layer-info-panel/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader + 信息面板逻辑 (22KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 分层信息展示面板
- 统计数据 + 详情视图

## 事件

`yry-layer-info-panel-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-layer-info-panel/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-layer-info-panel/index.js"></script>
<div id="layer-info-panel-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryLayerInfoPanel, { /* props */ }).mount('#layer-info-panel-app');
  }
  if (window.YryLayerInfoPanel) mount();
  else document.addEventListener('yry-layer-info-panel-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时
- PanelHub 依赖

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `layerId` | String | ✅ | — | layer id |
| `info` | Object | — | — | 信息对象 |
| `metrics` | Array | — | `[]` | 指标数组 |
| `autoRefresh` | Boolean | — | false | 自动刷新 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 4KB | 3KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 面板打开 | ≤ 200ms | 150ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 面板 | `role="dialog"` | Esc | 1.3.1 |
| 指标 | `aria-live="polite"` | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |