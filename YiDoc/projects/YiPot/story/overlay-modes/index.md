# Story · 划词 / 全屏翻译模式

> 页面：[YiPot Story](../index.md) · overlay

## 场景

- [US-O1 · 在任何应用中划词后按快捷键触发翻译](scene-1-selection-translate/index.md)
- [US-O2 · 全屏翻译浮层能拖拽与关闭](scene-2-fullscreen-overlay/index.md)

## 使用场景 · 组件化

- 浮层用 `<TranslatorOverlay>` 组件复用主窗口的 input/output 结构。
- overlay 与主窗口共享 `hooks/useTranslate()`，差异仅在容器与定位。
