# Scene · 划词后按快捷键触发翻译

> Story: [overlay-modes](../index.md) · US-O1

## 用户故事

作为用户，在任何应用中划词后按快捷键触发翻译。

## 验收

- 系统钩子捕获选中文本 + 快捷键；发送事件到主进程。
- 主进程调用 `lingua` 检测源语言，调默认引擎翻译。
- 结果以浮层形式出现于鼠标附近；浮层 reuse 主窗口的 input/output 结构。

## 使用场景 · 组件化

- `<TranslatorOverlay>` 组件复用主窗口的 `<TranslatorInput>` / `<TranslatorOutput>`。
- overlay 与主窗口共享 `hooks/useTranslate()`，差异仅在容器与定位。
