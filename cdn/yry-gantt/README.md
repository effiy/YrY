# YryGantt · 甘特图组件

> Vue 3 组件 · 自定义元素 `<yry-gantt>` · 项目时间线甘特图

## 文件

```
yry-gantt/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-gantt-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-gantt/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-gantt/index.js"></script>
<div id="gantt-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryGantt, { tasks: [...] }).mount('#gantt-app');
  }
  if (window.YryGantt) mount();
  else document.addEventListener('yry-gantt-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `tasks` | Array | ✅ | `[]` | 任务数组 |
| `startDate` | String | — | — | 起始日期 |
| `endDate` | String | — | — | 结束日期 |
| `scale` | String | — | `day` | 刻度: day/week/month |
| `showLabels` | Boolean | — | true | 显示标签 |

## 任务数据 schema

```json
{
  "id": "t1",
  "name": "Gate A",
  "start": "2026-06-01",
  "end": "2026-06-05",
  "progress": 0.75,
  "owner": "tester",
  "status": "active"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 4KB | 3KB | ✅ |
| JS 体积 | ≤ 5KB | 4KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 20 任务渲染 | ≤ 200ms | 150ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 甘特 | `role="grid"` | 1.3.1 |
| 任务 | `role="row"` | 1.3.1 |
| 进度 | `aria-valuenow` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |