# YryLayerAgents · 分层 Agent 展示

> Vue 3 组件 · 自定义元素 `<yry-layer-agents>` · Agent 分层展示

## 文件

```
yry-layer-agents/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-layer-agents-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-layer-agents/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-layer-agents/index.js"></script>
<div id="layer-agents-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryLayerAgents, { agents: [...] }).mount('#layer-agents-app');
  }
  if (window.YryLayerAgents) mount();
  else document.addEventListener('yry-layer-agents-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `agents` | Array | ✅ | `[]` | Agent 数组 |
| `layerId` | String | — | — | layer id |
| `showRoles` | Boolean | — | true | 显示角色 |
| `expandable` | Boolean | — | true | 可展开 |

## Agent 数据 schema

```json
{
  "id": "pm",
  "name": "决策中枢",
  "role": "pm",
  "triggers": ["需求解析"],
  "actions": ["拆分故事", "调度角色"],
  "handoff": "pm-ready"
}
```

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 9 Agent 渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 列表 | `role="list"` | 1.3.1 |
| Agent | `role="listitem"` | 1.3.1 |
| 展开 | `aria-expanded` | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |