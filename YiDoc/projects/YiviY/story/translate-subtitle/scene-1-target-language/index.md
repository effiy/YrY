# Scene · 选择翻译目标语言并得到质量稳定的译文

> Story: [translate-subtitle](../index.md) · US-T1

## 用户故事

作为用户，我能选择翻译目标语言并得到质量稳定的译文。

## 验收

- `config.yaml` 配 `target_language`；翻译保留术语与专有名词。
- 长文本分批翻译；每批 ≤ N 行；失败批次可单独重试。
- 术语表（glossary）可选上传；命中术语强制使用。

## 使用场景 · 模块化

- `_4_2_translate.py` 委派 `core/translate_lines.py`；后者只依赖 `core/prompts.py` 模板。
- backend（OpenAI / DeepSeek）适配在 `translate_lines.py` 内；阶段模块不感知 provider。
