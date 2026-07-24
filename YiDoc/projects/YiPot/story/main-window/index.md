# Story · 主窗口 · 翻译主界面

> 页面：[YiPot Story](../index.md) · `src/App.jsx` + `src/main.jsx`

## 场景

- [US-M1 · 输入或粘贴文本选择引擎得到翻译](scene-1-text-translate/index.md)
- [US-M2 · 截屏翻译（OCR + 翻译一气呵成）](scene-2-screenshot-translate/index.md)
- [US-M3 · 切换 21 个翻译引擎并对比结果](scene-3-engine-switch/index.md)
- [US-M4 · 翻译结果朗读（TTS）并复制](scene-4-tts-copy/index.md)
- [US-M5 · 开启划词翻译 / 全屏翻译模式](scene-5-overlay-mode/index.md)

## 使用场景 · 组件化

- 主窗口拆为 `<TranslatorInput>` / `<TranslatorOutput>` / `<EngineSelector>` / `<OCRPanel>` 等组件；`App.jsx` 仅编排。
- `hooks/useTranslate()` / `useOCR()` 抽出副作用，组件保持纯渲染。
- `services/` 统一引擎适配接口，组件只依赖抽象。
