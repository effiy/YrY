# Story · AI Code Review（aicr）

> 模块：[YiWeb Story](../index.md) · `src/views/aicr/`

## 场景

- [US-A1 · 提交 PR 得到逐行 diff 审查报告](scene-1-submit-pr/index.md)
- [US-A2 · 对审查评论回复执行具体操作](scene-2-comment-actions/index.md)
- [US-A3 · 审查结果写回 GitHub](scene-3-writeback-github/index.md)
- [US-A4 · 切换审查规则集](scene-4-switch-ruleset/index.md)

## 使用场景 · 模块化

- `views/aicr/` 基于 `createBaseView` 统一入口模式，组件树不可见内部 store 实现。
- 审查流程：提交 PR → Diff 解析 → LLM 逐行审查 → 报告生成 → 写回 GitHub。
