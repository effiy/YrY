---
title: "YV-09-110-TASK: CI/CD 质量门禁实施"
tags: [CI/CD, 实施]
category: 项目/管理后台/开发
created: "2026-09-23"
source: 内部
type: task
status: 待开始
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-110-TASK
prd_ref: YV-09-110
estimate: 0.5
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-110-TASK: CI/CD 质量门禁实施

| Step | 行动 | 文件 |
|------|------|------|
| 1 | 创建 CI workflow | `.github/workflows/ci.yml` (新增) |
| 2 | ESLint 规则追加 | `.eslintrc.js` |
| 3 | pre-push hook | `.husky/pre-push` |
| 4 | 验证所有门禁通过 | `pnpm lint && vue-tsc && pnpm test && pnpm build:pro` |

## CI Workflow

```yaml
name: Quality Gate
on: [push, pull_request]
jobs:
  typecheck: { runs-on: ubuntu-latest, steps: [checkout, pnpm install, vue-tsc --noEmit] }
  lint: { runs-on: ubuntu-latest, steps: [checkout, pnpm install, lint:eslint, lint:prettier, lint:stylelint] }
  test: { runs-on: ubuntu-latest, steps: [checkout, pnpm install, pnpm test -- --coverage] }
```

## ESLint 追加

```js
rules: {
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "import/first": "error",
}
```