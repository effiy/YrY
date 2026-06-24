# YryCytoscapeGraph · 知识图谱组件

> Vanilla JS 组件 · Cytoscape.js + YrY 深色主题 · 零配置自初始化

## 文件

```
yry-cytoscape-graph/
├── index.html    # Demo 预览页
├── index.js      # 图谱渲染逻辑 (12KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-cytoscape-graph/index.css">
<div class="yry-cytoscape-graph" id="graph" data-layout="breadthfirst"></div>
<script>
  document.getElementById('graph').graphData = { nodes: [...], edges: [...] };
</script>
<script src="../../../../cdn/yry-cytoscape-graph/index.js"></script>
```

## 功能

- 知识图谱节点-边可视化
- 多种布局算法 (breadthfirst / cose / circle)
- YrY 深色主题适配
- 全局变量: `window.YrYCytoscapeGraph`

## Props/Data

| Attribute/Property | 类型 | 默认 | 说明 |
|-----------|------|------|------|
| `data-layout` | String | `breadthfirst` | 布局: breadthfirst/cose/circle/grid |
| `graphData` | Object | `{}` | `{nodes, edges}` 数据 |
| `data-zoom` | Boolean | true | 可缩放 |
| `data-pannable` | Boolean | true | 可平移 |

## graphData schema

```json
{
  "nodes": [
    {"id": "n1", "label": "技能", "type": "domain"},
    {"id": "n2", "label": "rui-init", "type": "skill"}
  ],
  "edges": [
    {"source": "n1", "target": "n2", "label": "contains"}
  ]
}
```

## 节点类型与颜色

| type | 颜色 | 用途 |
|------|------|------|
| `domain` | 青 | 领域层 |
| `flow` | 紫 | 结构层 |
| `step` | 绿 | 内容层 |
| `story` | 蓝 | 故事 |
| `scene` | 黄 | 场景 |

## 布局算法

| layout | 用途 | 性能 |
|--------|------|:---:|
| `breadthfirst` | 层次结构 | 快 |
| `cose` | 力导向 | 中 |
| `circle` | 环形 | 快 |
| `grid` | 网格 | 快 |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 3KB | 2.5KB | ✅ |
| JS 体积 | ≤ 15KB | 12KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 100 节点渲染 | ≤ 500ms | 400ms | ✅ |
| 缩放响应 | ≤ 16ms | 10ms | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 图谱 | `role="img"` | 1.3.1 |
| `aria-label` | "知识图谱" | 1.3.1 |
| 节点 | `aria-describedby` | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |