---
title: "code-quality: try-except-pass 静默吞没异常"
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
module: 9 个文件
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: try-except-pass 静默吞没异常

## 现象

ruff 检查报 15 个 S110（try-except-pass）：

| 文件 | 行 | 场景 |
|------|-----|------|
| `domain/ai/tools.py` | 516 | chunk 解码失败 |
| `domain/ai/tools.py` | 1143 | JSON 序列化回退 |
| `domain/knowledge/scanner.py` | 136 | frontmatter 列表解析 |
| `domain/knowledge/scanner.py` | 156 | frontmatter 值类型转换 |
| `domain/rag/indexer.py` | 338 | du 命令获取目录大小 |
| `domain/rag/indexer.py` | 457 | 元数据标签统计 |
| `server/routes/dashboard.py` | 162 | RSS 种子计数 |
| `server/routes/knowledge.py` | 147 | 写入后同步 |
| `server/routes/knowledge.py` | 163 | 删除后同步 |
| `server/routes/mcp.py` | 33 | MCP 工具 schema 规范化 |
| `server/routes/mcp.py` | 114 | MCP 结果转字符串 |
| `server/routes/search.py` | 143 | HTML 元素移除 |
| `server/routes/search.py` | 341 | 响应 chunk 解码 |
| `services/code_health_service.py` | 395 | 缓存读取 |
| `shared/utils.py` | 104 | JSON 提取 |

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=S110`
2. 观察静默吞没异常的位置

## 预期行为

except 块中应至少记录异常日志，以便排查问题

## 实际行为

15 处 except 块使用 `pass` 完全忽略异常，无任何日志输出。在排查生产问题时无法追踪这些被吞没的错误。

## 根因分析

这些 `pass` 块通常是"尽力而为"模式 — 操作失败不影响主流程。但缺少日志使得这些失败对运维完全不可见。

## 修复方案

在所有 `pass` 处添加 `logger.debug()` 记录异常信息：

```diff
 except Exception:
-    pass
+    logger.debug("Failed to decode chunk", exc_info=True)
```

新增 `shared/utils.py` 中的 logger（该文件此前无日志支持）。

## 影响范围

- **影响模块**：9 个文件
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check --select=S110` 清洁（15 个问题全部修复）
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | except 块中至少使用 `logger.debug()` 记录异常 |
| 测试 | CI 中启用 `ruff check --select=S110` |
| 流程 | 代码审查时检查 except-pass 模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
