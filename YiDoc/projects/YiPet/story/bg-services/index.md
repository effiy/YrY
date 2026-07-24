# Story · services · 长任务服务

> 模块：[YiPet Story](../index.md) · `src/background/services/`

## 场景

- [US-SE1 · 长任务在后台持续，结果回写 content](scene-1-long-task-background/index.md)
- [US-SE2 · 长任务可取消与查询进度](scene-2-cancel-progress/index.md)

## 使用场景 · 模块化

- `services/` 暴露 `start() / cancel() / status()` 公共接口；handler 委派，不感知实现。
