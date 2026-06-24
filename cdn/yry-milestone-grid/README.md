# YryMilestoneGrid · 里程碑网格

> Vanilla 组件 · 自定义元素 `<yry-milestone-grid>` · 项目里程碑网格

## 文件

```
yry-milestone-grid/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 里程碑网格逻辑
└── index.css     # 组件样式 (3KB CSS)
```

## 功能

- 里程碑网格展示
- 时间线 + 状态指示
- 使用 `--yry-accent-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-milestone-grid/index.css">
<script src="../../../../cdn/yry-milestone-grid/index.js"></script>
<yry-milestone-grid></yry-milestone-grid>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `milestones` | Array | `[]` | 里程碑数组 |
| `columns` | Number | 3 | 列数 |
| `showDates` | Boolean | true | 显示日期 |
| `animated` | Boolean | true | 动画 |

## 里程碑数据 schema

```json
{
  "date": "2026-06-16",
  "version": "v1.2.0",
  "title": "107 组件",
  "status": "done",
  "score": 92
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 4KB | 3KB | ✅ |
| 12 里程碑渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 网格 | `role="grid"` | 1.3.1 |
| 里程碑 | `role="gridcell"` | 1.3.1 |
| 状态 | `aria-live="polite"` | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |