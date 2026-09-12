---
title: "MCP: MCP Server 工具发现失败时静默降级，客户端无法感知工具不可用"
tags:
- mcp
- tool-discovery
- error-handling
- silent-failure
- protocol
category: projects/yiai/bugs/mcp
created: 2026-09-07
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiAi
module: src/server/mcp_server.py, src/server/routes/mcp.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: intermittent
---

## Description

MCP (Model Context Protocol) 端点（`/mcp/*`）暴露 YiAi 的工具给外部 AI 客户端。当工具注册失败或某个工具初始化异常时，MCP Server 可能静默降级——只返回成功注册的工具列表，不报告失败的工具。

**影响：**
- 外部 AI 客户端（如 Claude Desktop）看到的工具列表不完整
- 客户端尝试调用缺失的工具时收到 "tool not found" 错误
- 工具注册失败的原因被隐藏，增加调试难度

**场景：**
1. `data_tools` 注册时需要访问 MongoDB 获取集合 schema
2. MongoDB 连接在 MCP Server 初始化时恰好中断
3. `db_schema` 工具注册失败
4. MCP Server 返回的 `tools/list` 响应中缺少 `db_schema`
5. 客户端无法知道 `db_schema` 应该存在但注册失败了

## Steps to Reproduce

1. 启动 YiAi，但在 MCP Server 初始化前断开 MongoDB
2. 使用 MCP 客户端调用 `tools/list`
3. 观察返回的工具列表——比预期少
4. 没有错误信息指示哪些工具注册失败及原因

## Expected Result

MCP Server 应在 `tools/list` 响应中报告：
- 成功注册的工具列表
- 注册失败的工具及其失败原因（可选，通过 `ServerCapabilities` 或日志）

## Actual Result

工具列表静默不完整，客户端无法感知工具缺失。

## Root Cause

MCP Server 初始化时可能使用 `try/except` 吞没工具注册异常，或使用批量注册时部分失败不报告。

**根本原因：** MCP 协议本身没有标准的 "partial failure" 报告机制，但实现层面可以通过日志和健康检查端点补充。

## Fix

### 1. 工具注册失败时记录详细日志

```python
# src/server/mcp_server.py
import logging

logger = logging.getLogger(__name__)

class MCPServer:
    def __init__(self):
        self._tools: dict[str, Tool] = {}
        self._failed_tools: dict[str, str] = {}

    def register_tool(self, tool: Tool) -> bool:
        try:
            tool.setup()  # 初始化工具
            self._tools[tool.name] = tool
            return True
        except Exception as e:
            logger.error(f"Failed to register MCP tool '{tool.name}': {e}", exc_info=True)
            self._failed_tools[tool.name] = str(e)
            return False

    def get_tools_list(self) -> dict:
        return {
            "tools": [t.to_dict() for t in self._tools.values()],
            "failed": [
                {"name": name, "error": error}
                for name, error in self._failed_tools.items()
            ],
        }
```

### 2. 添加 MCP 健康检查端点

```python
# src/server/routes/mcp.py
@router.get("/mcp/health")
async def mcp_health():
    mcp = get_mcp_server()
    tools_info = mcp.get_tools_list()
    return {
        "status": "degraded" if tools_info["failed"] else "ok",
        "tools_registered": len(tools_info["tools"]),
        "tools_failed": len(tools_info["failed"]),
        "failed_details": tools_info["failed"],
    }
```

## Verification

- 所有工具正常注册 → `tools_registered=N`, `tools_failed=0`, `status=ok`
- 部分工具注册失败 → `tools_registered=N-M`, `tools_failed=M`, `status=degraded`
- 日志中记录每个失败工具的详细错误
- 健康检查端点反映当前状态

## Prevention

- **代码层面：** 所有模块初始化 MUST 报告失败原因，不允许静默降级
- **协议层面：** MCP `tools/list` 响应应扩展 `warnings` 字段报告部分失败
- **监控层面：** 监控 MCP 工具注册成功率，低于 100% 时告警
- **测试层面：** 添加工具注册失败场景测试

## 影响范围

- **影响模块**：src/server/mcp_server.py, src/server/routes/mcp.py
- **涉及文件**：
- src/server/mcp_server.py, src/server/routes/mcp.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
