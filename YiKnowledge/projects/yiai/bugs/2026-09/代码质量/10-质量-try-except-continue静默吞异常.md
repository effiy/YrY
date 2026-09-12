---
title: "code-quality: try-except-continue 静默跳过循环异常"
tags: [yiai, bug, code-quality, error-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: closed
severity: minor
priority: p2
project: YiAi
module: src/domain/ai/chat.py, src/server/routes/knowledge.py, src/server/routes/search.py, src/services/ai/model_runtime.py, src/services/code_health_service.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: try-except-continue 静默跳过循环异常

## 现象

ruff 检查报 8 个 S112（try-except-continue）：

| 文件 | 行 | 场景 |
|------|-----|------|
| `domain/ai/chat.py` | 72 | base64 图片数据解码失败 |
| `server/routes/knowledge.py` | 196 | 知识文件读取失败 |
| `server/routes/search.py` | 157 | 搜索结果文本提取失败 |
| `services/ai/model_runtime.py` | 167 | heartbeat 队列推送失败 |
| `services/code_health_service.py` | 154 | 文件读取失败（重复检测） |
| `services/code_health_service.py` | 282 | 文件读取失败（组件分析） |

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=S112`
2. 观察循环中静默跳过的异常

## 预期行为

except-continue 块中应记录异常日志，便于排查数据被跳过而未被处理的原因

## 实际行为

8 处循环中的 `except Exception: continue` 完全忽略错误，被跳过的数据无声消失

## 根因分析

这些 `try-except-continue` 模式用于跳过无法处理的个别数据项（如图片解码失败、文件读取失败），继续处理剩余数据。虽不影响整体流程，但缺少日志使排查数据丢失问题非常困难。

## 修复方案

在所有 `except: continue` 处添加 `logger.debug()` 记录异常：

```diff
 except Exception:
+    logger.debug("Failed to decode base64 image data, skipping", exc_info=True)
     continue
```

## 影响范围

- **影响模块**：5 个文件
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check --select=S112` 清洁（8 个问题全部修复）
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 循环中的 except 块至少使用 `logger.debug()` |
| 测试 | CI 中启用 `ruff check --select=S112` |
| 流程 | 代码审查时检查 except-continue 模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
