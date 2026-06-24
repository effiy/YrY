# YryKpiGrid · KPI 网格容器

> Vue 3 组件 · 自定义元素 `<yry-kpi-grid>` · KPI 卡片网格容器

## 文件

```
yry-kpi-grid/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 依赖

- Vue 3 运行时
- 全局变量: `window.YryKpiGrid`
- 通常与 `yry-kpi-card` 配合使用

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 子组件 | [yry-kpi-card](../yry-kpi-card/README.md) | KPI 单卡 |

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `items` | Array | ✅ | `[]` | KPI 数据数组 |
| `columns` | Number | — | `auto` | 列数 |
| `gap` | String | — | `12px` | 间距 |
| `animated` | Boolean | — | true | 入场动画 |

## 响应式断点

| 断点 | 宽度 | 列数 |
|------|:---:|:---:|
| Desktop | ≥ 1024px | 4 |
| Tablet | 768-1023px | 2 |
| Mobile | < 768px | 1 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 6 卡渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 网格 | `role="grid"` | 1.3.1 |
| 卡片 | `role="gridcell"` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |