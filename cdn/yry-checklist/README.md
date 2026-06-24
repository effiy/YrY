# YryChecklist · 计划清单专属样式

> 计划清单页面专属 CSS: 勾选交互 · 进度条 · 风险行 · 标签页 · 批量操作栏

## 文件

```
yry-checklist/
├── index.html    # 清单组件预览页
├── index.css     # 清单专属样式 (19KB CSS)
└── scenes/       # 4 场景任务故事 (× 8 交付物)
```

## 状态

⚠️ **待完善** — 缺少独立 JS 交互层,当前依赖 `shared/index.js` 提供的通用功能

## CSS 组件

| 组件 | CSS 类 | 说明 |
|------|--------|------|
| 勾选项 | `.yry-check-item` | checkbox 交互样式 |
| 进度条 | `.yry-progress-*` | 清单进度指示 |
| 风险行 | `.yry-risk-row` | 风险条目样式 |
| 标签页 | `.yry-tabs` · `.yry-tab` · `.yry-panel` | 清单标签切换 |
| 批量操作 | `.yry-batch-bar` | 批量操作工具栏 |

## 场景

4 个场景任务故事, 每场景 8 标准交付物。详见 [scenes/README.md](scenes/README.md)

| # | 场景 | 主题 |
|---|------|------|
| 1 | 模板架构与 CSS 设计系统 | 模板架构 · CSS 分层 |
| 2 | 清单交互组件实现 | 交互组件 · 数据流 |
| 3 | 验证报告与健康面板集成 | 报告集成 · 健康面板 |
| 4 | 批量生成与自循环机制 | 批量生成 · 自循环 |

## CSS 设计令牌 (清单专属)

| 令牌 | 默认值 | 用途 |
|------|------|------|
| `--yry-cl-accent` | `#FFC107` | 清单主色（勾选/进度） |
| `--yry-cl-pass` | `#22c55e` | 通过态 |
| `--yry-cl-fail` | `#ef4444` | 失败态 |
| `--yry-cl-warn` | `#f59e0b` | 警告态 |
| `--yry-cl-skip` | `#6b7280` | 跳过态 |
| `--yry-cl-bg` | `rgba(22,22,32,1)` | 清单背景 |
| `--yry-cl-card` | `linear-gradient(...)` | 卡片背景 |
| `--yry-cl-border` | `1px solid rgba(255,255,255,.06)` | 边框 |
| `--yry-cl-shadow` | `0 4px 20px rgba(0,0,0,.3)` | 阴影 |
| `--yry-cl-radius` | `12px` | 圆角 |

## 交互组件清单

| 组件 | 触发 | 状态存储 | 动画 | 优先级 |
|------|------|------|------|:---:|
| 勾选进度联动 | click | localStorage | 0.5s ease | P0 |
| 折叠面板 | click | CSS class | 0.3s ease-out | P0 |
| 标签页切换 | click / 键盘 1-9 | localStorage | opacity | P0 |
| 风险行展开 | click | CSS class | max-height | P1 |
| 交付物过滤 | click | CSS class | opacity | P1 |
| 复制路径 | click | — | toast 0.15s | P1 |

## BEM 命名规范

| 层级 | 命名 | 示例 |
|------|------|------|
| Block | `.yry-checklist` | 清单容器 |
| Element | `.yry-checklist__item` | 清单项 |
| Modifier | `.yry-checklist__item--done` | 已完成态 |
| State | `.is-expanded` / `.is-loading` | 交互态 |

## 响应式断点

| 断点 | 宽度 | 布局变化 |
|------|:---:|------|
| Desktop | ≥ 1024px | 双列（清单 + 可视化） |
| Tablet | 768-1023px | 单列，卡片 2 列 |
| Mobile | < 768px | 单列，卡片 1 列 |

## a11y 语义

| 区域 | 语义角色 | ARIA | 键盘 |
|------|------|------|------|
| 头部 | `banner` | — | — |
| 清单 | `region` | `aria-label` | Space 勾选 |
| 进度 | `region` | `aria-live="polite"` | — |
| 风险 | `region` | `aria-expanded` | Enter 展开 |

故事概述: [scenes/故事任务.md](scenes/故事任务.md) · 知识图谱: [scenes/知识图谱.html](scenes/知识图谱.html)

## 补充计划

- [ ] 添加 `index.js` 实现清单交互逻辑 (勾选 · 进度计算 · 批量操作)
- [ ] 将交互逻辑从 `shared/index.js` 迁移到专属 JS
- [ ] 补充 a11y 完整性测试（axe-core）
- [ ] 添加暗色/亮色双主题支持
- [ ] 实现组件级 Shadow DOM 封装