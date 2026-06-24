# YryMeter · 仪表盘组件

> Vanilla 组件 · 自定义元素 `<yry-meter>` · SVG 进度/评分仪表盘

## 文件

```
yry-meter/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 仪表盘渲染逻辑 (2KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- SVG 仪表盘可视化
- 进度/评分展示
- 颜色编码 (pass / warn / fail)

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-meter/index.css">
<script src="../../../../cdn/yry-meter/index.js"></script>
<yry-meter value="75" max="100"></yry-meter>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `value` | Number | 0 | 当前值 |
| `max` | Number | 100 | 最大值 |
| `label` | String | — | 标签 |
| `color` | String | `accent` | 颜色: accent/pass/warn/fail |
| `size` | Number | 120 | 尺寸 (px) |
| `animated` | Boolean | true | 动画 |

## 颜色映射

| color | 值范围 | 颜色 |
|-------|------|------|
| `accent` | 任意 | 青 |
| `pass` | ≥ 80 | 绿 |
| `warn` | 60-79 | 黄 |
| `fail` | < 60 | 红 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 渲染 | ≤ 50ms | 40ms | ✅ |
| 动画 | ≤ 500ms | 400ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 仪表 | `role="meter"` | 1.3.1 |
| 值 | `aria-valuenow` | 1.3.1 |
| 范围 | `aria-valuemin/max` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |