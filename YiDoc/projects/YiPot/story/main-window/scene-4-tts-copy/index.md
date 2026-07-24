# Scene · 翻译结果朗读（TTS）并复制

> Story: [main-window](../index.md) · US-M4

## 用户故事

作为用户，翻译结果能朗读（TTS）并复制。

## 验收

- "朗读" 按钮调用 `services/tts/<engine>/` 朗读译文；朗读中可停止。
- "复制" 按钮一键复制译文到剪贴板；成功显示 toast。
- TTS 引擎不可用时禁用朗读按钮并提示原因。

## 使用场景 · 组件化

- `<ResultActions>` 组件承载朗读 / 复制按钮；emit `speak` / `copy`。
- `hooks/useTTS()` + `hooks/useClipboard()` 承载副作用；组件保持纯渲染。
