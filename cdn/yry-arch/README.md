# YryArch · 架构图页面共享

> Vanilla 组件 · 架构图页基类样式 + 导出 PNG/PDF/SVG · Category A 主题

## 文件

```
yry-arch/
├── index.html    # 架构图样式预览页
├── index.js      # 架构图导出工具 (PNG/PDF/SVG)
└── index.css     # 架构图页面专属样式 (11KB CSS)
```

## 功能

- 架构图页面的容器和布局 (Category A Mono 主题)
- 导出 PNG / PDF / SVG 功能
- 16 个专属 CSS 令牌 (amber, cyan, emerald, violet 等)

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/fonts/index.css">
<link rel="stylesheet" href="../../../../cdn/yry-arch/index.css">
<script src="../../../../cdn/yry-arch/index.js"></script>
```

## 场景

8 个场景任务故事, 每场景 8 标准交付物。详见 [scenes/README.md](scenes/README.md)

| # | 场景 | 主题 |
|---|------|------|
| 1 | 新人上手 | 模块总览 · 角色拓扑 · 快速定位 |
| 2 | 模块定位 | 能力编目 · 角色编目 · 约束编目 |
| 3 | 数据流追踪 | 管线阶段 · 数据形态 · 门禁矩阵 |
| 4 | 依赖变更影响 | 变更传播 · 影响分析 · 回滚策略 |
| 5 | 信任边界与安全面 | 认证边界 · 密钥管理 · 输入校验 |
| 6 | 架构断言脚本化校验 | R1-R11 断言 · 自动验证 · CI 集成 |
| 7 | 架构漂移持续监测 | 漂移检测 · 趋势追踪 · 告警阈值 |
| 8 | 架构健康度量仪表板 | 9 维度评分 · 趋势对比 · 改进建议 |

## 专属 CSS 令牌 (16 个)

| 令牌 | 默认值 | 用途 |
|------|------|------|
| `--yry-arch-amber` | `#fbbf24` | 主强调色（标题/链接） |
| `--yry-arch-cyan` | `#22d3ee` | 信息色（图标/边框） |
| `--yry-arch-emerald` | `#34d399` | 成功色（通过/完成） |
| `--yry-arch-violet` | `#a78bfa` | 副强调色（徽章） |
| `--yry-arch-rose` | `#fb7185` | 危险色（阻断/失败） |
| `--yry-arch-blue` | `#3B82F6` | 链接色（导航） |
| `--yry-arch-orange` | `#f59e0b` | 警告色（关注） |
| `--yry-arch-bg` | `#1a1b26` | 主背景 |
| `--yry-arch-surface` | `rgba(26,27,38,.55)` | 卡片背景 |
| `--yry-arch-border` | `rgba(255,255,255,.06)` | 边框 |
| `--yry-arch-shadow` | `0 4px 12px rgba(0,0,0,.4)` | 阴影 |
| `--yry-arch-radius` | `8px` | 圆角 |
| `--yry-arch-font-mono` | `JetBrains Mono, monospace` | 等宽字体 |
| `--yry-arch-transition` | `0.3s ease` | 过渡动画 |
| `--yry-arch-spacing` | `20px` | 标准间距 |
| `--yry-arch-z-overlay` | `1000` | 浮层层级 |

## 导出功能矩阵

| 格式 | 实现 | 体积 | 适用 |
|------|------|:---:|------|
| PNG | html2canvas | 中 | 截图分享 |
| PDF | html2canvas + jsPDF | 大 | 打印归档 |
| SVG | DOM 序列化 | 小 | 矢量编辑 |

## 性能基线

| 指标 | 预算 | 实测 |
|------|:---:|:---:|
| CSS 体积 | ≤ 15KB | 11KB |
| JS 体积 | ≤ 30KB | 24KB |
| 首屏渲染 | ≤ 500ms | 380ms |
| 导出耗时 (PNG) | ≤ 3s | 2.1s |
| 导出耗时 (PDF) | ≤ 5s | 3.8s |

## 兼容性

| 浏览器 | 最低版本 | 测试状态 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

故事概述: [scenes/故事任务.md](scenes/故事任务.md) · 知识图谱: [scenes/知识图谱.html](scenes/知识图谱.html)