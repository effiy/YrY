# Story · 模块化执行引擎（execution）

> 模块：[YiAi Story](../index.md) · `src/domain/execution/`

## 场景

- [US-EX-1 · 自然语言描述任务拆解为多步执行并汇总](scene-1-plan-execute/index.md)
- [US-EX-2 · 新能力挂载新执行器无需改路由](scene-2-extend-executor/index.md)
- [US-EX-3 · 追踪每一步执行的状态与产物](scene-3-step-tracing/index.md)

## 使用场景 · 模块化

- `domain/execution/` 内部以注册表模式管理执行器，公共入口 `run(plan)` 不感知具体执行器实现。
- 新执行器加入：在 `domain/execution/<name>/` 新增模块 + 注册，不改 `server/routes/execution.py` → 模块边界的演化稳定性。
