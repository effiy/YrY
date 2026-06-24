# YryInfoCards · 信息卡片组组件

> Vanilla 组件 · 自定义元素 `<yry-info-cards>` · 信息展示卡片

## 文件

```
yry-info-cards/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 卡片交互逻辑
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 信息卡片网格展示
- 使用 `--yry-amber-bright` / `--yry-mono-text2` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-info-cards/index.css">
<script src="../../../../cdn/yry-info-cards/index.js"></script>
<yry-info-cards></yry-info-cards>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `cards` | Array | `[]` | 卡片数组 |
| `columns` | Number | 3 | 列数 |
| `gap` | String | `12px` | 间距 |
| `animated` | Boolean | true | 动画 |

## 卡片数据 schema

```json
{
  "title": "健康评分",
  "value": "92",
  "desc": "A 级 · 优秀",
  "icon": "🩺"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 6 卡渲染 | ≤ 50ms | 40ms | ✅ |

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