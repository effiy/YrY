---
title: "sse_utils.py format_sse 使用宽泛 except Exception 处理解码"
tags: [yiai, code-quality, error-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-10
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
project: YiAi
module: src/shared/sse_utils.py
reporter: Claude
environment: development
affected_version: 1.0.0
frequency: always
---

# sse_utils.py format_sse 使用宽泛 except Exception 处理解码

## 现象

`src/shared/sse_utils.py:14` 的 `format_sse` 函数使用裸 `except Exception` 捕获所有异常：

```python
def format_sse(data: Any) -> bytes:
    if isinstance(data, (bytes, bytearray)):
        try:
            data = data.decode("utf-8")
        except Exception:       # ← 应只捕获 UnicodeDecodeError
            data = str(data)    # str(bytes) 得到 "b'...'" 表示，非人类可读
    ...
```

## 根因分析

1. **异常类型过宽**：`except Exception` 会捕获 `UnicodeDecodeError` 之外的所有异常（如 `AttributeError`、`TypeError`），可能掩盖真正的 bug
2. **回退策略不佳**：对 bytes 对象调用 `str()` 返回 `"b'...'"` 格式，这在 SSE 输出中几乎不可读
3. **无日志**：静默回退，运维无法感知解码失败

## 修复方案

```python
def format_sse(data: Any) -> bytes:
    if isinstance(data, (bytes, bytearray)):
        try:
            data = data.decode("utf-8")
        except UnicodeDecodeError:
            data = data.decode("utf-8", errors="replace")  # 用替换字符而非 str()
    ...
```

## 影响范围

- **影响模块**：src/shared/sse_utils.py
- **是否影响 API 契约**：否（仅影响异常情况下的 SSE 帧内容）
- **是否影响其他项目**：否

## 验证方法

- [ ] 传入包含非法 UTF-8 字节的 bytes，验证输出为合法 UTF-8
- [ ] 正常 bytes/str/dict 输入行为不变

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 在相关函数中添加参数校验和边界检查 |
| 测试 | 添加对应的自动化测试用例 |
| 流程 | 代码审查时重点检查此类模式 |
| 监控 | 添加日志告警，异常发生时及时发现 |
| 文档 | 在编码规范中记录此类反模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
