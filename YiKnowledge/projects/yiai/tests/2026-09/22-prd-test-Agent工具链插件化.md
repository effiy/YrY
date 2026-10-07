---

doc_type: test
title: "YA-09-18: Agent 工具链插件化 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-18"
source_prds: ["22-需求-Agent工具链插件化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-18: Agent 工具链插件化 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖工具注册/发现、插件热加载、工具 schema 校验、插件隔离。

> 来源 PRD：[22-需求-Agent工具链插件化.md](../../prds/2026-09/22-需求-Agent工具链插件化.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 注册表逻辑、schema 校验 | pytest | 工具注册/发现/卸载、参数 schema 处理 |
| L2 集成测试 | 真实 Agent 循环 + 插件 | pytest-asyncio + motor | 插件热加载、Agent 工具调用、插件隔离 |

### 1.2 插件架构

```
工具注册表 (ToolRegistry)
  ├── 内置工具: search_knowledge, read_file, query_database
  └── 外部插件: 从 plugins/ 目录自动发现
       ├── plugin_calculator.py   → ToolDef("calculator")
       ├── plugin_weather.py      → ToolDef("get_weather")
       └── plugin_translator.py   → ToolDef("translate")
```

### 1.3 工具定义规范

```python
@dataclass
class ToolDef:
    name: str
    description: str
    parameters: dict  # JSON Schema
    handler: Callable
    is_side_effect: bool = False
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
from dataclasses import dataclass
from typing import Callable
from unittest.mock import AsyncMock

@dataclass
class ToolDef:
    name: str
    description: str
    parameters: dict
    handler: Callable
    is_side_effect: bool = False

@pytest.fixture
def sample_tool_defs():
    """示例工具定义。"""
    return [
        ToolDef(
            name="calculator",
            description="执行数学计算",
            parameters={"type": "object", "properties": {"expression": {"type": "string"}}, "required": ["expression"]},
            handler=lambda expression: str(eval(expression)),
            is_side_effect=False,
        ),
        ToolDef(
            name="get_weather",
            description="获取城市天气",
            parameters={"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
            handler=AsyncMock(return_value="晴天 25°C"),
            is_side_effect=False,
        ),
        ToolDef(
            name="send_email",
            description="发送邮件",
            parameters={"type": "object", "properties": {"to": {"type": "string"}, "body": {"type": "string"}}, "required": ["to", "body"]},
            handler=AsyncMock(return_value="邮件已发送"),
            is_side_effect=True,
        ),
    ]

@pytest.fixture
def tool_registry():
    """工具注册表 fixture。"""
    class ToolRegistry:
        def __init__(self):
            self._tools = {}

        def register(self, tool_def: ToolDef):
            if tool_def.name in self._tools:
                raise ValueError(f"工具 {tool_def.name} 已注册")
            self._tools[tool_def.name] = tool_def

        def unregister(self, name: str):
            if name not in self._tools:
                raise KeyError(f"工具 {name} 未注册")
            del self._tools[name]

        def get(self, name: str) -> ToolDef:
            return self._tools.get(name)

        def list_all(self) -> list[str]:
            return list(self._tools.keys())

        def get_llm_tool_descriptions(self) -> list[dict]:
            return [{"name": t.name, "description": t.description, "parameters": t.parameters} for t in self._tools.values()]

    return ToolRegistry()
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 工具注册与发现

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PL-01 | 注册新工具 | tool_registry 空 | 1. register(calculator)<br>2. 检查注册表 | get("calculator") 返回 ToolDef | P0 |
| TC-PL-02 | 重复注册抛异常 | calculator 已注册 | 1. 再次 register(calculator)<br>2. 检查异常 | ValueError "工具 calculator 已注册" | P1 |
| TC-PL-03 | 注销工具 | calculator 已注册 | 1. unregister("calculator")<br>2. get("calculator") | 返回 None | P1 |
| TC-PL-04 | 列出所有工具 | 3 个工具已注册 | 1. list_all()<br>2. 检查返回值 | ["calculator", "get_weather", "send_email"] | P2 |
| TC-PL-05 | LLM 工具描述生成 | 3 个工具已注册 | 1. get_llm_tool_descriptions()<br>2. 检查格式 | 3 条描述，含 name/description/parameters | P1 |

### 3.2 参数 Schema 校验

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PL-06 | 必填参数缺失→报错 | calculator 要求 expression | 1. 调用 calculator() 不传参数<br>2. 检查异常 | "缺少必填参数: expression" | P1 |
| TC-PL-07 | 参数类型错误→报错 | expression 应为 string | 1. 调用 calculator(expression=123)<br>2. 检查异常 | "参数 expression 类型错误: 期望 str" | P2 |
| TC-PL-08 | 额外参数忽略 | 传入未定义参数 | 1. calculator(expression="1+1", extra="ignored")<br>2. 检查行为 | 额外参数被忽略（或 WARNING），工具正常执行 | P2 |

### 3.3 插件热加载

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PL-09 | 运行时加载新插件 | 新 plugin 文件放入 plugins/ | 1. 触发目录扫描<br>2. 检查注册表 | 新工具自动注册 | P1 |
| TC-PL-10 | 运行时卸载插件 | 删除 plugin 文件 | 1. 触发目录扫描<br>2. 检查注册表 | 对应工具自动注销 | P2 |
| TC-PL-11 | 插件加载失败隔离 | plugin 文件有语法错误 | 1. 加载错误插件<br>2. 检查其他工具 | 错误插件被跳过，其他工具正常注册 | P1 |

### 3.4 Agent 集成

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-PL-12 | Agent 可使用注册插件 | calculator + get_weather 已注册 | 1. Agent 收到 "1+1 等于多少"<br>2. 选择工具 | Agent 选择 calculator，传入 expression="1+1" | P1 |
| TC-PL-13 | 副作用工具正确标记 | send_email is_side_effect=True | 1. Agent 调用 send_email<br>2. 检查缓存行为 | send_email 不缓存 | P2 |
| TC-PL-14 | 未知工具调用→报错 | Agent 调用不存在的工具 | 1. Agent 调用 "unknown_tool"<br>2. 检查响应 | "Unknown tool: unknown_tool" | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-PL-01 | 零插件启动 | plugins/ 为空 | Agent 仅含内置工具，正常运行 | P2 |
| EG-PL-02 | 同名插件冲突 | 两个插件声明相同工具名 | 后加载的拒绝注册，日志 WARNING | P1 |
| EG-PL-03 | 插件 handler 阻塞 | 工具调用 handler 死循环 | 工具超时保护生效 | P1 |
| EG-PL-04 | 大量插件注册 | 100 个插件 | 注册性能可接受（< 100ms），Agent 工具选择不受影响 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-PL-01 | 内置工具不受插件影响 | 插件系统上线 | search_knowledge/read_file/query_database 行为不变 | P0 |
| RG-PL-02 | Agent 循环性能不退化 | 注册 10+ 插件 | Agent 工具选择延迟不变 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 工具注册/发现 | TC-PL-01 ~ TC-PL-05 | 注册/重复/注销/列表/LLM 描述 |
| FR2: Schema 校验 | TC-PL-06 ~ TC-PL-08 | 必填/类型/额外 |
| FR3: 热加载 | TC-PL-09 ~ TC-PL-11 | 加载/卸载/隔离 |
| FR4: Agent 集成 | TC-PL-12 ~ TC-PL-14 | 选择/副作用/未知 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 跨 YiAi 实例插件同步 | 多实例插件状态不一致 | 添加共享插件仓库同步测试 |
| 插件版本管理 | 插件升级兼容性 | 添加插件 SemVer 版本校验测试 |
| 插件权限沙箱 | 插件可访问文件系统/网络 | 添加插件沙箱权限隔离测试 |