---
title: main.py 中硬编码端口 10086 未从 config 读取
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

# main.py 中硬编码端口 10086 未从 config 读取

## 现象

`main.py` 直接硬编码了 uvicorn 的 host 和 port 参数，未从 `config.yaml` 或 `settings` 读取：

```python
uvicorn.run("src.app:app", host="0.0.0.0", port=10086, reload=False)
```

而 `config.yaml` 中可能有 `server` 配置段但未被 `main.py` 使用。与 bug #63（uvicorn 配置不一致）互补——本缺陷强调 config.yaml 应该有 `server.port` 配置但被硬编码覆盖。

## 根因分析

- `main.py` 追求"开箱即用"的开发体验
- 但端口号 10086 是约定的默认值，应与 config 保持一致

## 涉及文件

- `main.py` — 硬编码 host/port

## 修复方案

```python
from src.shared.config import settings
uvicorn.run("src.app:app", host=settings.server_host, port=settings.server_port)
```

## 预防措施

- 所有端口/地址配置必须可配置，不硬编码

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `main.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
