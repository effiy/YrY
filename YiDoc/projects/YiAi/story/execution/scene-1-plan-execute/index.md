# Scene · 自然语言描述任务拆解为多步执行并汇总

> Story: [execution](../index.md) · US-EX-1

## 用户故事

作为用户，我用自然语言描述任务，引擎将其拆解为多步执行并汇总结果。

## 验收

- 输入 NL → planner 产出 `Plan(executor_id, args)[]`。
- `execution.run(plan)` 顺序执行，每步产物可作为下一步输入。
- 最终汇总返回 JSON；失败步骤标记并继续其余可独立步骤。

## 使用场景 · 模块化

- `domain/execution.run(plan)` 是唯一入口；planner 在 `domain/execution/planner/`。
- 执行器在 `domain/execution/<name>/`；注册表模式，`run` 不感知具体执行器。
