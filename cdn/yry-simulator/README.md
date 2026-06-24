# YrySimulator · 管线模拟器

> 管线模拟器: 可视化 YrY SDLC 管线流程

## 文件

```
yry-simulator/
├── index.html    # 管线模拟器 Demo 预览页
├── index.js      # 模拟器逻辑 (7KB JS)
└── index.css     # 模拟器样式: 管线阶段 · 连接线 · Gate 检查点 · 状态面板
```

## 功能

- 管线阶段可视化 (active/done 状态)
- 状态流转模拟
- Gate A/B 检查点展示 (pass/block)
- 模块 P0 清零状态追踪

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-simulator/index.css">
<script src="../../../../cdn/yry-simulator/index.js"></script>
```

## CSS 类

| 类 | 用途 |
|------|------|
| `.sim-container` | 模拟器容器 |
| `.sim-phase` | 管线阶段 (active/done) |
| `.sim-arrow` | 连接线 (done) |
| `.sim-gate` | Gate 检查点 (pass/block) |
| `.sim-stat` | 状态统计卡 |

## 依赖

无外部依赖