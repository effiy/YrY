# Scene · 配置窗口调整引擎 key、快捷键、主题

> Story: [sub-windows](../index.md) · US-W1

## 用户故事

作为用户，我在配置窗口调整引擎 key、快捷键、主题。

## 验收

- 配置项分页：引擎 / 快捷键 / 主题 / 高级。
- 引擎 key 存入 `config.json`（tauri-plugin-store）；快捷键写入 `hotkey.rs` 监听表。
- 修改主题立即预览；保存按钮持久化。

## 使用场景 · 组件化

- `<ConfigTabs>` 组件承载分页切换；每页独立 `<EngineKeyForm>` / `<HotkeyForm>` / `<ThemePicker>`。
- 配置写入统一走 `services/configStore.js` 抽象，组件不直接调 Tauri store API。
