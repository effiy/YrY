# YrySceneHealthBar · 场景健康条

> Vue 3 组件 · 自定义元素 `<yry-scene-health-bar>` · 场景健康度条

## 文件

```
yry-scene-health-bar/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (1KB CSS)
```

## 事件

`yry-scene-health-bar-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene-health-bar/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-scene-health-bar/index.js"></script>
<div id="scene-health-bar-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YrySceneHealthBar, { score: 85 }).mount('#scene-health-bar-app');
  }
  if (window.YrySceneHealthBar) mount();
  else document.addEventListener('yry-scene-health-bar-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API 完整定义

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `score` | Number | ✅ | 0 | 健康评分 (0-100) |
| `label` | String | — | — | 标签 |
| `showScore` | Boolean | — | true | 显示评分数字 |
| `animated` | Boolean | — | true | 动画 |
| `compact` | Boolean | — | false | 紧凑模式 |

## 评分等级映射

| score 范围 | 等级 | 颜色 | 状态 |
|:---:|:---:|------|------|
| ≥ 90 | A | 绿 | 优秀 |
| 80-89 | B | 蓝 | 良好 |
| 70-79 | C | 黄 | 合格 |
| 60-69 | D | 橙 | 待改进 |
| < 60 | F | 红 | 不合格 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 2KB | 1.5KB | ✅ |
| JS 体积 | ≤ 3KB | 2KB | ✅ |
| CSS 体积 | ≤ 1KB | 0.8KB | ✅ |
| 渲染 | ≤ 20ms | 15ms | ✅ |
| 动画 | ≤ 500ms | 400ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 健康条 | `role="meter"` | 1.3.1 |
| 评分 | `aria-valuenow` | 1.3.1 |
| 等级 | `aria-label` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |