# Scene · 全屏翻译浮层能拖拽与关闭

> Story: [overlay-modes](../index.md) · US-O2

## 用户故事

作为用户，全屏翻译浮层能拖拽与关闭。

## 验收

- 浮层置顶，半透明遮罩 + 中心卡片；卡片可拖拽。
- 关闭按钮 / Esc 键 / 点击遮罩外任一处均可关闭。
- 主题跟随 `config.json` 的 `theme` 字段。

## 使用场景 · 组件化

- `<OverlayFrame>` 组件统一拖拽 / 关闭 / 主题；内部 slot 接收业务内容。
- `<TranslatorOverlay>` 组合 `<OverlayFrame>` + 主窗口的翻译组件，不重复实现拖拽逻辑。
