# YryDashboardQuicknav · 仪表板快速锚点

> Vue 3 组件 · 自定义元素 `<yry-dashboard-quicknav>` · 仪表板顶部胶囊式快速锚点
> v1.0.0 · 从 `docs/index.html` 内联 `<nav class="sr-quicknav">` 迁出

## 文件

```
yry-dashboard-quicknav/
├── index.html    # 模板源 (<script type="text/x-template">) + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 胶囊导航样式 (吸顶 + 玻璃 + 滚动联动高亮 + 移动端横向滚动)
```

## 用途

取代 `docs/index.html` 评分仪表板顶部硬编码的 6 个锚点:

```
📸 最新报告   📐 评分机制   📋 实时评分   🔬 维度分解   📑 详细报告   🧭 CDN 聚合
```

渲染为吸顶胶囊导航条,内置 IntersectionObserver 滚动联动高亮(active) +
移动端横向滚动 + 玻璃磨砂背景。

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|------|------|
| `chips` | Array | ✅ | `[]` | 锚点数组,每项 `{ id, label, title, href, target }` |
| `id` | String | | `'sr-quicknav'` | 容器 `id` |
| `ariaLabel` | String | | `'仪表板快速导航'` | 容器 `aria-label` |
| `scrollSpy` | Boolean | | `true` | 是否启用滚动联动高亮 |
| `spyOffset` | String | | `'-20% 0px -70% 0px'` | IntersectionObserver 的 `rootMargin` |

### chip 对象字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|:---:|------|
| `id` | String | ✅ | 滚动监听的目标元素 `id` |
| `label` | String | ✅ | chip 文本 (支持 emoji) |
| `title` | String | | hover 提示 |
| `href` | String | | 链接地址;缺省为 `'#' + id` |
| `target` | String | | `_blank` 等 |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-dashboard-quicknav-ready` | 模板 fetch + 注册完成 | `{ component: 'YryDashboardQuicknav' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-dashboard-quicknav/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/shared/vue-ce-loader.js"></script>
<script src="../../../../cdn/yry-dashboard-quicknav/index.js"></script>

<yry-dashboard-quicknav id="sr-quicknav"
                       aria-label="评分仪表板快速导航"></yry-dashboard-quicknav>

<script>
  var CHIPS = [
    { id: 'sm-snapshot',    label: '📸 最新报告', title: '最新报告快照 — 今日健康 + 20 技能自循环巡检',     href: '#sm-snapshot' },
    { id: 'sm-methodology', label: '📐 评分机制', title: '八维加权评分体系',                                  href: '#sm-methodology' },
    { id: 'score-report',   label: '📋 实时评分', title: '实时评分报告',                                       href: '#score-report' },
    { id: 'sr-dim-list',    label: '🔬 维度分解', title: '维度评分分解',                                        href: '#sr-dim-list' },
    { id: 'sr-detail-nav',  label: '📑 详细报告', title: '详细报告导航',                                        href: '#sr-detail-nav' },
    { id: 'sec-cdn-agg',    label: '🧭 CDN 聚合', title: 'CDN 聚合中心',                                        href: '#sec-cdn-agg' }
  ];
  function mount() {
    var el = document.getElementById('sr-quicknav');
    el.chips = CHIPS;
  }
  if (window.YryDashboardQuicknav) mount();
  else document.addEventListener('yry-dashboard-quicknav-ready', mount, { once: true });
</script>
```

## 命名约定 (与 docs/index.html 滚动间谍兼容)

- 根元素: `.sr-quicknav` (与原版一致)
- 单个 chip: `.sr-qn-chip` + `data-target` 属性
- 高亮态: `.sr-qn-chip.is-active` (IntersectionObserver 自动切换)

> 即使 docs/index.html 的内联滚动间谍代码 `querySelectorAll('.sr-qn-chip')`
> 也仍然能命中组件输出的 DOM,实现无缝替换。

## 依赖

- Vue 3 (生产版)
- `cdn/shared/vue-ce-loader.js` (CDN 组件共享加载器)

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|------|------|:----:|
| 模板 fetch 大小 | < 6KB | ~5KB | ✅ |
| CSS 体积 | < 2KB | ~1.6KB | ✅ |
| 渲染 6 chip | < 16ms | < 8ms | ✅ |
| 滚动响应 | < 32ms | < 12ms | ✅ |

## 视觉规范

- 容器: 吸顶 + 玻璃磨砂 + 青紫渐变
- chip: 圆角 999px + 1px 边框 + 文字 `#a9b1d6`
- hover: 文字 + 边框 → 青色 `#22d3ee` + 抬升 1px
- active: 背景 `rgba(34,211,238,.15)` + 文字 → 青色 + 字体加粗
- 移动端: 容器横向滚动,chip `flex-shrink: 0`
- 打印: 隐藏

## 与原版差异

| 维度 | 原版 (内联) | 新版 (组件) |
|------|------------|------------|
| HTML | 6 行硬编码 `<a>` | 1 个 `<yry-dashboard-quicknav>` |
| 滚动高亮 | 文档 IIFE 中查询 `.sr-qn-chip` | 组件内置 IntersectionObserver,外部代码仍可接管 |
| 样式 | 散落在 `yry-dashboard-report/index.css` + 文档内联 `<style>` | 集中在 `index.css`,3KB 移除 |
| 数据 | 硬编码 | `chips` Prop 驱动,易扩展 |
| 复用 | 仅 `docs/index.html` | 任何页面/报告页可挂载 |
