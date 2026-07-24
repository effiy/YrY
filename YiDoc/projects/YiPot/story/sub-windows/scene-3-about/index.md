# Scene · 关于窗口检查更新与反馈

> Story: [sub-windows](../index.md) · US-W3

## 用户故事

作为用户，关于窗口能检查更新与反馈。

## 验收

- "检查更新" 触发 `updater.rs`；发现新版本显示 changelog + 一键更新按钮。
- 反馈入口打开默认邮件客户端或外链 issue tracker。
- 版本号、构建时间、平台信息可见，便于排查。

## 使用场景 · 组件化

- `<AboutPanel>` 组件只读展示版本 / 构建 / 平台信息。
- `<UpdateChecker>` 组件承载更新流程；emit `available(version)` / `none` / `error`。
