# YryLayerRules · 分层规则组件

> Vue 3 组件 · 自定义元素 `<yry-layer-rules>` · 分层规则展示

## 文件

```
yry-layer-rules/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-layer-rules-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-layer-rules/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-layer-rules/index.js"></script>
<div id="layer-rules-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryLayerRules, { rules: [...] }).mount('#layer-rules-app');
  }
  if (window.YryLayerRules) mount();
  else document.addEventListener('yry-layer-rules-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `rules` | Array | ✅ | `[]` | 规则数组 |
| `layerId` | String | — | — | layer id |
| `showStages` | Boolean | — | true | 显示适用阶段 |
| `expandable` | Boolean | — | true | 可展开 |

## 规则数据 schema

```json
{
  "id": "code-pipeline",
  "name": "代码变更治理",
  "stages": ["Gate A", "Gate B"],
  "executor": "tester",
  "blockLevel": "P0"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 16 规则渲染 | ≤ 150ms | 120ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 列表 | `role="list"` | 1.3.1 |
| 规则 | `role="listitem"` | 1.3.1 |
| 阻断 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |