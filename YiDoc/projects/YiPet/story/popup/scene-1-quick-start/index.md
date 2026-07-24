# US-P1 · 一键唤起 + 快速发牌

> Story: [popup](../index.md) · 前端组件化

## 用户故事

作为常驻多页面的用户，我想通过浏览器工具栏图标一键展开 popup，看到最近会话与快捷动作，以便零跳转地继续对话或发起一条新指令。

## 验收标准

- 点击工具栏图标后 popup 在 200ms 内展开，首屏渲染最近 3 条会话项。
- popup 与当前激活 tab 的 URL/选区同步：若页面选中了文本，"发牌"按钮自动带上选区作为上下文。
- 关闭 popup 不丢失最近会话状态；再次展开能恢复滚动位置。

## 使用场景 · 组件化

- `<PopupShell>` 只负责容器/快捷键/动画；会话列表由 `<SessionList>` 渲染，动作区由 `<QuickActions>` 渲染，互不耦合。
- `useRecentSessions()` composable 封装读取/恢复逻辑，`<PopupShell>` 不感知 storage 细节。
