# US-H2 · handler 失败不影响其他 handler

> Story: [bg-handlers](../index.md) · 后端模块化

## 用户故事

作为多 handler 并存的运维者，我想某个 handler 崩溃时其他 handler 仍可正常响应，且崩溃被隔离到单次调用，以便单点故障不蔓延。

## 验收标准

- handler A 抛错时，同 traceId 内后续 handler B 仍正常执行，B 的结果不受 A 影响。
- handler 崩溃连续 5 次后自动熔断 30s，期间该 type 直接返回 `circuit-open`；30s 后半开试探一次。
- 熔断状态可在 popup "诊断" 面板查看与手动重置。

## 使用场景 · 模块化

- `handlers/runner.ts` 集中包裹执行：每个 handler 独立 try/catch + 独立熔断器实例；handler 之间无共享可变状态。
- `circuit/` 独立模块，暴露 `open()` / `allow()` / `reset()`；runner 调用其接口，不实现熔断算法本身。
