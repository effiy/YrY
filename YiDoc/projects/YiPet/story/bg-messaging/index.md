# Story · messaging · 消息分发

> 模块：[YiPet Story](../index.md) · `src/background/messaging/`

## 场景

- [US-M1 · content 通过 messaging 发起请求，background 路由到 handler](scene-1-content-request-route/index.md)
- [US-M2 · 新增命令只需注册 handler，不改 messaging 核心](scene-2-extend-handler/index.md)

## 使用场景 · 模块化

- `background/messaging/` 是消息总线；`background/handlers/` 注册表模式 → 新增命令零侵入。
