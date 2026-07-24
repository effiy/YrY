# Scene · 开启划词翻译 / 全屏翻译模式

> Story: [main-window](../index.md) · US-M5

## 用户故事

作为用户，我能开启划词翻译 / 全屏翻译模式。

## 验收

- 主窗口提供两个开关：划词翻译 / 全屏翻译。
- 开启划词翻译后，系统级监听选中事件（由 Rust 端 `hotkey.rs` + 系统钩子触发）。
- 全屏翻译开启后，浮层覆盖全屏；关闭后回到主窗口。

## 使用场景 · 组件化

- `<ModeToggle>` 组件承载开关状态；emit `enable(mode)` / `disable(mode)`。
- 主窗口不实现浮层渲染；交由 `<TranslatorOverlay>`（见 overlay-modes 故事）。
