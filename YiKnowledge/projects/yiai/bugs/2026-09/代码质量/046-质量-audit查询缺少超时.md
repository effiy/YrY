---
title: services/audit/audit_service.py 中查询未设置超时
tags: [yiai, code-quality, timeout]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# services/audit/audit_service.py 中查询未设置超时

## 现象

`src/services/audit/audit_service.py:27` 的审计日志查询使用 MongoDB `find()` 但未设置 `max_time_ms` 超时：

```python
cursor = collection.find(filter_dict).sort("timestamp", -1).skip(offset).limit(limit)
```

`audit_logs` 集合可能随系统运行积累大量记录（尽管有 TTL 索引），在没有超时的情况下大范围扫描可能长时间占用数据库连接。

## 根因分析

- 审计日志有 TTL 索引（`audit_retention_days` 天后自动过期），但累积量仍可能很大
- 没有 `maxTimeMS` 限制的查询在数据量大时可能导致请求超时

## 涉及文件

- `src/services/audit/audit_service.py:27` — 审计日志查询

## 修复方案

```python
cursor = collection.find(filter_dict).max_time_ms(5000).sort("timestamp", -1).skip(offset).limit(limit)
```

## 预防措施

- 所有数据库查询应设置合理的 `maxTimeMS` 超时（默认 30s 上限）

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
