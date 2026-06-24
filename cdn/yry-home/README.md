# YryHome · 文档首页专属样式

> 文档首页专属: 90KB CSS · 六层结构布局 · 统计卡片 · 场景网格

## 文件

```
yry-home/
├── index.html    # 首页样式预览
└── index.css     # 首页专属样式 (90KB CSS, 最大样式文件)
```

## 状态

⚠️ **待完善** — 缺少独立 JS 交互层

## 功能

- 六层结构布局 (hero → stats → stories → scenes → health → footer)
- 统计卡片动画
- 场景网格布局
- 响应式断点适配

## 六层结构详情

| 层 | 区域 | 内容 | 动画 |
|---|------|------|------|
| L1 | hero | 标题 + 副标题 + CTA | 入场淡入 |
| L2 | stats | 6 统计卡（技能/故事/场景/Agent/规则/依赖） | 数字滚动 |
| L3 | stories | 6 故事卡片网格 | hover 浮起 |
| L4 | scenes | 32 场景列表 | 渐进显示 |
| L5 | health | 健康评分 + 趋势 | sparkline 动画 |
| L6 | footer | 链接 + 版本 | — |

## 统计卡片配置

| 卡片 | 数据源 | 字段 | 刷新 |
|------|------|------|:---:|
| 技能数 | `ls skills/*/SKILL.md` | count | 每次生成 |
| 故事数 | `ls cdn/yry-*/README.md` | count | 每次生成 |
| 场景数 | `find cdn -name 'index.md' -path '*/场景-*'` | count | 每次生成 |
| Agent 数 | `find skills -name AGENT.md` | count（AGENT.md 内 9 角色定义） | 每次生成 |
| 规则数 | `find skills -path '*/rules/*.md'` | count | 每次生成 |
| 依赖数 | `jq '.dependencies \| length'` | count | 每次生成 |

## 响应式断点

| 断点 | 宽度 | 布局 | 卡片列数 |
|------|:---:|------|:---:|
| Desktop XL | ≥ 1280px | 6 列 stats · 3 列场景 | 6 / 3 |
| Desktop | 1024-1279px | 4 列 stats · 2 列场景 | 4 / 2 |
| Tablet | 720-1023px | 2 列 stats · 1 列场景 | 2 / 1 |
| Mobile | < 720px | 1 列 stats · 1 列场景 | 1 / 1 |

## 性能优化

| 优化项 | 实现 | 效果 |
|--------|------|------|
| CSS 拆分 | 90KB → 多模块 | 按需加载 |
| 动画 GPU 加速 | `transform: translateZ(0)` | 60fps |
| 图片懒加载 | `loading="lazy"` | 首屏快 |
| 关键 CSS 内联 | 14KB critical | FCP ≤ 310ms |
| 字体预加载 | `preload woff2` | 无 FOIT |

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/yry-home/index.css">
```

## 补充计划

- [ ] 添加 `index.js` 实现首页交互 (统计动画 · 卡片 hover · 搜索过滤)
- [ ] 拆分 90KB CSS 为多个模块文件
- [ ] 添加暗色/亮色主题切换
- [ ] 实现搜索功能（技能/场景/Agent 全文检索）
- [ ] 添加快捷键导航（1-6 切换层级）

## 场景

4 个场景任务故事, 每场景 8 标准交付物。详见 [scenes/README.md](scenes/README.md)

| # | 场景 | 主题 |
|---|------|------|
| 1 | 数据采集与六层聚合 | 数据源采集 · 六层结构聚合 |
| 2 | 实时面板与交互组件 | 实时面板 · 数据绑定 |
| 3 | 交叉导航与可访问性 | 交叉导航 · a11y |
| 4 | 自动化生成管线 | 自动化生成 · 管线集成 |

故事概述: [scenes/故事任务.md](scenes/故事任务.md) · 知识图谱: [scenes/知识图谱.html](scenes/知识图谱.html)