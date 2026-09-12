---
title: audit decorator _resolve_params json.loads 缺少异常处理
tags: [yiai, code-quality, error-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# audit decorator _resolve_params json.loads 缺少异常处理

## 现象

`src/domain/audit/decorator.py:56` 的 `json.loads(params)` 调用没有 try/except 保护：

```python
def _resolve_params(args, kwargs) -> Dict[str, Any]:
    params = kwargs.get("parameters")
    if params is None and args:
        params = args[0]
    if isinstance(params, str):
        params = json.loads(params)  # ← 无异常处理
    if not isinstance(params, dict):
        return {}
    return params
```

如果 `params` 是非法 JSON 字符串，`json.JSONDecodeError` 会直接向上传播，导致审计装饰器抛出 500 错误而非优雅降级。

对比 `executor.py:65-68` 有正确的异常处理：
```python
try:
    parsed = json.loads(parameters)
except json.JSONDecodeError as e:
    raise BusinessException(ErrorCode.INVALID_PARAMS, ...)
```

## 根因分析

- 该函数假设 RPC 信封传来的参数已经是有效的 dict 或 JSON 字符串
- 未考虑格式错误的边缘情况
- 审计写操作失败不应阻塞业务操作（审计是辅助功能）

## 涉及文件

- `src/domain/audit/decorator.py:56` — 无保护的 `json.loads`

## 修复方案

```python
if isinstance(params, str):
    try:
        params = json.loads(params)
    except json.JSONDecodeError:
        return {}
```

## 预防措施

- 所有 `json.loads` 调用必须有异常处理或类型守卫前置

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
