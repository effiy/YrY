---
title: "YV-09-110: CI/CD 质量门禁集成方案"
tags: [CI/CD, 质量门禁, 自动化]
category: 项目/管理后台/规范
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: spec
status: stable
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YiVad CI/CD 质量门禁集成方案

---

## 一、目标架构

```
PR 提交 → lint-staged (本地) → CI Pipeline (远程)
                                    │
                          ┌─────────┼─────────┐
                          ▼         ▼         ▼
                      TypeCheck   Lint     Build+Test
                      vue-tsc     ESLint   pnpm build
                      (30s)       (15s)    (60s+vitest)
                          │         │         │
                          └─────────┼─────────┘
                                    ▼
                              全部通过 → 可合入
                              任一失败 → 阻断
```

## 二、建议配置

### 2.1 GitHub Actions / 通用 CI

```yaml
# .github/workflows/ci.yml
name: Quality Gate
on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: npx vue-tsc --noEmit    # P0 阻断

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint:eslint          # P1 阻断
      - run: pnpm lint:prettier --check
      - run: pnpm lint:stylelint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test -- --coverage   # P2 建议
```

### 2.2 新增 ESLint 规则

```javascript
// .eslintrc.js 追加
rules: {
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "import/first": "error",
}
```

### 2.3 Pre-commit Hook（已有）

```bash
# lint-staged 已配置 (husky 9)
# 当前: ESLint + Prettier + Stylelint
# 追加: vue-tsc --noEmit (仅变更文件类型检查，快于全量)
```

## 三、质量门禁矩阵

| 门禁 | 执行时机 | 阻断级别 | 当前状态 |
|------|----------|----------|----------|
| lint-staged | git commit | 阻断 | ✅ 已配置 |
| commitlint | git commit | 阻断 | ✅ 已配置 |
| vue-tsc | CI / PR | 阻断 | ❌ 待集成 |
| ESLint (全量) | CI / PR | 阻断 | ✅ pnpm lint:eslint 可用 |
| Stylelint | CI / PR | 建议 | ✅ pnpm lint:stylelint 可用 |
| vitest | CI / PR | 建议 | ✅ pnpm test 可用 |
| 构建验证 | CI / PR | 阻断 | ✅ pnpm build:pro 可用 |
| Bundle 分析 | CI / PR | 建议 | ❌ 待集成 |
| console.log 检查 | CI / PR | 建议 | ❌ 待集成 (`grep "console.log" dist/`) |

## 四、立即可行

| # | 行动 | 命令 | 耗时 |
|---|------|------|------|
| 1 | 本地 vue-tsc 门禁 | `npx vue-tsc --noEmit` | ~30s |
| 2 | ESLint 规则追加 | 编辑 `.eslintrc.js` | 5min |
| 3 | CI 配置文件 | 新建 `.github/workflows/ci.yml` | 15min |
| 4 | pre-push hook | husky `pre-push` + vue-tsc | 10min |