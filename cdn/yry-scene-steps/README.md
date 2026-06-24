# YrySceneSteps · 场景步骤条

> Vanilla 组件 · 零依赖 · 自定义元素 `<yry-scene-steps>` · 场景步骤导航

## 文件

```
yry-scene-steps/
├── index.html    # 模板源 + Demo 预览
├── index.js      # 步骤条交互逻辑 (3KB JS)
└── index.css     # 组件样式 (2KB CSS)
```

## 功能

- 场景步骤展开/折叠
- 步骤 checkbox 状态切换
- 当前步骤高亮

## 使用

纯 HTML 结构, 零配置:

```html
<link rel="stylesheet" href="../../../../cdn/yry-scene-steps/index.css">
<script src="../../../../cdn/yry-scene-steps/index.js"></script>
<yry-scene-steps>
  <div class="step">
    <div class="step-header">步骤 1: 需求分析</div>
    <div class="step-body">需求分析内容...</div>
  </div>
  <div class="step">
    <div class="step-header">
      <input type="checkbox" class="step-checkbox" checked> 步骤 2: 设计
    </div>
    <div class="step-body">设计内容...</div>
  </div>
</yry-scene-steps>
```

## 交互

| 行为 | 触发 | 效果 |
|------|------|------|
| 展开/折叠 | 点击 `.step-header` | toggle `.step-body.open` |
| 状态变更 | 勾选 `.step-checkbox` | step 添加/移除 `.done` 类 |

## 依赖

无。零依赖 vanilla JS, 不依赖 Vue 3。

## 设计令牌

`--yry-accent-rgb` / `--yry-pass-rgb` / `--yry-warn-rgb`