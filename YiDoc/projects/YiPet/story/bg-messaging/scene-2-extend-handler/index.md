# US-M2 · 扩展新增 handler 不改路由表

> Story: [bg-messaging](../index.md) · 后端模块化

## 用户故事

作为新功能开发者，我想新增一个 `tools.fetchUrl` 的 handler，只在自己的模块文件里写实现 + `register()`，不改 background 入口或路由表，以便扩展不污染主流程。

## 验收标准

- 新 handler 模块文件放到 `src/background/handlers/tools/fetch-url.ts`，导出 `register()` 即被自动加载；不修改 `background.ts`。
- handler 模块可声明依赖（如 services/network），由 DI 容器注入；handler 本身不 import 单例。
- 未加载该 handler 的环境（如轻量构建）调用 `tools.fetchUrl` 返回 `no-handler`，不影响其他 type。

## 使用场景 · 模块化

- `handlers/` 约定每个子目录一个功能域，域内 `index.ts` 调用 `messaging.register(type, fn)`；路由表运行时自填充。
- `services/` 通过 DI 注入到 handler，handler 只声明接口；后续替换实现（mock/real）不影响 handler 代码。
