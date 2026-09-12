---
title: RAG 索引持久化路径硬编码为 data/rag_store
tags: [yiai, code-quality, config]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# RAG 索引持久化路径硬编码为 data/rag_store

## 现象

`domain/rag/paths.py` 中 RAG 索引的持久化目录硬编码为字符串拼接，未从 `config.yaml` 读取：

```python
# paths.py — 硬编码路径
persist_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "rag_store")
```

## 涉及文件

- `src/domain/rag/paths.py`

## 修复方案

从 `settings.rag_persist_dir` 读取，在 `config.yaml` 中配置。

## 预防措施

文件系统路径不应硬编码在业务逻辑中。

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/rag/paths.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
