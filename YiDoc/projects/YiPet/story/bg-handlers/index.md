# Story · handlers · 命令处理

> 模块：[YiPet Story](../index.md) · `src/background/handlers/`

## 场景

- [US-H1 · 每条命令的执行可观测（日志 / 错误）](scene-1-observability/index.md)
- [US-H2 · handler 失败不影响其他 handler](scene-2-fault-isolation/index.md)

## 使用场景 · 模块化

- handler 之间不互相直调；通过 messaging 总线或 services 间接协作 → 边界清晰。
