# US-P2 · 主题切换 + 通知偏好

> Story: [popup](../index.md) · 前端组件化

## 用户故事

作为长时间使用 YiPet 的用户，我想在 popup 里一键切换深浅主题、调整通知偏好（声音/角标），并且设置跨设备同步，以便保持视觉一致与免打扰。

## 验收标准

- 主题切换在 100ms 内全 popup 生效，且写入 `chrome.storage.sync`，下次打开任意 tab 的 popup 仍为所选主题。
- 通知偏好变化立即生效，下一次任务完成通知遵守新设置；角标计数在 popup 关闭后保持准确。
- 偏好面板可折叠/展开，记忆展开状态跨会话保留。

## 使用场景 · 组件化

- `<SettingsPanel>` 受控组件，接收 `value` 与 `onChange`；不直接读写 storage，由 `useSettings()` composable 注入。
- 主题 token 由 `theme.css` 提供，`<ThemeProvider>` 包裹根节点；切换时只更新 `data-theme` 属性，不重渲染子树。
