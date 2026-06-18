---
name: 🆕 Component proposal
about: 提议新增 yry-* 组件(任何层级的 UI 元素都可)
title: "[component] yry-<name>"
labels: enhancement, component
assignees: ''
---

## 用途

<!-- 一句话说明这个组件解决什么问题 -->

## API 设计

### Props

| name | type | required | default | 说明 |
|------|------|----------|---------|------|
| `?`  | `?`  | ?        | `?`     | ?    |

### Events

| event | detail | 说明 |
|-------|--------|------|
| `?-ready` | `{ ? }` | ? |

### Slots

| name | 说明 |
|------|------|
| `?`  | ?    |

## Demo 设想

<!-- 文字描述预期 UI 效果,可附 Figma/Sketch 截图 -->

## 依赖

- 内部: [列出依赖的现有组件,如 yry-tag-chip, yry-item-card]
- 外部: [如 html2canvas, cytoscape]

## 设计令牌

<!-- 列出本组件会用到的 CSS 变量,确保已在 theme.css 中 -->

- [ ] `--yry-color-*`
- [ ] `--yry-elevation-*`
- [ ] `--yry-ease-out`

## 加载链

<!-- 描述在 HTML 中的加载顺序 -->

## 替代方案调研

<!-- 是否考虑过其他实现? 为什么选这种? -->

## 文档规划

- [ ] `cdn/yry-<name>/index.html` (Demo + Template)
- [ ] `cdn/yry-<name>/index.js` (Loader)
- [ ] `cdn/yry-<name>/index.css` (Styles)
- [ ] README.md 中更新组件清单
- [ ] 场景文档: 故事任务面板/yry-breadcrumb/ 或新增故事

## 影响

- [ ] 增加 components.manifest.json 条目(自动生成)
- [ ] 增加 README 组件清单条目
- [ ] 不破坏现有 API
- [ ] 不引入新外部依赖
- [ ] 通过所有 D0-D7 健康维度