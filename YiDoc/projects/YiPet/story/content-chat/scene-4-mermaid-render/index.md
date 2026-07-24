# US-C4 · Mermaid 图表渲染 + 复制代码

> Story: [content-chat](../index.md) · 前端组件化

## 用户故事

作为阅读含流程图回答的用户，我想让回答中的 ```mermaid 代码块自动渲染为 SVG 图，代码块带"复制"按钮，以便直观理解并便捷引用。

## 验收标准

- 回答流式结束后扫描 ```mermaid 代码块，500ms 内渲染为 SVG；渲染失败则回退为原文 + 错误提示。
- 非 mermaid 代码块带"复制"按钮，点击后 80ms 内复制到剪贴板并显示 toast。
- SVG 可右键"另存为图片"，复用浏览器原生菜单，不引入额外依赖。

## 使用场景 · 组件化

- `<CodeBlock>` 统一渲染所有代码块：language=`mermaid` 时挂载 `<MermaidRenderer>`，否则挂载 `<CopyButton>`。
- `<MermaidRenderer>` 自带错误边界：捕获异常后渲染 `<pre>` 原文 + 错误 chip，不冒泡到 `<MessageList>`。
