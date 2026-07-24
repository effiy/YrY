# Scene · 在故事线上标注 review 关注点

> Story: [story-view](../index.md) · US-S2

## 用户故事

作为用户，能在故事线上标注 review 关注点。

## 验收

- 点击卡片打开标注编辑器；标注类型：blocker / nit / praise。
- 标注持久化到本地 state，可被协作者读取。
- 卡片右上角显示标注计数徽章。

## 使用场景 · 组件化

- `<AnnotationEditor>` 组件承载类型选择 + 文本输入；emit `save` / `cancel`。
- `useAnnotations()` composable 管理标注 CRUD，与 `useStoryLine()` 解耦。
