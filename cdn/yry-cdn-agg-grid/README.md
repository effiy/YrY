# YryCdnAggGrid · CDN 聚合中心卡片网格

> Vue 3 组件 · 自定义元素 `<yry-cdn-agg-grid>` · 渲染 7 张 CDN 聚合页卡片

## 文件

```
yry-cdn-agg-grid/
├── index.html    # 模板源 (<script type="text/x-template">) + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # grid 容器布局 (1 个 CSS 规则 + 1 个 media query)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `items` | Array | | `[]` | 卡片数据数组,每项对应一张 `yry-cdn-agg-card` |

**item 对象**: 见 [`yry-cdn-agg-card` Props API](./../yry-cdn-agg-card/README.md)
(href, title, emoji, name, badge, dataSource, body, chips, cta, target)

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-cdn-agg-grid-ready` | 模板 fetch + 注册完成 | `{ component: 'YryCdnAggGrid' }` |
| `yry-cdn-agg-grid-ready:mounted` | 首次 mount 完毕 | `{ component, host }` |
| `yry-cdn-agg-grid-ready:updated` | items 变化后重新渲染 | `{ component, host }` |

外部脚本(已浏览追踪、freshness 时间戳等)可监听 `:mounted` / `:updated`
事件以确保 Vue 渲染完毕后再操作子卡片 DOM。

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-cdn-agg-card/index.css">
<link rel="stylesheet" href="../../../../cdn/yry-cdn-agg-grid/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/shared/vue-ce-loader.js"></script>
<script src="../../../../cdn/yry-cdn-agg-card/index.js"></script>
<script src="../../../../cdn/yry-cdn-agg-grid/index.js"></script>

<yry-cdn-agg-grid id="cdn-agg-grid"></yry-cdn-agg-grid>
<script>
  function mount() {
    document.getElementById('cdn-agg-grid').items = [
      { href: '../cdn/checklist.html', emoji: '📋', name: '清单聚合',
        badge: 'checklist.html', dataSource: 'manifest.json',
        body: '...', chips: ['状态徽章','类型过滤'], cta: '浏览清单 →' }
      // ... 更多卡片
    ];
  }
  if (window.YryCdnAggGrid) mount();
  else document.addEventListener('yry-cdn-agg-grid-ready', mount, { once: true });
</script>
```

## DOM 结构

```html
<yry-cdn-agg-grid id="cdn-agg-grid">
  <div class="cdn-agg-grid">
    <a class="cdn-agg-card sr-link" href="...">...</a>
    <a class="cdn-agg-card sr-link" href="...">...</a>
    ...
  </div>
</yry-cdn-agg-grid>
```

## 兼容说明

- 使用 Vue 3 custom element (`shadowRoot: false`),渲染到 light DOM。
- 因此 `document.querySelectorAll('.cdn-agg-card')` 仍可直接命中,
  原 docs/index.html 中的"已浏览追踪 + freshness 时间戳"脚本可继续工作。
- 监听 `yry-cdn-agg-grid-ready:mounted` 事件后再调用外部脚本,可避免
  "在 Vue 渲染前查询 DOM 导致找不到元素"的问题。

## 依赖

- Vue 3 运行时
- `shared/vue-ce-loader.js`
- `yry-cdn-agg-card` (异步等待 `yry-cdn-agg-card-ready` 事件)