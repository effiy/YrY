# YryKpiCard · KPI 单卡组件

> Vue 3 组件 · 自定义元素 `<yry-kpi-card>` · KPI 指标展示

## 文件

```
yry-kpi-card/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `label` | String | | — | 指标标签 |
| `num` | String/Number | | — | 指标数值 |
| `trend` | String | | — | 趋势文字 (如 '↑ 5 大域全覆盖') |
| `trendDir` | String | | `'flat'` | 趋势方向: `up` / `down` / `flat` |
| `numColor` | String | | `'health'` | 数值颜色: `health` / `warn` / `fail` / `cyan` / `accent` |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-kpi-card-ready` | 模板 fetch + 注册完成 | `{ component: 'YryKpiCard' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-kpi-card/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-kpi-card/index.js"></script>
<div id="my-kpi"></div>
<script>
  function mount() {
    Vue.createApp(window.YryKpiCard, {
      label: '路径完整度', num: '100%',
      trend: '↑ 5 大域全覆盖', trendDir: 'up', numColor: 'health'
    }).mount('#my-kpi');
  }
  if (window.YryKpiCard) mount();
  else document.addEventListener('yry-kpi-card-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时
- 通常在 `yry-kpi-grid` 中作为子项使用

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 容器 | [yry-kpi-grid](../yry-kpi-grid/README.md) | KPI 网格容器 |

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `label` | String | ✅ | — | KPI 标签 |
| `num` | String/Number | ✅ | — | KPI 数值 |
| `trend` | String | — | — | 趋势文本 |
| `trendDir` | String | — | — | 趋势方向: up/down/flat |
| `numColor` | String | — | `accent` | 数值颜色 |
| `href` | String | — | — | 卡片链接 |
| `icon` | String | — | — | 前缀图标 |

## numColor 颜色映射

| numColor | 颜色 | 用途 |
|----------|------|------|
| `accent` | 青 | 默认主色 |
| `health` | 绿 | 健康指标 |
| `warn` | 黄 | 警告 |
| `fail` | 红 | 失败/阻断 |
| `info` | 蓝 | 信息 |

## 趋势方向

| trendDir | 图标 | 颜色 |
|----------|:---:|------|
| `up` | ↑ | 绿 |
| `down` | ↓ | 红 |
| `flat` | → | 灰 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 单卡渲染 | ≤ 30ms | 20ms | ✅ |
| 6 卡网格 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 卡片 | `role="meter"` | 1.3.1 |
| 数值 | `aria-valuenow` | 1.3.1 |
| 标签 | `aria-label` | 1.3.1 |
| 趋势 | `aria-live="polite"` | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |