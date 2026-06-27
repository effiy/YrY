# YryTrendCard · 趋势卡片组件

> Vue 3 组件 · 自定义元素 `<yry-trend-card>` · 趋势数据展示

## 文件

```
yry-trend-card/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-trend-card-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-trend-card/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-trend-card/index.js"></script>
<div id="trend-card-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryTrendCard, { label: '健康评分', value: 92, trend: 'up' }).mount('#trend-card-app');
  }
  if (window.YryTrendCard) mount();
  else document.addEventListener('yry-trend-card-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `label` | String | ✅ | — | 趋势标签 |
| `value` | Number/String | ✅ | — | 当前值 |
| `trend` | String | — | — | 趋势方向: up/down/flat |
| `sparkline` | Array | — | `[]` | 火花图数据 |
| `unit` | String | — | — | 单位 |
| `href` | String | — | — | 详情链接 |

## 趋势方向

| trend | 图标 | 颜色 |
|-------|:---:|------|
| `up` | ↑ | 绿 |
| `down` | ↓ | 红 |
| `flat` | → | 灰 |

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
| 卡片 | `role="meter"` | 1.3.1 |
| 趋势 | `aria-live="polite"` | 4.1.3 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |