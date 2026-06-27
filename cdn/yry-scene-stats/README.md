# YrySceneStats · 场景统计组件

> Vue 3 组件 · 自定义元素 `<yry-scene-stats>` · 场景统计数据

## 文件

```
yry-scene-stats/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-scene-stats-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene-stats/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-scene-stats/index.js"></script>
<div id="scene-stats-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YrySceneStats, { stats: [...] }).mount('#scene-stats-app');
  }
  if (window.YrySceneStats) mount();
  else document.addEventListener('yry-scene-stats-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `stats` | Array | ✅ | `[]` | 统计项数组 |
| `layout` | String | — | `grid` | 布局: grid/row |
| `animated` | Boolean | — | true | 动画 |

## stats 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | String | 标签 |
| `value` | String/Number | 值 |
| `trend` | String | 趋势 |
| `color` | String | 颜色 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 6 项渲染 | ≤ 50ms | 40ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 统计 | `role="meter"` | 1.3.1 |
| 值 | `aria-live="polite"` | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |