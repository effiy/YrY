# YryStepCard · 步骤卡片组件

> Vue 3 组件 · 自定义元素 `<yry-step-card>` · 步骤展示卡片 · 5KB CSS

## 文件

```
yry-step-card/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (5KB CSS)
```

## 事件

`yry-step-card-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-step-card/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-step-card/index.js"></script>
<div id="step-card-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryStepCard, { /* props */ }).mount('#step-card-app');
  }
  if (window.YryStepCard) mount();
  else document.addEventListener('yry-step-card-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `num` | Number | ✅ | — | 步骤序号 |
| `title` | String | ✅ | — | 步骤标题 |
| `desc` | String | — | — | 步骤描述 |
| `status` | String | — | `pending` | 状态: done/ready/pending |
| `tasks` | Array | — | `[]` | 子任务数组 |
| `expanded` | Boolean | — | false | 展开 |

## 步骤状态机

| 状态 | 图标 | 颜色 | 推导规则 |
|------|:---:|------|------|
| `done` | ✅ | 绿 | 已完成 |
| `ready` | 🔶 | 黄 | 前置全完成 |
| `pending` | ⏳ | 灰 | 有前置未完成 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 4KB | 3KB | ✅ |
| JS 体积 | ≤ 4KB | 3KB | ✅ |
| CSS 体积 | ≤ 6KB | 5KB | ✅ |
| 单卡渲染 | ≤ 30ms | 20ms | ✅ |
| 7 卡渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 步骤卡 | `role="listitem"` | Tab | 1.3.1 |
| 展开 | `aria-expanded` | Enter | 4.1.2 |
| 状态 | `aria-live="polite"` | — | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |