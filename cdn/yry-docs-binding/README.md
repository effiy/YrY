# YryDocsBinding · 文档绑定组件

> Vue 3 组件 · 自定义元素 `<yry-docs-binding>` · 最复杂组件 (84KB JS)

## 文件

```
yry-docs-binding/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader + 文档绑定逻辑 (84KB JS, 最大 JS 文件)
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 文档与场景的关联绑定
- 多对多关系管理
- 文档引用完整性检查

## Props API

| Prop | 类型 | 必填 | 默认 | 说明 |
|------|------|:---:|--------|------|
| `bindings` | Array | ✅ | `[]` | 绑定关系数组 |
| `docs` | Array | — | `[]` | 文档列表 |
| `scenes` | Array | — | `[]` | 场景列表 |
| `filterable` | Boolean | — | `true` | 启用过滤 |
| `showOrphans` | Boolean | — | `false` | 显示孤立文档 |

## 绑定关系 schema

```json
{
  "id": "binding-001",
  "docId": "doc-001",
  "sceneId": "场景-1",
  "relation": "implements",
  "strength": "strong",
  "evidence": "doc:42 scene:15"
}
```

## 关系类型

| relation | 含义 | 强度 |
|----------|------|:---:|
| `implements` | 文档实现场景 | strong |
| `references` | 文档引用场景 | medium |
| `extends` | 文档扩展场景 | medium |
| `replaces` | 文档替代场景 | weak |
| `deprecated` | 已废弃 | none |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 15KB | 12KB | ✅ |
| JS 体积 | ≤ 90KB | 84KB | ✅ |
| CSS 体积 | ≤ 3KB | 2KB | ✅ |
| 面板打开 | ≤ 300ms | 250ms | ✅ |
| 100 绑定渲染 | ≤ 200ms | 180ms | ✅ |
| 引用检查 | ≤ 500ms | 400ms | ✅ |

## 引用完整性检查

| 检查项 | 方法 | 阈值 | 频率 |
|--------|------|:---:|:---:|
| 双向引用 | doc ↔ scene | 100% | CI |
| 孤立文档 | 无场景绑定 | ≤ 5% | 周报 |
| 孤立场景 | 无文档绑定 | ≤ 5% | 周报 |
| 强度评级 | 关系强度分布 | — | 月报 |

## a11y 语义

| 元素 | ARIA | 键盘 | WCAG |
|------|------|------|:---:|
| 面板 | `role="dialog"` | Esc 关闭 | 1.3.1 |
| 绑定列表 | `role="list"` | Tab | 1.3.1 |
| 绑定项 | `role="listitem"` | Enter 展开 | 1.3.1 |
| 状态 | `aria-live="polite"` | — | 4.1.3 |

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