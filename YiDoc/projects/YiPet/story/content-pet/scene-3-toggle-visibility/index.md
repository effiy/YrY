# US-E3 · 可见性切换 + 站点黑名单

> Story: [content-pet](../index.md) · 前端组件化

## 用户故事

作为希望控制宠物出现场景的用户，我想通过 popup 设置"在哪些站点隐藏宠物"，并且一键全局隐藏 30 分钟，以便在正式会议/演示时不受打扰。

## 验收标准

- 黑名单匹配规则支持 `host` / `host+path` 两种粒度，保存后对已打开 tab 立即生效（无需刷新）。
- "全局隐藏 30 分钟"按钮触发后所有 tab 的宠物淡出，popup 角标显示倒计时；到点自动恢复。
- 宠物可见性变化触发 `visibilitychange` 事件，其他模块（如 content-chat）可订阅以联动面板位置。

## 使用场景 · 组件化

- `<VisibilityToggle>` 受控组件，接收 `visible` 与 `onToggle`；不直接读黑名单。
- `useSiteBlocklist()` composable 维护规则与匹配，注入到 `<PetShell>` 的挂载决策；黑名单变更通过事件总线广播。
