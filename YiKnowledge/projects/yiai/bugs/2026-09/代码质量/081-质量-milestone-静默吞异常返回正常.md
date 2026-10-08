---
title: "milestone_service.py _calc_health 静默吞异常返回正常状态"
tags: [yiai, bug, code-quality, error-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-10
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
resolution: |
  - _calc_health: except Exception → except (ValueError, TypeError) as e
  - 异常时返回 "unknown" 而非 "normal"，避免静默误报
  - 添加 logger.warning 记录异常详情
severity: minor
priority: p2
project: YiAi
module: src/services/milestone/milestone_service.py
reporter: Claude
environment: development
affected_version: 1.0.0
frequency: always
---

# milestone_service.py _calc_health 静默吞异常返回正常状态

## 现象

`src/services/milestone/milestone_service.py:42` 的 `_calc_health` 函数在发生任何异常时静默返回 `"normal"`：

```python
def _calc_health(target_date: str, progress: float) -> str:
    try:
        target = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        ...
        return "normal"
    except Exception:
        return "normal"  # ← 所有错误都被静默吞没，返回"正常"
```

## 复现步骤

1. 传入格式错误的 `target_date`（如 `"not-a-date"`）
2. 观察函数返回 `"normal"` 而非报错
3. 里程碑健康状态被错误地报告为正常

## 根因分析

- `except Exception` 捕获了所有可能的异常：日期解析失败、类型错误、字典键缺失等
- 返回 `"normal"` 是最危险的默认值——它向上游传递了"一切正常"的假信号
- 函数内 `elapsed_pct = 1.0` 是硬编码占位符，说明该函数本身逻辑还不完整，此时静默返回正常更为危险

## 修复方案

```python
def _calc_health(target_date: str, progress: float) -> str:
    try:
        target = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        total_days = (target - now).days
        if total_days <= 0:
            return "normal" if progress >= 1.0 else "delayed"
        ...
    except (ValueError, TypeError) as e:
        logger.warning(f"Failed to calculate milestone health: {e}", exc_info=True)
        return "unknown"  # 明确表示无法判断，而非假装正常
```

## 影响范围

- **影响模块**：src/services/milestone/milestone_service.py
- **是否影响 API 契约**：是（返回值新增 `"unknown"` 状态，前端需适配）
- **是否影响其他项目**：是（YiVad 使用了里程碑健康状态）

## 验证方法

- [ ] 传入无效日期，验证返回 `"unknown"` 而非 `"normal"`
- [ ] 传入正常日期，验证行为不变
- [ ] 日志中出现 warning 级别异常记录

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
