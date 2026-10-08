---
title: 多处 find() 查询未使用投影限制返回字段
tags: [yiai, code-quality, performance]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# 多处 find() 查询未使用投影限制返回字段

## 现象

多个集合查询使用 `find({}, {"_id": 0})` 或 `find({})` 返回文档的全部字段，即使只需要部分字段。这导致不必要的网络传输和内存开销。

典型模式：
```python
# 只需要 path 字段，却返回整个文档
cursor = collection.find({}, {"path": 1, "_id": 0})

# 只需要 source_name，却返回全部字段
rss_cursor = rss_collection.find({}, {"_id": 0, "source_name": 1})

# 获取所有用户，但没有排除大字段
users_cursor = users_coll.find({}, {"_id": 0, "password": 0})
```

## 根因分析

- 开发者习惯使用 `{"_id": 0}` 排除 `_id` 后返回全部字段
- MongoDB Motor 驱动支持字段投影，但 team 未形成使用习惯
- 对于包含长文本字段（如 `content`、`description`、`body`）的集合，全字段返回影响显著

## 涉及文件

- `src/data/sessions.py:15` — `collection.find({})` 无投影
- `src/data/chat_records.py:62` — `collection.find()` 无投影
- `src/domain/knowledge/watcher.py:213,322` — 仅需 path，但未限制
- `src/server/routes/dashboard.py:262,503,882,887,966,1065,1270` — 多处
- `src/server/routes/system.py:40` — 全字段查询
- `src/server/routes/users.py:144,147,298` — 用户查询

## 修复方案

1. 为所有 `find()` 调用显式指定字段投影
2. 排除大文本字段（`content`、`body`、`description`）当不需要时
3. 在 `dashboard.py` 统计查询中使用聚合管道 `$project` 仅取所需字段

## 预防措施

- Code review 检查 `find()` 是否指定了合理的投影
- 对包含大字段的集合（rss、knowledge_files、sessions）做强投影要求

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `dashboard.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
