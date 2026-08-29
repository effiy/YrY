---
title: YiAi 多个文件存在未使用变量和未定义名称导致 ruff 报错
tags: [bug, python, ruff, unused-vars, undefined-name, lint]
category: bugs/logic
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiAi
module: Multiple
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

`ruff check` 扫描发现 17 个问题，其中 8 个自动修复（缺少文件末尾换行），9 个需要手动修复：

1. **`agent.py:801`** — `omitted_chars` 变量计算后从未使用 (F841)
2. **`tools.py:98,101`** — 循环变量 `field` 与 `dataclasses.field` 导入冲突 (F402)
3. **`files/local.py:296,301`** — 错误消息中使用了未定义的 `old_project`，实际参数名是 `project` (F821)
4. **`engine.py:625`** — `timing["condense_ms"]` 在 `timing` 字典初始化之前被引用 (F821)
5. **`openai_compat.py:116-119`** — 4 个 OpenAI 兼容参数提取后从未使用 (F841)

## Steps to Reproduce

1. 运行 `python -m ruff check src/`
2. 观察 17 个 error

## Expected Result

ruff 零错误。

## Actual Result

17 个错误分布在 9 个文件中。

## Cause

1. **`omitted_chars`**: 内容截断函数中计算了字符数但只使用了行数
2. **`field` 冲突**: `dataclasses.field` 被导入后，循环变量名 `field` 覆盖了导入
3. **`old_project`**: 函数参数名是 `project`，但错误消息中误写为 `old_project`
4. **`timing` 未初始化**: `timing` 字典在 line 642 初始化，但 condense 分支在 line 605 就使用了它
5. **OpenAI 兼容参数**: 参数已提取但尚未传递给实际的 LLM 调用

## Solution

1. 删除未使用的 `omitted_chars` 变量
2. 将循环变量重命名为 `req_field` 和 `fname`
3. 将 `old_project` 修正为 `project`
4. 在 condense 分支前初始化空 `timing` 字典
5. 给未使用变量添加 `_` 前缀

## Review

**教训**: 未定义变量名 (`F821`) 是最危险的 lint 类别——`files/local.py` 中 `old_project` 会导致运行时 `NameError`，直接中断文件重命名操作。`engine.py` 中 `timing` 未初始化同样会导致 `NameError`，中断 RAG 聊天流。