# Story · 翻译与字幕（translate-subtitle）

> 模块：[YiviY Story](../index.md) · `core/_4` ~ `core/_7`

## 场景

- [US-T1 · 选择翻译目标语言并得到质量稳定的译文](scene-1-target-language/index.md)
- [US-T2 · 摘要与翻译可分别配置 prompt 模板](scene-2-prompt-template/index.md)
- [US-T3 · 字幕生成支持 SRT / VTT 多种格式](scene-3-subtitle-format/index.md)
- [US-T4 · 字幕能直接注入原视频，保留时间同步](scene-4-subtitle-injection/index.md)

## 使用场景 · 模块化

- `_4_2_translate` 委派 `core/translate_lines.py`，后者只依赖 `core/prompts.py` 的模板 → 模块边界清晰。
- `_6_gen_sub` 与 `_7_sub_into_vid` 之间通过中间文件（SRT）通信，不直接函数调用 → 解耦。
