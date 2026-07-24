# Scene · NLP / 语义切分粒度可调

> Story: [download-split](../index.md) · US-D3

## 用户故事

作为用户，NLP / 语义切分粒度可调（细粒度 / 句级 / 段级）。

## 验收

- 切分模式可配置：NLP / 语义 / 句级。
- 每行长度目标可配置（默认 30-50 字符）。
- 切分结果保留原始时间戳映射。

## 使用场景 · 模块化

- `_3_1_split_nlp.py` 与 `_3_2_split_meaning.py` 共享 `core/spacy_utils/` 基础。
- 切分器选择由 `config.yaml` 驱动；两个切分器互不感知 → 边界稳定。
