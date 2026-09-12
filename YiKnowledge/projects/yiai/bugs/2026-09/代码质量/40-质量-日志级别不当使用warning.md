---
title: dashboard.py 中 13 处 logger.warning 用于非异常场景
tags: [yiai, code-quality, logging]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# dashboard.py 中 13 处 logger.warning 用于非异常场景

## 现象

`src/server/routes/dashboard.py` 是日志警告最多的文件（13 处 `logger.warning`），但大部分 `warning` 用于非异常场景——数据缺失或格式不完全匹配时记录警告：

```python
logger.warning(f"Missing field '{field}' in document...")
logger.warning(f"Unexpected format for field...")
```

这些场景不应是 WARNING 级别：
- 数据缺失字段 → 应记录为 `INFO` 或 `DEBUG`
- 格式不完全匹配 → 是已知的数据质量问题，不需要告警

## 根因分析

- 开发者使用 `warning` 作为"需要注意但不用惊慌"的通用级别
- 没有日志级别使用规范
- WARNING 在生产环境的日志聚合中会产生告警噪音

## 涉及文件

- `src/server/routes/dashboard.py` — 13 处
- `src/domain/knowledge/scanner.py` — 4 处
- `src/data/repository.py` — 6 处

## 修复方案

1. 数据缺失/格式不完全 → `logger.info` 或 `logger.debug`
2. WARNING 仅用于可恢复的错误（重试成功、降级处理）
3. ERROR 仅用于不可恢复的错误（请求失败、数据损坏）
4. 制定日志级别使用指南

## 预防措施

- Code review 中审查日志级别使用是否恰当

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/knowledge/scanner.py`
- `src/data/repository.py`
- `src/server/routes/dashboard.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
