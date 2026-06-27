# YryLayer · 通用分层组件

> Vue 3 组件 · 自定义元素 `<yry-layer>` · Section/Sub-title 包装器 + 面板跳转 dots

## 文件

```
yry-layer/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件 (7KB JS)
└── index.css     # 组件样式 (4KB CSS)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `layerId` | String | | — | 渲染到 `<div class="layer" id="...">` |
| `num` | String | ✅ | — | 左侧序号, 如 '1' / '2' |
| `titleIcon` | String | | — | 标题前的 emoji/icon |
| `titlePrefix` | String | | — | 标题前缀 |
| `titleAccent` | String | | — | 标题高亮部分 |
| `titleSuffix` | String | | — | 标题后缀 |
| `stats` | Array | | — | 描述性文本数组, 用 · 分隔 |
| `panels` | Array | | — | 跳转面板 dots: `[{ icon, label, panel, title? }]` |
| `panelsTitle` | String | | — | "查看" 等小标签 |

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-layer-ready` | 模板 fetch + 注册完成 | `{ component: 'YryLayer' }` |
| `layer-panel-select` (根元素, bubbles) | lp-dot 点击 | `{ panel: String }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-layer/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-layer/index.js"></script>
<div id="layer-deps-app">
  <!-- slot 内容 (在 mount 前就存在) -->
</div>
<script>
  function mount() {
    const root = Vue.createApp(window.YryLayer, {
      layerId: 'layer-deps', num: '1', titleIcon: '📚',
      titlePrefix: 'Layer 1 · ', titleAccent: '依赖 / 框架',
      stats: ['12 项', '技术债务 ≤ 0'],
      panelsTitle: '查看',
      panels: [{ icon: '🔍', label: '依赖详情', panel: 'deps' }]
    }).mount('#layer-deps-app');
    root.addEventListener('layer-panel-select', e => {
      if (window.PanelHub) window.PanelHub.open(e.detail.panel);
    });
  }
  if (window.YryLayer) mount();
  else document.addEventListener('yry-layer-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时
- PanelHub (可选, 面板跳转功能)

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 上层 | [yry-doc-layer](../yry-doc-layer/README.md) | 文档分层 (消费 YryLayer) |
| 面板 | [yry-panel-hub](../yry-panel-hub/README.md) | PanelHub 全局 API |
| 消费方 | [cdn/index.html](../index.html) | CDN 首页 Layer 分区 |

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `layerId` | String | ✅ | — | layer 唯一 id |
| `num` | String | ✅ | — | layer 序号 |
| `titleIcon` | String | — | — | 标题图标 |
| `titlePrefix` | String | — | — | 标题前缀 |
| `titleAccent` | String | — | — | 标题高亮 |
| `titleSuffix` | String | — | — | 标题后缀 |
| `stats` | Array | — | `[]` | 统计行文本数组 |
| `panels` | Array | — | `[]` | 跳转面板 dots |
| `panelsTitle` | String | — | — | 面板标签 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 5KB | 4KB | ✅ |
| JS 体积 | ≤ 6KB | 5KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 单 layer 渲染 | ≤ 50ms | 40ms | ✅ |
| 6 layer 首页 | ≤ 300ms | 250ms | ✅ |

## Layer 编号体系

| Layer | 编号 | 用途 | 典型内容 |
|-------|:---:|------|------|
| Layer 1 | `1` | 依赖/框架 | 12 npm 包 |
| Layer 2 | `2` | 技能 | 20 技能 |
| Layer 3 | `3` | 故事 | 6 故事 |
| Layer 4 | `4` | 场景 | 32 场景 |
| Layer 5 | `5` | Agent+规则 | 9+31 |
| Layer 6 | `6` | 参考入口 | 18+ 文档 |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| layer | `role="region"` | 1.3.1 |
| 标题 | `aria-level="2"` | 1.3.1 |
| 统计 | `aria-live="polite"` | 4.1.3 |
| 面板跳转 | `aria-label` | 4.1.2 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 设计令牌

`--yry-accent-rgb`