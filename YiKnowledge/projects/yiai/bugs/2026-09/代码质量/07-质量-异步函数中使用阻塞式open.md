---
title: "code-quality: 异步函数中使用阻塞 open() 调用"
tags: [yiai, bug, code-quality, async-io]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: closed
severity: major
priority: p1
project: YiAi
module: src/app.py, src/domain/ai/tools.py, src/domain/files/local.py, src/server/routes/knowledge.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: 异步函数中使用阻塞 open() 调用

## 现象

ruff 检查报 18 个 ASYNC230（blocking-open-call-in-async-function）错误：

```
src/app.py:71:10 — _seed_collection_if_empty()
src/domain/ai/tools.py — 5 处 (grep、read_file、patch_file、read_range、write_file)
src/domain/files/local.py — 11 处 (read_file、read_project_file、write_project_file、write_file、_upload_to_local_storage、upload_file)
src/server/routes/knowledge.py:194:22 — search_content()
```

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=ASYNC230`
2. 观察异步函数中的阻塞 I/O

## 预期行为

异步函数（`async def`）中应使用异步 I/O（`aiofiles`），避免阻塞事件循环

## 实际行为

18 处 `async def` 函数中直接使用同步 `open()` 进行文件读写，在高并发场景下可能导致事件循环阻塞，增加请求延迟

## 根因分析

`aiofiles>=25.1.0` 已是项目依赖（`requirements.txt`），但以下模块未使用它：

| 文件 | 函数 | 操作 | 影响 |
|------|------|------|------|
| `app.py` | `_seed_collection_if_empty` | `json.load(f)` | 启动时种子数据加载 |
| `tools.py` | grep/patch/read/write tools | 文本搜索/读写 | Agent 工具执行 |
| `local.py` | read_file 等 6 个函数 | 文件读写/删除 | 核心文件操作层 |
| `knowledge.py` | `search_content` | 全文搜索 | 知识库搜索 |

## 修复方案

将所有 `open()` 替换为 `aiofiles.open()` + `await`：

```python
# Before:
with open(path, "r") as f:
    content = f.read()

# After:
async with aiofiles.open(path, "r") as f:
    content = await f.read()
```

特殊处理：
- `json.load(f)` → `json.loads(await f.read())`
- `for lineno, line in enumerate(f, 1)` → `lineno = 0; async for line in f: lineno += 1`
- `f.readlines()` → `(await f.read()).splitlines(True)`
- 二进制模式使用 `aiofiles.open(path, "rb"/"wb")`

## 影响范围

- **影响模块**：4 个文件，6 个异步函数
- **是否影响 API 契约**：否（仅修改实现方式）
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check --select=ASYNC230` 清洁（18 个问题全部修复）
- [x] `ruff check` 清洁（忽略 E501/E402）
- [x] `pytest tests/ -q` 通过（559 个测试）
- [x] YiVad `pnpm test` 通过（156 个测试）
- [x] YiPet `npm test` 通过（101 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 异步函数中始终使用 `aiofiles` 进行文件 I/O |
| 测试 | CI 中启用 `ruff check --select=ASYNC230` |
| 流程 | 代码审查时检查 `async def` 中的 I/O 操作 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
