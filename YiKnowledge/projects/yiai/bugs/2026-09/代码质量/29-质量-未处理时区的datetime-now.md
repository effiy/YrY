---
title: datetime.now() 未指定时区导致 naive datetime
tags: [yiai, code-quality, timezone]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# datetime.now() 未指定时区导致 naive datetime

## 现象

8 处使用 `datetime.now()` 而非 `datetime.now(timezone.utc)`，产生 naive datetime 对象：

```python
# storage.py:82,111
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# local.py:505
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# repository.py:666,668,701
date_str = datetime.now().strftime("%Y-%m-%d")
```

而在同项目其他位置（如 `audit/decorator.py`、`audit/logger.py`、`rss/feed.py`、`knowledge/watcher.py`）已正确使用 `datetime.now(timezone.utc)`。

## 根因分析

- 早期代码使用 `datetime.now()`（本地时区），后来的模块改用 `datetime.now(timezone.utc)`
- naive datetime 在跨时区部署时会导致文件名时间戳偏移
- MongoDB 存储时间不一致（部分是本地时区，部分是 UTC）
- 时区转换时可能抛出 `TypeError: can't compare offset-naive and offset-aware datetimes`

## 涉及文件

- `src/domain/files/storage.py:82,111` — 文件上传时间戳
- `src/domain/files/local.py:505` — 本地文件时间戳
- `src/data/repository.py:666,668,701` — bug/issue 归档日期

## 修复方案

将所有 `datetime.now()` 替换为 `datetime.now(timezone.utc)`，保持全局 UTC 一致。

## 预防措施

- 启用 ruff 规则 `DTZ005`（`datetime.now()` without `tz`）
- 所有时间戳使用 UTC 存储，仅在展示层转换为本地时区

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
