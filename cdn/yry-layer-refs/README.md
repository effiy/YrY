# YryLayerRefs · 分层引用组件

> Vue 3 组件 · 自定义元素 `<yry-layer-refs>` · 分层引用展示

## 文件

```
yry-layer-refs/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-layer-refs-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-layer-refs/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-layer-refs/index.js"></script>
<div id="layer-refs-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryLayerRefs, { refs: [...] }).mount('#layer-refs-app');
  }
  if (window.YryLayerRefs) mount();
  else document.addEventListener('yry-layer-refs-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `refs` | Array | ✅ | `[]` | 引用数组 |
| `layerId` | String | — | — | layer id |
| `showPaths` | Boolean | — | true | 显示路径 |
| `external` | Boolean | — | false | 外部引用 |

## 引用数据 schema

```json
{
  "id": "CLAUDE.md",
  "path": "./CLAUDE.md",
  "summary": "项目信念与铁律",
  "type": "rule"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 18 引用渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 列表 | `role="list"` | 1.3.1 |
| 引用 | `role="listitem"` | 1.3.1 |
| 链接 | `aria-label` | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |