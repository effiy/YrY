# Story · 子窗口 · 配置 / 历史 / 关于

> 页面：[YiPot Story](../index.md) · `src/window/`

## 场景

- [US-W1 · 配置窗口调整引擎 key、快捷键、主题](scene-1-config/index.md)
- [US-W2 · 历史窗口查看 / 搜索 / 重用过往翻译](scene-2-history/index.md)
- [US-W3 · 关于窗口检查更新与反馈](scene-3-about/index.md)

## 使用场景 · 组件化

- 每个子窗口是独立 React root；共享 `<WindowControl>`（最小化 / 关闭按钮）与 `<YiForm>` 风格组件。
- 子窗口间通过 Tauri 事件通信，不共享 React state → 解耦。
