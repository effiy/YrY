---
title: seeds JSON 文件未做 schema 验证
tags: [yiai, code-quality, validation]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# seeds JSON 文件未做 schema 验证

## 现象

`src/data/seeds/` 目录中的 JSON 种子数据文件（`issues.json`、`menus.json` 等）在启动时通过 `json.loads()` 直接加载，未验证结构：

```python
# app.py:75
docs = json.loads(await f.read())
```

如果种子文件的 JSON 结构不符合对应集合的 schema（缺少必填字段、类型不匹配），错误在运行时才会发现——当 API 尝试读取或写入这些文档时。

## 根因分析

- 种子数据是手动维护的 JSON 文件
- 没有 Pydantic 模型或 JSON Schema 验证加载后的数据
- 文件变更（新增/修改种子数据）时没有验证钩子

## 涉及文件

- `src/app.py:74-75` — 种子文件加载
- `src/data/seeds/*.json` — 种子数据文件

## 修复方案

使用 Pydantic 模型验证种子数据：
```python
from models.schemas import IssueDocument
issues = [IssueDocument(**doc) for doc in json.loads(await f.read())]
```

## 预防措施

- 所有 JSON 配置文件在加载时必须通过 schema 验证

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
