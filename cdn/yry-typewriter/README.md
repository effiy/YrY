# YryTypewriter · 终端模拟器

> 终端模拟器: 打字机效果 · 命令行动画

## 文件

```
yry-typewriter/
├── index.html    # 终端模拟器 Demo 预览页
├── index.js      # 打字机动画逻辑 (2KB JS)
└── index.css     # 终端样式: 命令行 · 提示符 · 光标动画 · 高亮输出
```

## 功能

- 打字机逐字显示效果
- 命令行提示符动画
- 光标闪烁动画
- 可配置打字速度和延迟

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-typewriter/index.css">
<script src="../../../../cdn/yry-typewriter/index.js"></script>
```

## CSS 类

| 类 | 用途 |
|------|------|
| `.typewriter-terminal` | 终端容器 (含头部装饰) |
| `.typewriter-line` | 命令行 |
| `.typewriter-prompt` | 提示符 ($) |
| `.typewriter-text` | 输入文字 |
| `.typewriter-output` | 输出文字 |
| `.typewriter-cursor` | 闪烁光标 |
| `.hl-accent/pass/fail/cyan` | 输出高亮色 |

## 关联

- 演示组件: [yry-typewriter-demo](../yry-typewriter-demo/README.md) (终端演示, 完整实现 6KB JS + 4KB CSS)

## 依赖

无外部依赖