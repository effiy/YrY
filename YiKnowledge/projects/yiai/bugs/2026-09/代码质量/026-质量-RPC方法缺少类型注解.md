---
title: data_service.py 四个 RPC 方法缺失参数类型注解
tags: [yiai, code-quality, type-hints]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# data_service.py 四个 RPC 方法缺失参数类型注解

## 现象

`src/services/database/data_service.py` 中的 4 个 RPC 方法接受无类型注解的 `params` 参数：

```python
# 无类型提示 — 调用方无法知道 params 的预期结构
async def create_document(params):
async def update_document(params):
async def delete_document(params):
async def upsert_document(params):
```

而同一模块中 `query_documents` 却有正确的类型注解：
```python
async def query_documents(params: Dict[str, Any]) -> Dict[str, Any]:
```

同样，`src/domain/wework/client.py` 的 `send_message` 返回类型是裸 `dict` 而非 `Dict[str, Any]`。

## 根因分析

- 早期 RPC 方法编写时未强制类型注解
- 部分模块后来添加了注解，但不一致
- IDE 和类型检查器（mypy/pyright）无法提供补全和验证

## 涉及文件

- `src/services/database/data_service.py:17,22,27,32` — `create_document`、`update_document`、`delete_document`、`upsert_document`
- `src/domain/wework/client.py:44` — `send_message` 返回裸 `dict`
- `src/domain/files/storage.py:123` — `delete_oss_file` 缺失返回类型
- `src/server/mcp_server.py:81,95,114` — 缺失返回类型注解
- `src/data/sessions.py:10,21` — 缺失参数注解

## 修复方案

为所有公开函数统一添加 `Dict[str, Any]` 或适当的 TypedDict 类型注解。优先级：
1. services 层 RPC 方法（对外契约）
2. domain 层公共 API
3. server 路由处理器

## 预防措施

- 启用 mypy/pyright 严格模式检查函数签名
- Code review 要求所有公共函数有类型注解

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/services/database/data_service.py`
- `src/domain/wework/client.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
