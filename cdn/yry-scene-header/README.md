# YrySceneHeader · 场景页头组件

> Vue 3 组件 · 自定义元素 `<yry-scene-header>` · 面包屑上方的标题区

## 文件

```
yry-scene-header/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## Props API

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `icon` | String | | `''` | 标题 icon emoji |
| `titlePrefix` | String | | `''` | 标题前缀 (如 '场景-1') |
| `accent` | String | | `''` | 标题高亮 (如 '· 模板架构') |
| `meta` | String | | `''` | 元信息行 (如 '📌 v1.0 · 📅 2026-06-05') |
| `desc` | String | | `''` | 场景描述文字 |

> 注意: prop 名不使用 `prefix`, 因为 `Element.prototype.prefix` 是只读 getter (XML 命名空间), 升级为自定义元素后赋值会抛 TypeError。

## 事件

| 事件 | 时机 | payload |
|------|------|---------|
| `yry-scene-header-ready` | 模板 fetch + 注册完成 | `{ component: 'YrySceneHeader' }` |

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene-header/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-scene-header/index.js"></script>
<div id="scene-header-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YrySceneHeader, {
      icon: '📋',
      titlePrefix: '场景-1',
      accent: ' · 模板架构与 CSS 设计系统',
      meta: '📌 v1.0 · 📅 2026-06-05 · 🏷️ arch',
      desc: '定义计划清单页面的模板架构与 CSS 设计系统'
    }).mount('#scene-header-app');
  }
  if (window.YrySceneHeader) mount();
  else document.addEventListener('yry-scene-header-ready', mount, { once: true });
</script>
```

## 依赖

- Vue 3 运行时

## 关联组件

| 角色 | 组件 | 关系 |
|------|------|------|
| 同级 | [yry-breadcrumb](../yry-breadcrumb/README.md) | 场景页顶部面包屑 |
| 同级 | [yry-cross-nav](../yry-cross-nav/README.md) | 7 交付物导航 |
| 同级 | [yry-scene-nav](../yry-scene-nav/README.md) | 上一/下一场景 |

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `icon` | String | ✅ | — | 场景图标 (emoji) |
| `titlePrefix` | String | ✅ | — | 标题前缀 (场景号) |
| `accent` | String | — | — | 标题强调色文本 |
| `meta` | String | — | — | 元信息 (版本/日期/标签) |
| `desc` | String | — | — | 场景描述 |
| `titleHref` | String | — | — | 标题链接 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 4KB | 3KB | ✅ |
| JS 体积 | ≤ 5KB | 4KB | ✅ |
| CSS 体积 | ≤ 2KB | 1.5KB | ✅ |
| 首屏渲染 | ≤ 100ms | 80ms | ✅ |

## 场景页头部布局

| 区域 | 内容 | 样式 |
|------|------|------|
| 左侧 | icon + 标题 | flex-start |
| 右侧 | meta 元信息 | flex-end |
| 底部 | desc 描述 | full-width |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| header | `role="banner"` | 1.3.1 |
| 标题 | `aria-level="1"` | 1.3.1 |
| meta | `aria-live="polite"` | 4.1.3 |
| desc | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |
| 消费方 | [cdn/index.html](../index.html) | CDN 首页头部 |