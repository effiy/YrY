# YryRiskMatrix · 风险矩阵组件

> Vue 3 组件 · 自定义元素 `<yry-risk-matrix>` · 风险概率 × 影响矩阵

## 文件

```
yry-risk-matrix/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (4KB CSS)
```

## 事件

`yry-risk-matrix-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-risk-matrix/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-risk-matrix/index.js"></script>
<div id="risk-matrix-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryRiskMatrix, { risks: [...] }).mount('#risk-matrix-app');
  }
  if (window.YryRiskMatrix) mount();
  else document.addEventListener('yry-risk-matrix-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `risks` | Array | ✅ | `[]` | 风险数组 |
| `size` | Number | — | 5 | 矩阵尺寸 (5×5) |
| `showLabels` | Boolean | — | true | 显示轴标签 |
| `interactive` | Boolean | — | false | 可交互 |

## 风险数据 schema

```json
{
  "id": "risk-001",
  "impact": 4,
  "probability": 3,
  "severity": "high",
  "title": "CDN 不可达",
  "mitigation": "双 CDN 回退"
}
```

## 5×5 矩阵色阶

| 影响 \ 概率 | 1 | 2 | 3 | 4 | 5 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 5 | 黄 | 橙 | 红 | 红 | 红 |
| 4 | 绿 | 黄 | 橙 | 红 | 红 |
| 3 | 绿 | 黄 | 黄 | 橙 | 红 |
| 2 | 绿 | 绿 | 黄 | 黄 | 橙 |
| 1 | 绿 | 绿 | 绿 | 黄 | 黄 |

## 严重度映射

| severity | 颜色 | 行动 | 时效 |
|----------|------|------|:---:|
| `critical` | 红 | 立即修复 | 1h |
| `high` | 橙 | 本轮修复 | 4h |
| `medium` | 黄 | 计划修复 | 1d |
| `low` | 绿 | 记录监控 | 1w |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 4KB | 3KB | ✅ |
| JS 体积 | ≤ 5KB | 4KB | ✅ |
| CSS 体积 | ≤ 5KB | 4KB | ✅ |
| 矩阵渲染 | ≤ 50ms | 40ms | ✅ |
| 25 格渲染 | ≤ 100ms | 80ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 矩阵 | `role="grid"` | 1.3.1 |
| 格子 | `role="gridcell"` | 1.3.1 |
| 严重度 | `aria-label` | 1.3.1 |
| 颜色 | 不依赖颜色 | 1.4.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |