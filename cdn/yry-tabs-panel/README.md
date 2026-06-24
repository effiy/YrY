# YryTabsPanel · 标签页面板组件

> Vanilla 组件 · 标签页 + 面板受控切换 · Vue 3 运行时依赖

## 文件

```
yry-tabs-panel/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 标签页切换逻辑
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 标签页切换
- 面板内容受控显示

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-tabs-panel/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-tabs-panel/index.js"></script>
<div id="tabs-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryTabsPanel, { tabs: ['概览', '详情'], active: '概览' }).mount('#tabs-app');
  }
  if (window.YryTabsPanel) mount();
  else document.addEventListener('yry-tabs-panel-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `tabs` | Array | ✅ | `[]` | 标签页数组 |
| `active` | String | — | — | 激活标签 |
| `persist` | Boolean | — | true | 持久化 |
| `keyboard` | Boolean | — | true | 键盘导航 |
| `animated` | Boolean | — | true | 切换动画 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 切换 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| tablist | `role="tablist"` | 方向键 | 1.3.1 |
| tab | `role="tab"` | Enter | 4.1.2 |
| panel | `role="tabpanel"` | — | 1.3.1 |
| active | `aria-selected` | — | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |