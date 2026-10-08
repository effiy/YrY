---
title: repository.py 和 tools.py 在函数内重复编译正则表达式
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

# repository.py 和 tools.py 在函数内重复编译正则表达式

## 现象

部分模块在函数/方法内部使用 `re.compile`，每次调用都重新编译正则表达式：

```python
# repository.py:142,147,151 — _build_filter 每次查询都编译
filter_dict[key] = re.compile(f'.*{re.escape(term)}.*', re.IGNORECASE)

# tools.py:729 — _grep 每次调用都编译
compiled = re.compile(pattern)
```

而其他模块正确地将正则编译放在模块级别：

```python
# code_health_service.py:52 — 模块级编译（正确）
_VUE_IMPORT_RE = re.compile(...)

# indexer.py:44 — 模块级编译（正确）
_FRONTMATTER_RE = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.DOTALL)
```

## 根因分析

- `re.compile` 在函数内部时每次调用都重新编译正则——对于热路径（如每次数据库查询），这是不必要的 CPU 开销
- 这些正则是静态的或有可预测的少量变体
- 开发者未意识到 Python 的 `re` 模块虽然有缓存，但缓存上限为 512，且每次 `re.compile` 仍创建新对象

## 涉及文件

- `src/data/repository.py:142,147,151` — `MongoRegexBuilder` 中的模式编译
- `src/domain/ai/tools.py:729` — `_grep` 函数内的编译

## 修复方案

1. 将静态正则提升到模块级别
2. 对于基于用户输入的正则（如搜索词），使用 `re.escape` 后的字符串直接传给 `collection.find({'$regex': pattern})`，让 MongoDB 处理（避免 Python 端编译）
3. `tools.py:_grep` 可以在函数外预编译常用模式，或者缓存已编译的正则

## 预防措施

- 使用 `ruff` 规则检测函数内部的 `re.compile` 调用

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
