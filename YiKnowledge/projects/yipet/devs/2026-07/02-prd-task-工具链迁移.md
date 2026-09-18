---
doc_type: module
prd_task_id: "YP-07-02"
title: "YP-07-02: 工具链迁移 — ESLint + Prettier + Husky + commitlint + Vitest — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiPet
project_id: yipet
prd_month: "202607"
estimate_frontend: 1.5
source_prd: "02-基础设施-工具链迁移.md"
source_okr: [yipet-001]
---

# YP-07-02: 工具链迁移 — 开发方案

> 需求编号：YP-07-02 · 优先级：P1 · 人天：1.5d

---

## 一、方案概述

建立 YiPet 的代码质量工具链：ESLint + Prettier 保证代码风格一致，Husky + lint-staged + commitlint 建立 Git 提交门禁，Vitest 提供测试框架。

```mermaid
flowchart LR
  SAVE["保存"] -->|"Prettier + ESLint"| STAGE["git add"]
  STAGE -->|"lint-staged"| HOOK["pre-commit"]
  HOOK -->|"ESLint"| COMMIT["git commit"]
  COMMIT -->|"commitlint"| PUSH["push"]
```

### 工具链

| 工具 | 版本 | 触发时机 | 失败行为 |
|------|------|---------|---------|
| ESLint | 10.x | 保存 + pre-commit | 阻止提交 |
| Prettier | 3.x | 保存 | 自动修复 |
| Stylelint | 17.x | pre-commit | 阻止提交 |
| Husky | 9.x | Git hooks | — |
| lint-staged | 17.x | pre-commit | 阻止提交 |
| commitlint | 21.x | commit-msg | 阻止提交 |
| Vitest | 2.x | 手动/CI | — |

---

## 二、文件清单

| 文件 | 类型 | 职责 |
|------|------|------|
| `eslint.config.mjs` | 新增 | ESLint 10 配置 |
| `.prettierrc` | 新增 | Prettier 格式化配置 |
| `.stylelintrc` | 新增 | Stylelint 样式检查 |
| `.husky/pre-commit` | 新增 | lint-staged 钩子 |
| `.husky/commit-msg` | 新增 | commitlint 钩子 |
| `commitlint.config.ts` | 新增 | Conventional Commits 校验 |
| `vitest.config.ts` | 新增 | Vitest 测试配置 |

---

## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | ESLint 10 + Prettier 3 | `npm run lint` 通过 | 0.5 |
| 2 | Husky + lint-staged | 不规范代码阻止提交 | 0.25 |
| 3 | commitlint + cz-git | 不规范提交信息被拦截 | 0.25 |
| 4 | Vitest + jsdom | `npm test` 运行 | 0.25 |
| 5 | Stylelint + 集成 | 全工具链串联验证 | 0.25 |

**合计：1.5d**

---

## 四、完成定义（DoD）

- [ ] 7 个文件按 §2 清单落地
- [ ] pre-commit 阻止不规范代码提交
- [ ] commit-msg 拦截不规范提交信息
- [ ] `npm run lint` + `npm test` 通过