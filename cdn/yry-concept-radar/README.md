# YryConceptRadar · 概念雷达图

> Vanilla 组件 · 自定义元素 `<yry-concept-radar>` · SVG 雷达图可视化

## 文件

```
yry-concept-radar/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 雷达图渲染逻辑 (7KB JS)
└── index.css     # 组件样式 (5KB CSS)
```

## 功能

- SVG 雷达图渲染
- 多维度概念评分展示
- 使用 `--yry-accent-rgb` / `--yry-cyan-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-concept-radar/index.css">
<script src="../../../../cdn/yry-concept-radar/index.js"></script>
<yry-concept-radar></yry-concept-radar>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `dimensions` | Array | `[]` | 维度数组 `[{label, value}]` |
| `size` | Number | 300 | 雷达图尺寸 (px) |
| `levels` | Number | 5 | 同心层 |
| `animated` | Boolean | true | 动画 |

## 维度数据 schema

```json
[
  {"label": "架构", "value": 0.92},
  {"label": "测试", "value": 0.85},
  {"label": "文档", "value": 0.95},
  {"label": "性能", "value": 0.88},
  {"label": "安全", "value": 1.00}
]
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 8KB | 7KB | ✅ |
| CSS 体积 | ≤ 6KB | 5KB | ✅ |
| 渲染 | ≤ 100ms | 80ms | ✅ |
| 动画 | ≤ 500ms | 400ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 雷达 | `role="img"` | 1.3.1 |
| `aria-label` | "概念雷达图" | 1.3.1 |
| 维度 | `aria-describedby` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |