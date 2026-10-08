---
title: indexer.py 中 open() 未指定 encoding 参数
tags: [yiai, code-quality, encoding]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# indexer.py 中 open() 未指定 encoding 参数

## 现象

`src/domain/rag/indexer.py:449` 在读取知识库 markdown 文件时，`open()` 调用未指定 `encoding="utf-8"`：

```python
with open(os.path.join(root, f)) as fh:
```

而同文件第 300 行正确指定了编码：
```python
with open(docstore, encoding="utf-8") as f:
```

其他模块（`scanner.py`、`config.py`）也都正确使用了 `encoding="utf-8"`。

## 根因分析

- `indexer.py:449` 位于分类数据重建函数中（`_load_categories_from_disk`），可能是后续添加的代码
- Python 3 的默认编码是 UTF-8，但在 Windows 上可能是系统 locale（如 cp1252）
- 知识库文件明确要求 UTF-8（YiKnowledge 规范），不一致的编码处理可能导致数据损坏

## 涉及文件

- `src/domain/rag/indexer.py:449` — 缺少 `encoding="utf-8"`

## 修复方案

```python
with open(os.path.join(root, f), encoding="utf-8") as fh:
```

## 预防措施

- 项目中启用 ruff 规则 `PLW1514` 确保所有 `open()` 指定 `encoding`

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `scanner.py`
- `config.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
