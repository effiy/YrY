# Scene · 最终视频与原视频的时长差 ≤ 容差

> Story: [dub-synthesis](../index.md) · US-P3

## 用户故事

作为用户，最终视频与原视频的时长差 ≤ 容差。

## 验收

- `_11_merge_audio.py` 合并 chunk；总时长与原视频对齐。
- `_12_dub_to_vid.py` 将配音替换进视频；时长差 ≤ `duration_tolerance`（默认 1.5x）。
- 超过容差触发 speed 调整，并在 UI 标记。

## 使用场景 · 模块化

- 容差检测在 `_12`；speed 调整委派 `core/utils/audio_speed.py`。
- `_11` 与 `_12` 通过中间音频文件通信；阶段可独立重跑。
