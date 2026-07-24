# Scene · 切换审查规则集

> Story: [aicr](../index.md) · US-A4

## 用户故事

作为 reviewer，能切换审查规则集（安全 / 性能 / 可读性）。

## 验收

- 下拉选择三个预设：security / performance / readability。
- 切换后立即重新审查当前 PR（复用 US-A1 的 `useReview()`）。
- 当前选择持久化到 localStorage，跨刷新保留。

## 使用场景 · 组件化

- `<RulesetSelector>` 组件 emit `change`，父组件调用 `useReview().rerun(ruleset)`。
- `useRuleset()` composable 承载持久化与默认值；为未来自定义规则留扩展点。
