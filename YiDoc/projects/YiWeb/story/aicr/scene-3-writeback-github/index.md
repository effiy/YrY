# Scene · 一键回写 GitHub PR 评论

> Story: [aicr](../index.md) · US-A3

## 用户故事

作为 reviewer，审查结果能一键回写 GitHub PR 评论。

## 验收

- "回写" 按钮触发前弹出确认对话框，列出将发布的评论数。
- 调用 `services/crud.js` 提交；成功 / 失败均显示 toast。
- 幂等：重复点击不产生重复评论（基于 review-id 去重）。

## 使用场景 · 组件化

- `<WritebackButton>` 组件封装确认 + 提交 + toast；emit `success` / `error`。
- `useGitHubWriteback()` composable 承载幂等键管理与 `services/crud.js` 调用。
