# Scene · 字幕生成支持 SRT / VTT 多种格式

> Story: [translate-subtitle](../index.md) · US-T3

## 用户故事

作为用户，字幕生成支持 SRT / VTT 多种格式。

## 验收

- `config.yaml` 配 `subtitle_format`：`srt` / `vtt`。
- `_6_gen_sub.py` 支持两种格式输出到 `output/`。
- 格式不影响下游注入阶段。

## 使用场景 · 模块化

- `_6_gen_sub.py` 通过共享 writer 输出多格式；格式实现集中在 `core/utils/sub_writers.py`。
- `_7_sub_into_vid.py` 只读文件路径 → 不感知格式实现细节。
