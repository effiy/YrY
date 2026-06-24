# YryDayPlan · 每日计划组件

> Vanilla 组件 · 自定义元素 `<yry-day-plan>` · 每日任务计划展示

## 文件

```
yry-day-plan/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 计划交互逻辑
└── index.css     # 组件样式 (4KB CSS)
```

## 功能

- 每日任务时间线展示
- 任务状态切换
- 进度可视化

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-day-plan/index.css">
<script src="../../../../cdn/yry-day-plan/index.js"></script>
<yry-day-plan></yry-day-plan>
```

## 依赖

无外部依赖，纯 Web Component

## Props/Attributes

| Attribute | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `tasks` | Array | `[]` | 任务数组 |
| `date` | String | 今日 | 日期 |
| `showTimeline` | Boolean | true | 时间线 |
| `editable` | Boolean | false | 可编辑 |

## 任务数据 schema

```json
{
  "id": "t1",
  "time": "09:00",
  "title": "健康检查",
  "duration": 30,
  "status": "done"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 5KB | 4KB | ✅ |
| 20 任务渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 时间线 | `role="list"` | 1.3.1 |
| 任务 | `role="listitem"` | 1.3.1 |
| 状态 | `aria-live="polite"` | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |