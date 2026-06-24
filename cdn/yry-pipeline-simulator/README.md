# YryPipelineSimulator · 管线模拟器

> Vanilla 组件 · 自定义元素 `<yry-pipeline-simulator>` · 10KB JS · SDLC 管线可视化

## 文件

```
yry-pipeline-simulator/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 模拟器逻辑 (10KB JS)
└── index.css     # 组件样式 (7KB CSS)
```

## 功能

- YrY SDLC 管线阶段可视化
- Gate A/B 检查点展示
- 模块 P0 清零状态追踪
- 4 种语义色令牌: pass / fail / accent / cyan

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-pipeline-simulator/index.css">
<script src="../../../../cdn/yry-pipeline-simulator/index.js"></script>
<yry-pipeline-simulator></yry-pipeline-simulator>
```

## 依赖

无外部依赖，纯 Web Component