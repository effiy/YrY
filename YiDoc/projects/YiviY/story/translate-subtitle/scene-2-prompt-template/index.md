# Scene · 摘要与翻译可分别配置 prompt 模板

> Story: [translate-subtitle](../index.md) · US-T2

## 用户故事

作为用户，摘要与翻译可分别配置 prompt 模板。

## 验收

- `_4_1_summarize.py` 与 `_4_2_translate.py` 使用不同模板。
- 模板集中在 `core/prompts.py`；可被 config 覆盖。
- 占位符（`{glossary}` / `{context}`）显式声明；缺失报错。

## 使用场景 · 模块化

- `core/prompts.py` 是 prompt SoT；阶段模块只 import 不内嵌字符串。
- 模板变更不影响阶段逻辑 → 模板与流程解耦。
