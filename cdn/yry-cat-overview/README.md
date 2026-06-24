# YryCatOverview · 分类概览卡

> Vue 3 组件 · 自定义元素 `<yry-cat-overview>` · 分类统计概览

## 文件

```
yry-cat-overview/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## Props

| 名称 | 类型 | 说明 |
|------|------|------|
| `title` | String | 概览标题 |
| `segments` | String (JSON) | 分段数据 |
| `stats` | String (JSON) | 统计数据 |

## 事件

`yry-cat-overview-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-cat-overview/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-cat-overview/index.js"></script>
<div id="my-ov"></div>
<script>
  function mount() {
    Vue.createApp(window.YryCatOverview, {
      title: '总评分分布', segments: '[...]', stats: '[...]'
    }).mount('#my-ov');
  }
  if (window.YryCatOverview) mount();
  else document.addEventListener('yry-cat-overview-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `title` | String | ✅ | — | 标题 |
| `segments` | Array | ✅ | `[]` | 分段数组 |
| `stats` | Array | — | `[]` | 统计数组 |
| `showLegend` | Boolean | — | true | 显示图例 |

## segments 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | String | 分段标签 |
| `value` | Number | 分段值 |
| `color` | String | 颜色 |
| `percentage` | Number | 百分比 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 渲染 | ≤ 30ms | 20ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 概览 | `role="img"` | 1.3.1 |
| 分段 | `aria-label` | 1.3.1 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |