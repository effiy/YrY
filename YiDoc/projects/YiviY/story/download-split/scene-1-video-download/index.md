# Scene · 提供视频 URL，系统下载并切分为可处理单元

> Story: [download-split](../index.md) · US-D1

## 用户故事

作为用户，我提供视频 URL，系统下载并切分为可处理单元。

## 验收

- 输入 URL → `yt-dlp` 下载到 `output/`；文件名规范化。
- 音轨提取（ffmpeg）；音轨采样率 16kHz 单声道。
- 长视频按静音段切分为可处理 chunk；chunk 元数据入 `output/segments.json`。

## 使用场景 · 模块化

- `_1_ytdlp.py` 是阶段入口；下载与切分委派 `core/utils/`。
- 下游阶段只读 `output/segments.json` → 阶段间通过中间文件契约解耦。
