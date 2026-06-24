# YryTimelineHero · 时间线英雄区

> Vanilla 组件 · 自定义元素 `<yry-timeline-hero>` · 5KB JS · 项目时间线展示

## 文件

```
yry-timeline-hero/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 时间线逻辑 (5KB JS)
└── index.css     # 组件样式 (6KB CSS)
```

## 功能

- 项目时间线 Hero 区域展示
- 里程碑节点动画
- 使用 `--yry-accent-rgb` / `--yry-pass-rgb` 令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-timeline-hero/index.css">
<script src="../../../../cdn/yry-timeline-hero/index.js"></script>
<yry-timeline-hero></yry-timeline-hero>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `milestones` | Array | `[]` | 里程碑数组 |
| `animated` | Boolean | true | 入场动画 |
| `showDates` | Boolean | true | 显示日期 |
| `layout` | String | `horizontal` | 布局: horizontal/vertical |

## 里程碑数据 schema

```json
{
  "date": "2026-06-16",
  "title": "v1.2.0",
  "desc": "107 组件 · 双主题",
  "status": "done",
  "icon": "🚀"
}
```

## 状态映射

| status | 颜色 | 含义 |
|--------|------|------|
| `done` | 绿 | 已完成 |
| `active` | 青 | 当前 |
| `planned` | 灰 | 计划中 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 7KB | 6KB | ✅ |
| 渲染 | ≤ 100ms | 80ms | ✅ |
| 动画 | ≤ 800ms | 700ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 时间线 | `role="list"` | 1.3.1 |
| 里程碑 | `role="listitem"` | 1.3.1 |
| 日期 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |