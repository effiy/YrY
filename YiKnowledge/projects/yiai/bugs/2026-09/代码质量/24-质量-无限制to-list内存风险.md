---
title: Dashboard/报表端点使用 to_list(length=None) 无限制加载全量数据
tags: [yiai, code-quality, performance, memory]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: minor
priority: p2
---

# Dashboard/报表端点使用 to_list(length=None) 无限制加载全量数据

## 现象

14 处 `to_list(length=None)` 调用将整个 MongoDB 集合加载到内存中，无任何分页或数量限制。随数据增长，这会导致内存压力增大和响应时间恶化。

涉及端点：
- `system.py:41` — 任意集合全量导出
- `users.py:144,147,298` — 用户管理全量加载
- `auth.py:246` — 权限字典全量加载
- `dashboard.py:263,504,883,888,967,989,997,1066,1271` — RSS 文章、知识文件、种子、用户、部门、角色、会话、状态记录

```python
# dashboard.py:262-263 — 全量加载 RSS 文章
cursor = collection.find({}, {"_id": 0})
articles = await cursor.to_list(length=None)
```

## 根因分析

- 报表/管理端点被设计为一次性加载所有数据，假设数据量不大
- 随着系统运行，`rss`（文章）、`knowledge_files`、`sessions` 等集合会持续增长
- 无上限的 `to_list(length=None)` 在集合超过数万条时会导致严重的内存压力和请求超时

## 涉及文件

- `src/server/routes/dashboard.py` — 9 处无限制 `to_list`
- `src/server/routes/users.py` — 3 处
- `src/server/routes/system.py` — 1 处
- `src/server/routes/auth.py` — 1 处

## 修复方案

1. 为报表端点添加分页参数（pageNum/pageSize）
2. 在 MongoDB 层面使用聚合管道做统计，而非加载全量到 Python 再计算
3. 对于确实需要全量的场景（如用户 < 1000），显式设置 `limit` 上限
4. 使用 `cursor` 逐批处理而非一次性 `to_list`

## 预防措施

- 禁止在路由处理函数中使用 `to_list(length=None)`
- 在 code review 中标记无限制的集合查询

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/server/routes/auth.py`
- `src/server/routes/users.py`
- `src/server/routes/system.py`
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
