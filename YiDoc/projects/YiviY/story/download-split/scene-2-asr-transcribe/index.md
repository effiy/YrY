# Scene · ASR 识别多语种并产出带时间戳的转录文本

> Story: [download-split](../index.md) · US-D2

## 用户故事

作为用户，ASR 能识别多语种并产出带时间戳的转录文本。

## 验收

- ASR 自动检测源语言；支持多语种混读。
- 输出带词级时间戳的 JSON；可降级到句级。
- WhisperX GPU 不可用时回退 CTranslate2 加速 Whisper。

## 使用场景 · 模块化

- `_2_asr.py` 只调 `core/asr_backend/` 抽象；不 import 具体 backend SDK。
- backend 切换由 `config.yaml` 驱动；阶段模块零改动 → 可插拔边界。
