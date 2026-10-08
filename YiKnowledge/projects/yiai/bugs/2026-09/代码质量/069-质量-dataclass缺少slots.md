---
title: 未使用 __slots__ 优化高频实例化的数据类
tags: [yiai, code-quality, memory]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# 未使用 __slots__ 优化高频实例化的数据类

## 现象

`models/schemas.py` 和 `shared/error_codes.py` 中的 `@dataclass` 类未使用 `__slots__`：

```python
@dataclass(frozen=True)
class ErrorCode:
    code: int
    message: str

@dataclass
class AuditLog:
    log_id: str
    timestamp: datetime
    ...
```

`__slots__` 可减少每个实例的内存开销（约 50%），对审计日志等高频实例化的场景尤为有益。

## 涉及文件

- `src/models/schemas.py` — dataclass 定义
- `src/domain/audit/models.py` — AuditLog
- `src/services/ai/llm_provider.py` — ChatMessage 等

## 修复方案

```python
@dataclass(frozen=True, slots=True)  # Python 3.10+
class ErrorCode:
    ...
```

## 预防措施

- 大量实例化的 dataclass 考虑启用 `slots=True`

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/models/schemas.py`
- `src/domain/audit/models.py`
- `src/services/ai/llm_provider.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
