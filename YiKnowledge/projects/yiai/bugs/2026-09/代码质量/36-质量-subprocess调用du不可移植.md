---
title: rag/indexer.py 使用 subprocess.run 调用 du 命令检查磁盘
tags: [yiai, code-quality, portability]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# rag/indexer.py 使用 subprocess.run 调用 du 命令检查磁盘

## 现象

`src/domain/rag/indexer.py:336` 使用 `subprocess.run` 调用系统命令 `du` 来检查索引目录大小：

```python
result = subprocess.run(["du", "-sk", persist], capture_output=True, text=True, timeout=5)
```

这种写法有两个问题：
1. **平台依赖**：`du -sk` 是 Unix/macOS 命令，在 Windows 上不存在
2. **异常处理缺失**：如果 `du` 命令不在 PATH 中或返回非零退出码，没有显式的异常处理

## 根因分析

- 项目开发环境是 macOS，`du` 可用但未考虑其他平台
- 可以用 Python 标准库实现相同功能（`os.scandir` 递归计算大小）
- 虽然项目目前仅部署在 Linux/macOS，但平台特定代码应该明确标注并处理回退

## 涉及文件

- `src/domain/rag/indexer.py:336` — `subprocess.run(["du", "-sk", persist], ...)`

## 修复方案

1. 使用 Python 标准库替换：
```python
total = sum(f.stat().st_size for f in Path(persist).rglob('*') if f.is_file())
```
2. 或封装为 `os.name == 'nt'` 条件分支
3. 添加 `FileNotFoundError` 异常处理和降级逻辑

## 预防措施

- 避免直接调用系统命令；优先使用 Python 标准库
- 如果必须使用，添加平台检查 + 异常处理 + 回退方案

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
