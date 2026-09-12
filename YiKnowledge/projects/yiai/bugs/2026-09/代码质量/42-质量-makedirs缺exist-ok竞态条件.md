---
title: logging.py 中 os.makedirs 未使用 exist_ok 存在竞态条件
tags: [yiai, code-quality, race-condition]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# logging.py 中 os.makedirs 未使用 exist_ok 存在竞态条件

## 现象

`src/shared/logging.py:39` 是代码库中唯一未使用 `exist_ok=True` 的 `os.makedirs` 调用：

```python
# logging.py:38-39 — 无 exist_ok=True，存在竞态条件
if not os.path.exists(log_dir):
    os.makedirs(log_dir)
```

而其他所有 9 处调用都正确使用了 `exist_ok=True`：

```python
# local.py — 正确用法
os.makedirs(os.path.dirname(abs_path), exist_ok=True)

# writer.py — 正确用法
os.makedirs(os.path.dirname(abs_path) or _base_dir(), exist_ok=True)
```

`if not exists + makedirs` 不是原子操作——在 `exists` 检查和 `makedirs` 执行之间，另一个进程/线程可能创建了该目录，导致 `FileExistsError`。

## 根因分析

- 开发者使用"先检查再创建"模式作为 `exist_ok` 的替代
- 这在单进程开发环境中正常工作
- 但在多 worker 部署（gunicorn/uvicorn workers）中可能间歇性失败

## 涉及文件

- `src/shared/logging.py:38-39` — 竞态条件

## 修复方案

```python
os.makedirs(log_dir, exist_ok=True)
```

移除冗余的 `os.path.exists` 检查——`exist_ok=True` 本身就是原子操作。

## 预防措施

- 所有 `os.makedirs` 调用必须使用 `exist_ok=True`
- 禁止 `if not exists: makedirs` 模式

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
