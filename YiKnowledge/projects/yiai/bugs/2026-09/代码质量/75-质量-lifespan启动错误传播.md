---
title: app.py lifespan 中 RSS/Knowledge 初始化未 await 异常传播不明确
tags: [yiai, code-quality, lifecycle]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# app.py lifespan 中 RSS/Knowledge 初始化未 await 异常传播不明确

## 现象

`app.py` 的 `lifespan` 中启动 RSS 和 Knowledge 初始化时使用 `try/except` 吞没异常，但未区分"可选服务"和"必需服务"：

```python
try:
    init_rss_system()
except Exception:
    logger.warning("RSS init failed")

try:
    await init_knowledge_watcher()
except Exception:
    logger.warning("Knowledge watcher failed")
```

如果 Knowledge watcher 启动失败，RAG 功能完全不可用但无告警。如果 RSS 失败，RSS 功能静默不可用。

## 涉及文件

- `src/app.py` — lifespan 启动逻辑

## 修复方案

区分可选服务（RSS）和核心服务（Knowledge watcher），后者失败应有更高级别的告警或阻止启动。

## 预防措施

lifespan 中应明确标注服务的关键级别。

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `app.py`
- `src/app.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
