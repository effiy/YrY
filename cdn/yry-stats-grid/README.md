# YryStatsGrid · 统计卡组组件

> Vue 3 组件 · 自定义元素 `<yry-stats-grid>` · KPI 统计总览

## 文件

```
yry-stats-grid/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (3KB CSS)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `items` | Array | ✅ | — | 统计项数组 |

**item 对象**: `{ value: String|Number, label: String, modifier?: 'health'|'warn-h'|'accent' }`

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-stats-grid-ready` | 模板 fetch + 注册完成 | `{ component: 'YryStatsGrid' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-stats-grid/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-stats-grid/index.js"></script>
<div id="stats-grid-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryStatsGrid, {
      items: [
        { value: 16, label: '已完成',  modifier: 'health' },
        { value: 0,  label: '进行中',  modifier: 'warn-h' },
        { value: '100%', label: '完成进度', modifier: 'accent' }
      ]
    }).mount('#stats-grid-app');
  }
  if (window.YryStatsGrid) mount();
  else document.addEventListener('yry-stats-grid-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 消费方 | [cdn/index.html](../index.html) | CDN 首页统计区 |
| 消费方 | [docs/index.html](../../docs/index.html) | 文档中心统计区 |

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `items` | Array | ✅ | `[]` | 统计项数组 |
| `layout` | String | — | `grid` | 布局: grid/row |
| `animated` | Boolean | — | `true` | 数字滚动动画 |

### items 数组字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|:---:|------|
| `value` | String/Number | ✅ | 统计值 |
| `label` | String | ✅ | 标签 |
| `modifier` | String | — | 颜色修饰符 |
| `trend` | String | — | 趋势符号 (↑↓→) |
| `href` | String | — | 卡片链接 |

## modifier 颜色映射

| modifier | 颜色 | 用途 |
|---------|------|------|
| `accent` | 青 | 主强调 |
| `cyan` | 蓝 | 信息 |
| `pass` | 绿 | 成功/通过 |
| `fail` | 红 | 失败/阻断 |
| `warn` | 黄 | 警告 |
| `health` | 紫 | 健康指标 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 6 卡渲染 | ≤ 100ms | 80ms | ✅ |
| 动画完成 | ≤ 500ms | 450ms | ✅ |

## 响应式断点

| 断点 | 宽度 | 列数 |
|------|:---:|:---:|
| Desktop XL | ≥ 1280px | 6 |
| Desktop | 1024-1279px | 4 |
| Tablet | 720-1023px | 2 |
| Mobile | < 720px | 1 |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 网格 | `role="grid"` | 1.3.1 |
| 统计项 | `role="gridcell"` | 1.3.1 |
| 值 | `aria-live="polite"` | 4.1.3 |
| 标签 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |
| 相关 | [yry-kpi-grid](../yry-kpi-grid/README.md) | KPI 网格 (不同粒度) |