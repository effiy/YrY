# Scene · 切换 21 个翻译引擎并对比结果

> Story: [main-window](../index.md) · US-M3

## 用户故事

作为用户，我能切换 21 个翻译引擎并对比结果。

## 验收

- 引擎下拉按分类（通用 / AI / 专业）分组；`check_service_available()` 过滤无 key 的引擎。
- 切换引擎立即重译当前文本；失败引擎不阻塞其他引擎。
- 多选模式并排显示多个引擎结果（下一步提取为 `<ResultCompare>`）。

## 使用场景 · 组件化

- `<EngineSelector>` 组件 props(engines, value, onChange)；不直接发起请求。
- `<ResultCompare>` 组件并排渲染多个引擎结果；订阅 `useTranslate()` 的多实例。
