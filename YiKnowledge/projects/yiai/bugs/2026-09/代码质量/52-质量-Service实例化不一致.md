---
title: Domain 模块中服务实例化与路由处理器耦合不一致
tags: [yiai, code-quality, architecture]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# Domain 模块中服务实例化与路由处理器耦合不一致

## 现象

YiAi 的路由处理器中，域服务的实例化没有统一的模式：

- **直接 import + 函数调用**：`routes/knowledge.py` 直接 `from domain.knowledge.watcher import list_knowledge_files`
- **global 单例延迟加载**：`routes/state.py` 使用 `global _state_service` + 懒初始化
- **模块级导入**：`routes/execution.py` 在模块顶部 `from domain.execution.executor import execute_module`
- **方法内导入**：`routes/system.py` 在函数内部 `from data.database import db`

这些不一致的模式使得：难以 mock 测试、依赖注入困难、应用生命周期管理不统一。

## 根因分析

- 路由文件由不同开发者在不同时期编写
- 没有统一的依赖注入容器（如 FastAPI `Depends` 或自定义 DI）
- global 单例模式与直接函数调用混用

## 涉及文件

- `src/server/routes/state.py:19` — global 单例
- `src/server/routes/knowledge.py` — 直接 import
- `src/server/routes/execution.py` — 模块级 import
- `src/server/routes/system.py` — 函数内 import

## 修复方案

统一使用 FastAPI `Depends()` + `app.state` 管理服务生命周期：
```python
async def get_state_service(request: Request):
    if not hasattr(request.app.state, '_state_service'):
        request.app.state._state_service = StateStoreService()
    return request.app.state._state_service
```

## 预防措施

- 新增路由的服务实例化必须通过 `Depends()` 注入

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/server/routes/execution.py`
- `src/server/routes/system.py`
- `src/server/routes/knowledge.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
