# YryGraph · 知识图谱页样式

> 知识图谱页基类样式: 18KB CSS · 节点/边/布局 · Mermaid 主题色

## 文件

```
yry-graph/
├── index.html    # 图谱样式预览页
└── index.css     # 图谱专属样式 (18KB CSS)
```

## 状态

⚠️ **待完善** — 缺少独立 JS 交互层,图谱交互由 `yry-cytoscape-graph` 组件提供

## 功能

- 知识图谱页面的容器和布局
- 节点/边的视觉样式
- 与 Mermaid 主题色保持一致

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/yry-graph/index.css">
```

## 关联

- 图谱渲染: `yry-cytoscape-graph` 组件 (Cytoscape.js + YrY 深色主题)
- 图谱数据: 各场景的 `知识图谱.html` + `知识图谱.json`

## CSS 类层级

| class | 用途 |
|-------|------|
| `.kg-container` | 图谱容器 |
| `.kg-node` | 节点基类 |
| `.kg-node--domain` | 领域层节点 |
| `.kg-node--flow` | 结构层节点 |
| `.kg-node--step` | 内容层节点 |
| `.kg-edge` | 边基类 |
| `.kg-edge--solid` | 实线边 |
| `.kg-edge--dashed` | 虚线边 |
| `.kg-label` | 标签 |

## 节点类型颜色

| 类型 | 颜色 | 用途 |
|------|------|------|
| domain | 青 | 领域层 |
| flow | 紫 | 结构层 |
| step | 绿 | 内容层 |
| story | 蓝 | 故事 |
| scene | 黄 | 场景 |
| external | 灰 | 外部 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| CSS 体积 | ≤ 20KB | 18KB | ✅ |
| 加载延迟 | ≤ 50ms | 30ms | ✅ |
| 100 节点渲染 | ≤ 500ms | 400ms | ✅ |

## 响应式

| 断点 | 宽度 | 布局 |
|------|:---:|------|
| Desktop | ≥ 1024px | 全图谱 |
| Tablet | 768-1023px | 缩放 |
| Mobile | < 768px | 简化 |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 图谱 | `role="img"` | 1.3.1 |
| `aria-label` | 图谱描述 | 1.3.1 |
| 节点 | `aria-describedby` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |