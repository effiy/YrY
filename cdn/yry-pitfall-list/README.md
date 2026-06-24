# YryPitfallList · 陷阱列表组件

> Vanilla 组件 · 自定义元素 `<yry-pitfall-list>` · 常见陷阱/反模式列表

## 文件

```
yry-pitfall-list/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 列表交互逻辑
└── index.css     # 组件样式 (4KB CSS)
```

## 功能

- 陷阱/反模式列表展示
- 严重程度分级 (pass / warn / fail / cyan)
- 使用 4 种语义色令牌

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-pitfall-list/index.css">
<script src="../../../../cdn/yry-pitfall-list/index.js"></script>
<yry-pitfall-list></yry-pitfall-list>
```

## 依赖

无外部依赖，纯 Web Component