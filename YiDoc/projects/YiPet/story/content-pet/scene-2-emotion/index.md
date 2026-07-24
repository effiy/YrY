# US-E2 · 情绪反馈 + 表情切换

> Story: [content-pet](../index.md) · 前端组件化

## 用户故事

作为与宠物互动的用户，我想宠物能根据我的操作（点击/长按/空闲）切换表情，并在长时间空闲后进入"睡觉"状态，以便感知到状态反馈。

## 验收标准

- 表情状态机：happy（点击）/curious（长按）/idle（5s 无操作）/sleep（60s 无操作）；切换 ≤ 200ms。
- 表情用 SVG 资源，无额外请求；切换时只更新 `<use href>`，不重挂载组件。
- 进入 sleep 后任意操作立即唤醒至 happy，且不需要重新点击两次。

## 使用场景 · 组件化

- `<PetFace>` 接收 `mood` prop 渲染对应 SVG；纯展示组件，不参与状态机。
- `useMoodMachine()` composable 持有状态机逻辑，封装输入事件 → mood 的映射；`<PetShell>` 通过该 composable 注入 mood。
