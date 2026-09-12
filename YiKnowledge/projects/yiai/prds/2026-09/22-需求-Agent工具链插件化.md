---
title: "YA-09-18: Agent 工具链插件化架构 — 工具注册与动态发现机制"
tags: [需求文档, Agent, 工具链, 插件化, 注册发现, 后端]
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiAi
project_id: yiai
owner: 陈铭
prd_month: "202609"
prd_task_id: YA-09-18
estimate_backend: 1.0
review_status: 待评审
issue_type: 架构
roles: [engineer]
---

# YA-09-18: Agent 工具链插件化架构 — 工具注册与动态发现

> 需求编号：YA-09-18 · 优先级：P2 · 人天：1.0d · 状态：需求已编写
> 依赖：YA-09-03（Agent 可靠性）

## 背景

Agent 工具当前通过硬编码字典注册：`TOOLS = {'search_knowledge': ..., 'read_file': ..., ...}`。新增工具需修改核心 Agent 代码，违反开闭原则。目标：工具插件化——每个工具独立文件，通过装饰器自动注册，Agent 运行时动态发现可用工具。

### 量化指标

| 指标 | 当前值 | 目标值 | 说明 |
|------|--------|--------|------|
| 工具注册方式 | 硬编码字典 | 装饰器自动注册 | 新增工具无需修改 Agent 核心 |
| 新增工具文件数 | 修改 2-3 个文件 | 1 个新文件 | 仅需创建 tool/xxx.py |
| 工具发现机制 | 静态导入 | 动态扫描 + 自动注册 | 启动时扫描 tools/ 目录 |
| 工具分类 | 无 | knowledge/file/data/external | 4 类工具分治 |
| 工具超时保护 | 无 | 每工具独立 timeout_ms | 防止单工具阻塞 Agent |
| 工具幂等声明 | 无 | idempotent 标记 | 与 YA-09-14 缓存策略联动 |
| LLM 工具描述格式 | 手动构造 | `get_tools_for_llm()` 自动生成 | 符合 OpenAI function calling 格式 |

---

## 一、目标架构

```python
# YiAi/src/domain/ai/tools/registry.py

from functools import wraps
from dataclasses import dataclass, field
from typing import Callable, Any

@dataclass
class ToolDefinition:
    name: str
    description: str              # LLM 可见的工具描述
    func: Callable
    parameters: dict               # JSON Schema 参数定义
    idempotent: bool = False       # 是否幂等（可缓存——YA-09-14）
    timeout_ms: int = 30_000       # 默认超时
    category: str = 'general'      # 分类: knowledge | file | data | external

class ToolRegistry:
    """Agent 工具注册中心——装饰器自动注册 + 动态发现。"""

    _instance: 'ToolRegistry | None' = None
    _tools: dict[str, ToolDefinition] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def register(cls, *, name: str, description: str, parameters: dict,
                 idempotent: bool = False, timeout_ms: int = 30_000,
                 category: str = 'general'):
        """装饰器——将函数注册为 Agent 工具。

        用法:
          @ToolRegistry.register(
              name='search_knowledge',
              description='搜索知识库获取相关文档',
              parameters={'query': {'type': 'string', 'description': '搜索关键词'}},
              idempotent=True, category='knowledge',
          )
          async def search_knowledge(query: str) -> dict: ...
        """
        def decorator(func: Callable):
            cls._tools[name] = ToolDefinition(
                name=name, description=description, func=func,
                parameters=parameters, idempotent=idempotent,
                timeout_ms=timeout_ms, category=category,
            )
            return func
        return decorator

    def get_tools_for_llm(self, categories: list[str] | None = None) -> list[dict]:
        """生成 LLM function calling 格式的工具列表。"""
        tools = self._tools.values()
        if categories:
            tools = [t for t in tools if t.category in categories]

        return [{
            'type': 'function',
            'function': {
                'name': t.name,
                'description': t.description,
                'parameters': {'type': 'object', 'properties': t.parameters},
            },
        } for t in tools]

    def get_idempotent_tools(self) -> set[str]:
        return {name for name, t in self._tools.items() if t.idempotent}

    async def execute(self, name: str, params: dict) -> dict:
        tool = self._tools.get(name)
        if not tool:
            raise ToolNotFoundError(f"工具 '{name}' 未注册")
        async with asyncio.timeout(tool.timeout_ms / 1000):
            return await tool.func(**params)

    @property
    def stats(self) -> dict:
        return {
            'total_tools': len(self._tools),
            'by_category': {
                cat: len([t for t in self._tools.values() if t.category == cat])
                for cat in {t.category for t in self._tools.values()}
            },
            'idempotent_count': len(self.get_idempotent_tools()),
        }


# 工具定义示例 (每个工具独立文件)
# YiAi/src/domain/ai/tools/search_knowledge.py

from .registry import ToolRegistry

@ToolRegistry.register(
    name='search_knowledge',
    description='搜索 YiKnowledge 知识库，返回相关文档片段',
    parameters={
        'query': {'type': 'string', 'description': '自然语言搜索关键词'},
        'top_k': {'type': 'integer', 'description': '返回结果数', 'default': 5},
        'category': {'type': 'string', 'description': '限定分类'},
    },
    idempotent=True, category='knowledge', timeout_ms=15_000,
)
async def search_knowledge(query: str, top_k: int = 5,
                           category: str = None) -> dict:
    results = await rag_service.search(query, top_k, category)
    return {'results': results, 'count': len(results)}
```

---

## 二、测试规格

#### Scenario: 装饰器注册工具
- **Given** 使用 `@ToolRegistry.register(name='search_knowledge', ...)` 装饰函数
- **When** 模块被导入
- **Then** `ToolRegistry._tools['search_knowledge']` 包含 ToolDefinition 对象

#### Scenario: get_tools_for_llm 返回正确格式
- **Given** 注册了 search_knowledge 和 read_file 两个工具
- **When** `registry.get_tools_for_llm(categories=['knowledge'])`
- **Then** 仅返回 knowledge 分类的工具

#### Scenario: 执行未注册工具抛出异常
- **Given** 工具 `unknown_tool` 未注册
- **When** `registry.execute('unknown_tool', {})`
- **Then** 抛出 `ToolNotFoundError`

#### Scenario: 工具执行超时保护
- **Given** 工具 `slow_tool` 的 `timeout_ms = 1000`
- **When** 工具执行超过 1000ms
- **Then** `asyncio.timeout` 触发 TimeoutError

#### Scenario: 单例模式——多次实例化同一对象
- **Given** `r1 = ToolRegistry()`, `r2 = ToolRegistry()`
- **Then** `r1 is r2` 为 True

---

## 三、代码审查检查清单

- [ ] 每个工具独立一个 `.py` 文件，在 `tools/` 目录下
- [ ] 工具通过 `@ToolRegistry.register` 装饰器注册（非手动字典）
- [ ] 工具 `description` 是 LLM 可理解的自然语言
- [ ] 工具 `parameters` 符合 JSON Schema 格式
- [ ] `execute()` 包含 `asyncio.timeout` 超时保护
- [ ] `get_idempotent_tools()` 返回的集合与 YA-09-14 缓存策略一致
- [ ] ToolRegistry 为单例模式（线程安全）
- [ ] 新增工具无需修改 Agent 核心代码

---

## 五、边缘场景处理

### 5.1 工具模块导入失败
- **场景**：`tools/search_knowledge.py` 语法错误导致导入失败
- **处理**：`_discover_tools()` 使用 `try/except` 包裹每个模块导入，失败的模块记录 ERROR 日志但不影响其他工具
- **日志**：`[ToolRegistry] 加载工具 {module} 失败: {error}`

### 5.2 工具名称冲突
- **场景**：两个不同模块注册了相同的工具名称 `search_knowledge`
- **处理**：后注册的工具覆盖先注册的（最后写入优先），WARNING 日志记录冲突
- **日志**：`[ToolRegistry] 工具名称冲突: search_knowledge，后注册的覆盖先注册的`

### 5.3 工具执行时参数缺失
- **场景**：LLM 调用 `search_knowledge` 时未传入必填的 `query` 参数
- **处理**：`execute()` 内部捕获 `TypeError`，返回结构化错误而非抛出异常
- **返回**：`{"error": "缺少必填参数: query", "tool": "search_knowledge"}`

### 5.4 工具执行返回超大结果
- **场景**：`read_file` 读取 10MB 文件，返回结果超出 LLM 上下文窗口
- **处理**：`execute()` 后检查结果大小，超过 100KB 时自动截断并添加 `[truncated]` 标记
- **实现**：`result_str = json.dumps(result); if len(result_str) > 100_000: result = {"content": result_str[:100_000], "truncated": True}`

### 5.5 工具执行异常导致 Agent 循环中断
- **场景**：工具内部抛出未捕获的异常（如 MongoDB 连接断开）
- **处理**：`execute()` 使用 `try/except Exception` 兜底，返回错误信息而非抛出异常
- **返回**：`{"error": "工具执行异常: {exception_message}", "tool": "xxx"}`

### 5.6 工具装饰器未正确使用
- **场景**：开发者忘记使用 `@ToolRegistry.register` 装饰器，直接定义函数
- **处理**：`_discover_tools()` 扫描模块时，检查模块中是否有未注册的 `async def` 函数，WARNING 提示
- **日志**：`[ToolRegistry] 模块 {module} 中存在未注册的异步函数: {func_name}`

### 5.7 工具分类动态扩展
- **场景**：未来需要新增 `network`、`system` 等分类
- **处理**：`category` 参数为字符串，不限制枚举值——新增分类无需修改 ToolRegistry
- **约束**：分类名使用 snake_case 小写，避免特殊字符

### 5.8 工具依赖外部服务不可用
- **场景**：`search_knowledge` 依赖 Ollama Embedding 服务，但 Ollama 未启动
- **处理**：工具内部自行处理依赖不可用的情况，返回结构化错误
- **返回**：`{"error": "依赖服务不可用: Ollama Embedding", "retryable": true}`

### 5.9 多 Worker 进程下工具注册一致性
- **场景**：uvicorn 多 worker 模式，每个 worker 独立注册工具
- **处理**：工具注册在启动时完成（只读），运行时无变更——每个 worker 注册结果一致
- **验证**：`/health/debug` 端点返回 `tools_count`，所有 worker 数值相同

### 5.10 工具 description 语言不匹配
- **场景**：工具 description 是英文，但 LLM 系统提示词是中文
- **处理**：工具 description 使用 LLM 系统提示词的语言（中文），在 `ToolDefinition` 中添加 `description_en` 字段
- **实现**：`get_tools_for_llm()` 根据 `language` 参数选择 description 语言

---

## 六、代码实现附录

### 6.1 完整 ToolRegistry 实现

```python
# YiAi/src/domain/ai/tools/registry.py

import asyncio
import importlib
import inspect
import json
import os
import sys
from dataclasses import dataclass, field
from functools import wraps
from pathlib import Path
from typing import Any, Callable, Optional

from loguru import logger


class ToolNotFoundError(Exception):
    """工具未注册异常。"""
    pass


class ToolExecutionError(Exception):
    """工具执行异常。"""
    def __init__(self, tool_name: str, original_error: Exception):
        self.tool_name = tool_name
        self.original_error = original_error
        super().__init__(f"工具 '{tool_name}' 执行异常: {original_error}")


@dataclass
class ToolDefinition:
    name: str
    description: str
    description_en: str = ''
    func: Callable = field(repr=False)
    parameters: dict = field(default_factory=dict)
    idempotent: bool = False
    timeout_ms: int = 30_000
    category: str = 'general'
    retryable: bool = False
    max_result_bytes: int = 100_000
    version: str = '1.0.0'
    module_path: str = ''

    def to_openai_function(self) -> dict:
        """生成 OpenAI function calling 格式的工具定义。"""
        return {
            'type': 'function',
            'function': {
                'name': self.name,
                'description': self.description,
                'parameters': {
                    'type': 'object',
                    'properties': self.parameters,
                    'required': list(self.parameters.keys()),
                },
            },
        }

    def to_anthropic_tool(self) -> dict:
        """生成 Anthropic tool use 格式的工具定义。"""
        return {
            'name': self.name,
            'description': self.description,
            'input_schema': {
                'type': 'object',
                'properties': self.parameters,
                'required': list(self.parameters.keys()),
            },
        }


class ToolRegistry:
    """Agent 工具注册中心——装饰器自动注册 + 动态发现。"""

    _instance: Optional['ToolRegistry'] = None
    _tools: dict[str, ToolDefinition] = {}
    _tools_dir: str = ''

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def register(cls, *, name: str, description: str, parameters: dict,
                 idempotent: bool = False, timeout_ms: int = 30_000,
                 category: str = 'general', retryable: bool = False,
                 max_result_bytes: int = 100_000, version: str = '1.0.0',
                 description_en: str = ''):
        """装饰器——将函数注册为 Agent 工具。"""
        def decorator(func: Callable):
            if name in cls._tools:
                logger.warning(f"[ToolRegistry] 工具名称冲突: {name}，后注册的覆盖先注册的")

            cls._tools[name] = ToolDefinition(
                name=name,
                description=description,
                description_en=description_en or description,
                func=func,
                parameters=parameters,
                idempotent=idempotent,
                timeout_ms=timeout_ms,
                category=category,
                retryable=retryable,
                max_result_bytes=max_result_bytes,
                version=version,
                module_path=func.__module__,
            )
            logger.debug(f"[ToolRegistry] 注册工具: {name} (category={category})")
            return func
        return decorator

    @classmethod
    def discover_tools(cls, tools_dir: str = None):
        """动态发现 tools/ 目录下的所有工具模块。"""
        if tools_dir is None:
            tools_dir = os.path.join(os.path.dirname(__file__), '')
        cls._tools_dir = tools_dir

        tools_path = Path(tools_dir)
        if not tools_path.exists():
            logger.warning(f"[ToolRegistry] 工具目录不存在: {tools_dir}")
            return

        for py_file in tools_path.glob('*.py'):
            if py_file.name.startswith('_') or py_file.name == 'registry.py':
                continue

            module_name = py_file.stem
            try:
                module_path = f"domain.ai.tools.{module_name}"
                if module_path not in sys.modules:
                    importlib.import_module(module_path)
                logger.info(f"[ToolRegistry] 加载工具模块: {module_name}")
            except Exception as e:
                logger.error(f"[ToolRegistry] 加载工具模块 {module_name} 失败: {e}")

        # 检查未注册的函数
        cls._check_unregistered_functions()

    @classmethod
    def _check_unregistered_functions(cls):
        """检查工具模块中是否有未注册的异步函数。"""
        for name, module in sys.modules.items():
            if not name.startswith('domain.ai.tools.'):
                continue
            if name.endswith('registry'):
                continue
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (inspect.iscoroutinefunction(attr) and
                    not attr_name.startswith('_') and
                    attr_name not in [t.func.__name__ for t in cls._tools.values()]):
                    logger.warning(
                        f"[ToolRegistry] 模块 {name} 中存在未注册的异步函数: {attr_name}"
                    )

    def get_tools_for_llm(self, categories: list[str] | None = None,
                          language: str = 'zh') -> list[dict]:
        """生成 LLM 可见的工具列表（OpenAI function calling 格式）。"""
        tools = list(self._tools.values())
        if categories:
            tools = [t for t in tools if t.category in categories]

        result = []
        for t in tools:
            func_def = t.to_openai_function()
            if language == 'en' and t.description_en:
                func_def['function']['description'] = t.description_en
            result.append(func_def)

        return result

    def get_tools_for_anthropic(self, categories: list[str] | None = None) -> list[dict]:
        """生成 Anthropic tool use 格式的工具列表。"""
        tools = list(self._tools.values())
        if categories:
            tools = [t for t in tools if t.category in categories]
        return [t.to_anthropic_tool() for t in tools]

    def get_idempotent_tools(self) -> set[str]:
        return {name for name, t in self._tools.items() if t.idempotent}

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    async def execute(self, name: str, params: dict) -> dict:
        """执行工具——超时保护 + 异常兜底 + 结果截断。"""
        tool = self._tools.get(name)
        if not tool:
            raise ToolNotFoundError(f"工具 '{name}' 未注册")

        try:
            async with asyncio.timeout(tool.timeout_ms / 1000):
                result = await tool.func(**params)

            # 结果大小检查
            result_str = json.dumps(result, ensure_ascii=False, default=str)
            if len(result_str) > tool.max_result_bytes:
                truncated = result_str[:tool.max_result_bytes]
                logger.warning(
                    f"[ToolRegistry] 工具 {name} 返回结果过大 "
                    f"({len(result_str)} bytes)，截断至 {tool.max_result_bytes}"
                )
                return {
                    'content': truncated,
                    'truncated': True,
                    'original_size': len(result_str),
                }

            return result

        except asyncio.TimeoutError:
            logger.error(f"[ToolRegistry] 工具 {name} 执行超时 ({tool.timeout_ms}ms)")
            return {
                'error': f'工具执行超时 ({tool.timeout_ms}ms)',
                'tool': name,
                'retryable': tool.retryable,
            }
        except TypeError as e:
            logger.error(f"[ToolRegistry] 工具 {name} 参数错误: {e}")
            return {
                'error': f'参数错误: {e}',
                'tool': name,
                'expected_params': list(tool.parameters.keys()),
            }
        except Exception as e:
            logger.error(f"[ToolRegistry] 工具 {name} 执行异常: {e}")
            return {
                'error': f'工具执行异常: {e}',
                'tool': name,
                'retryable': tool.retryable,
            }

    @property
    def stats(self) -> dict:
        categories = {}
        for t in self._tools.values():
            categories.setdefault(t.category, 0)
            categories[t.category] += 1

        return {
            'total_tools': len(self._tools),
            'by_category': categories,
            'idempotent_count': len(self.get_idempotent_tools()),
            'tool_names': list(self._tools.keys()),
        }
```

### 6.2 工具示例——多语言支持

```python
# YiAi/src/domain/ai/tools/search_knowledge.py

from .registry import ToolRegistry
from services.rag.rag_service import RAGService

rag_service = RAGService()

@ToolRegistry.register(
    name='search_knowledge',
    description='搜索 YiKnowledge 知识库，返回相关文档片段。支持按分类和标签过滤。',
    description_en='Search YiKnowledge for relevant document chunks. Supports category and tag filtering.',
    parameters={
        'query': {'type': 'string', 'description': '自然语言搜索关键词'},
        'top_k': {'type': 'integer', 'description': '返回结果数', 'default': 5},
        'category': {'type': 'string', 'description': '限定分类（可选）'},
    },
    idempotent=True,
    category='knowledge',
    timeout_ms=15_000,
    retryable=True,
    version='1.1.0',
)
async def search_knowledge(query: str, top_k: int = 5,
                           category: str = None) -> dict:
    try:
        results = await rag_service.search(query, top_k=top_k, category=category)
        return {
            'results': results,
            'count': len(results),
            'query': query,
        }
    except Exception as e:
        return {
            'error': f'RAG 检索失败: {e}',
            'retryable': True,
        }
```

### 6.3 Agent 集成

```python
# YiAi/src/domain/ai/agent.py

from domain.ai.tools.registry import ToolRegistry, ToolNotFoundError

# 启动时自动发现所有工具
ToolRegistry.discover_tools()

# Agent 循环中调用工具
async def agent_execute_tool(tool_name: str, params: dict) -> dict:
    registry = ToolRegistry()
    return await registry.execute(tool_name, params)

# 获取 LLM 可用的工具列表
def get_available_tools(categories: list[str] | None = None) -> list[dict]:
    registry = ToolRegistry()
    return registry.get_tools_for_llm(categories=categories)
```

---

## 七、性能分析

### 7.1 工具注册性能

| 操作 | 延迟 | 说明 |
|------|------|------|
| 单个工具装饰器注册 | < 0.01ms | 内存字典操作 |
| discover_tools() (10 个模块) | < 50ms | 模块导入 + 文件扫描 |
| get_tools_for_llm() (10 个工具) | < 0.1ms | 字典遍历 + 列表构建 |
| execute() 路由查找 | < 0.001ms | 字典 O(1) 查找 |
| execute() 超时设置 | < 0.01ms | asyncio.timeout 上下文管理器 |

### 7.2 工具执行开销

| 工具 | 典型耗时 | 缓存命中 | 资源消耗 |
|------|---------|----------|----------|
| search_knowledge | 200-500ms | 0ms (缓存命中) | Ollama Embedding |
| read_file | 5-20ms | 0ms | 磁盘 I/O |
| query_database | 10-50ms | 0ms | MongoDB 查询 |
| execute_code | 100-5000ms | 不可缓存 | CPU/内存 |
| write_file | 10-50ms | 不可缓存 | 磁盘 I/O |

---

## 八、测试规格

#### Scenario: 装饰器注册工具
- **Given** 使用 `@ToolRegistry.register(name='search_knowledge', ...)` 装饰函数
- **When** 模块被导入
- **Then** `ToolRegistry._tools['search_knowledge']` 包含 ToolDefinition 对象

#### Scenario: get_tools_for_llm 返回正确格式
- **Given** 注册了 search_knowledge 和 read_file 两个工具
- **When** `registry.get_tools_for_llm(categories=['knowledge'])`
- **Then** 仅返回 knowledge 分类的工具

#### Scenario: 执行未注册工具抛出异常
- **Given** 工具 `unknown_tool` 未注册
- **When** `registry.execute('unknown_tool', {})`
- **Then** 抛出 `ToolNotFoundError`

#### Scenario: 工具执行超时保护
- **Given** 工具 `slow_tool` 的 `timeout_ms = 1000`
- **When** 工具执行超过 1000ms
- **Then** `asyncio.timeout` 触发 TimeoutError，返回结构化错误

#### Scenario: 单例模式——多次实例化同一对象
- **Given** `r1 = ToolRegistry()`, `r2 = ToolRegistry()`
- **Then** `r1 is r2` 为 True

#### Scenario: 工具名称冲突——后注册覆盖先注册
- **Given** 工具 `search_knowledge` 已注册
- **When** 另一个模块以相同名称注册
- **Then** 后注册的覆盖先注册的，WARNING 日志记录

#### Scenario: 工具模块导入失败不影响其他工具
- **Given** `tools/broken_tool.py` 有语法错误
- **When** `discover_tools()` 执行
- **Then** 其他工具正常加载，ERROR 日志记录 broken_tool 导入失败

#### Scenario: 工具返回超大结果自动截断
- **Given** 工具 `max_result_bytes = 100_000`
- **When** 工具返回 150KB 的 JSON 结果
- **Then** 结果截断至 100KB，添加 `truncated: true` 标记

---

## 九、回归问题

| # | 预测问题 | 原因 | 验证方法 |
|---|---------|------|---------|
| 1 | 工具 description 误导 LLM 错误调用 | 描述不精确或不完整 | 运行 Agent 行为测试，检查 LLM 工具选择准确率 |
| 2 | 装饰器注册顺序导致工具不可用 | 模块导入顺序问题 | 启动时验证 `stats.total_tools >= 预期工具数` |
| 3 | 单例模式多 Worker 下状态不一致 | 每个 Worker 独立注册 | 验证所有 Worker 的 `stats.total_tools` 一致 |
| 4 | 工具超时后 Agent 无感知 | 返回错误而非抛异常 | Agent 检查工具返回的 `error` 字段 |
| 5 | 工具参数 JSON Schema 与函数签名不一致 | 开发者手动维护两处 | 添加装饰器参数校验（从函数签名推导 JSON Schema） |
| 6 | 工具结果截断导致 LLM 基于不完整信息决策 | 关键信息可能被截断 | 截断时保留开头和结尾，中间标注 `[省略 N bytes]` |

---

## 十、代码审查检查清单

- [ ] 每个工具独立一个 `.py` 文件，在 `tools/` 目录下
- [ ] 工具通过 `@ToolRegistry.register` 装饰器注册（非手动字典）
- [ ] 工具 `description` 是 LLM 可理解的自然语言
- [ ] 工具 `parameters` 符合 JSON Schema 格式
- [ ] `execute()` 包含 `asyncio.timeout` 超时保护
- [ ] `execute()` 包含异常兜底（返回结构化错误）
- [ ] `execute()` 包含结果大小检查（`max_result_bytes`）
- [ ] `get_idempotent_tools()` 返回的集合与 YA-09-14 缓存策略一致
- [ ] ToolRegistry 为单例模式（线程安全）
- [ ] 新增工具无需修改 Agent 核心代码
- [ ] `discover_tools()` 在启动时自动扫描
- [ ] 工具名称冲突时 WARNING 日志记录

---

## 十一、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 工具 description 误导 LLM 错误调用 | 中 | 中 | 工具描述需 CR 审查 + Agent 行为测试 |
| 装饰器注册顺序导致工具不可用 | 低 | 高 | 所有工具模块必须在 Agent 启动前 import |
| 单例模式多 Worker 下状态不一致 | 低 | 低 | 工具注册在启动时完成（只读），运行时无变更 |
| 工具超时后 Agent 静默卡住 | 中 | 中 | asyncio.timeout 确保超时后返回错误信息 |
| 工具结果截断导致 LLM 误判 | 低 | 中 | 截断时保留首尾，中间标注省略 |

---

*PRD 来源: `projects/yiai/requirements/2026-09/18-需求-Agent工具链插件化.md`*

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

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
