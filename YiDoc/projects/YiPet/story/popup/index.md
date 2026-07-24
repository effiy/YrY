# Story · popup · 工具栏弹窗

> 页面：[YiPet Story](../index.md) · `src/popup/`

## 场景

- [US-P1 · 点击扩展图标弹出 popup，快速发起新会话或打开 content 面板](scene-1-quick-start/index.md)
- [US-P2 · popup 内切换主题与查看通知](scene-2-theme-notifications/index.md)

## 使用场景 · 组件化

- popup 与 content 共享 `YiPet/cdn/` 组件库；popup 本身保持极薄（入口壳），避免重复 content 内的 UI。
