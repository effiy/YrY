# Scene · 新能力挂载新执行器无需改路由

> Story: [execution](../index.md) · US-EX-2

## 用户故事

作为开发者，我能为新能力挂载新执行器，无需改动路由层。

## 验收

- 新执行器 = 在 `domain/execution/<name>/` 新增模块 + `@executor("name")` 注册。
- 路由层不感知新执行器；planner 自动纳入可选。
- 执行器文档自动出现在 `/execution/executors` 列表。

## 使用场景 · 模块化

- 注册表模式 + 装饰器是模块边界稳定的关键；新能力只新增，不改动旧文件。
- 路由层只委派 `run(plan)`；planner 从注册表选执行器 → 模块演化零回归。
