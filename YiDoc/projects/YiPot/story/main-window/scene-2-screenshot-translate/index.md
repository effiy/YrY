# Scene · 截屏翻译（OCR + 翻译一气呵成）

> Story: [main-window](../index.md) · US-M2

## 用户故事

作为用户，我能截屏翻译（OCR + 翻译一气呵成）。

## 验收

- 截屏按钮调用 `screenshots` crate 框选；图片送 `system_ocr.rs` 识别。
- OCR 失败时回退 `tesseract.js` 浏览器端识别；仍失败显示空结果 + 重试。
- 识别文本自动填入输入区，立即触发翻译。

## 使用场景 · 组件化

- `<OCRPanel>` 组件承载截屏按钮 + 预览 + 识别状态；emit `recognized(text)`。
- `hooks/useOCR()` composable 封装双通道识别（system → tesseract fallback）；组件仅消费结果。
