# Scene · 输入或粘贴文本选择引擎得到翻译

> Story: [main-window](../index.md) · US-M1

## 用户故事

作为用户，我输入或粘贴文本，选择引擎后得到翻译结果。

## 验收

- 文本输入区支持键入与粘贴；粘贴后自动去首尾空白。
- 选择引擎后按 `Ctrl+Enter` 或点"翻译"触发；未输入时禁用按钮。
- 结果区显示译文 + 源语言 / 目标语言；失败显示错误 toast。

## 使用场景 · 组件化

- `<TranslatorInput>` 组件持有文本 + 引擎选择；emit `submit(text, engineId)`。
- `hooks/useTranslate()` composable 承载请求生命周期（loading / result / error），与渲染解耦。
