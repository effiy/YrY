# YryFaqPanel · FAQ 面板组件

> Vue 3 组件 · 自定义元素 `<yry-faq-panel>` · 17KB CSS · 常见问题管理面板

## 文件

```
yry-faq-panel/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader + FAQ 交互逻辑 (15KB JS)
└── index.css     # 组件样式 (17KB CSS, 最大组件样式文件之一)
```

## 功能

- FAQ 条目展开/折叠
- 搜索过滤
- 分类标签

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `items` | Array | — | `[]` | FAQ 条目列表 |
| `categories` | Array | — | `[]` | 分类标签 |
| `searchable` | Boolean | — | `true` | 启用搜索 |
| `defaultExpanded` | Boolean | — | `false` | 默认展开 |
| `maxItems` | Number | — | `100` | 最大显示数 |

## FAQ 条目 schema

```json
{
  "id": "faq-001",
  "category": "快速开始",
  "question": "如何安装 yry-cdn？",
  "answer": "npm install yry-cdn 或直接通过 jsDelivr CDN 引用",
  "tags": ["install", "cdn"],
  "priority": "P0"
}
```

## 分类体系

| 分类 | 条目数 | 典型问题 |
|------|:---:|------|
| 快速开始 | 5 | 安装 · 引用 · 初始化 |
| 组件使用 | 8 | Props · 事件 · 样式 |
| 主题系统 | 4 | 令牌 · 切换 · 自定义 |
| 发布管理 | 3 | 版本 · 回滚 · 兼容 |
| 故障排查 | 6 | 不渲染 · 加载失败 · 样式错乱 |
| 性能优化 | 4 | 预加载 · 缓存 · 压缩 |

## 搜索与过滤

| 功能 | 实现 | 性能 |
|------|------|:---:|
| 全文搜索 | 标题 + 答案 grep | ≤ 50ms |
| 分类过滤 | category 标签 | ≤ 16ms |
| 标签过滤 | tags 数组 | ≤ 16ms |
| 模糊匹配 | includes + lowerCase | ≤ 100ms |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 8KB | 6KB | ✅ |
| JS 体积 | ≤ 17KB | 15KB | ✅ |
| CSS 体积 | ≤ 19KB | 17KB | ✅ |
| 面板打开 | ≤ 100ms | 80ms | ✅ |
| 30 条渲染 | ≤ 150ms | 120ms | ✅ |
| 搜索响应 | ≤ 50ms | 40ms | ✅ |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 面板 | `role="dialog"` | Esc 关闭 | 1.3.1 |
| FAQ 项 | `role="accordion"` | Enter / Space | 1.3.1 |
| 展开 | `aria-expanded` | 方向键 | 4.1.2 |
| 搜索 | `role="searchbox"` | 输入 | 1.3.1 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 依赖

- Vue 3 运行时
- PanelHub 依赖