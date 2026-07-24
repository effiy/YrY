# Scene · UI 多语资源可运行时切换

> Story: [batch-ui](../index.md) · US-B3

## 用户故事

作为用户，UI 多语资源可运行时切换（`translations/`）。

## 验收

- 语言下拉即时切换；所有 UI 字符串从 `translations/` 加载。
- 缺失 key 报错而非静默降级。
- 新增语言只需新增 `translations/<lang>.json`，不改代码。

## 使用场景 · 模块化

- `st_utils/i18n.py` 是 i18n 唯一入口；UI 组件只读已解析字符串。
- 阶段模块不感知 UI 语言 → 模块边界清晰，UI 与管线解耦。
