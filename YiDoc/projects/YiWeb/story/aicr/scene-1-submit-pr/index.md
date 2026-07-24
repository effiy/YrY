# Scene · 提交 PR 得到逐行 diff 审查报告

> Story: [aicr](../index.md) · US-A1

## 用户故事

作为 reviewer，我提交一个 PR 后得到 AI 逐行 diff 审查报告。

## 验收

- 提交 PR URL 后，前端拉取 diff 分块渲染，显示进度条。
- 审查结果按文件分组，每条评论携带 `file:line` 定位与严重级别（blocker / warning / nit）。
- 失败时显示重试按钮，不吞错误。

## 使用场景 · 组件化

- `<DiffViewer>` 组件渲染 hunk 与行号；不直接持有审查状态。
- `useReview()` composable 管理提交 → 轮询 → 结果的生命周期，与 `<DiffViewer>` 解耦。
