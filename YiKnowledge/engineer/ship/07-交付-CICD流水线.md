---
title: "CI/CD Pipeline Setup"
aliases: [cicd, ci-cd, pipeline, continuous-integration, quality-gates]
tags: [ci, cd, pipeline, quality, automation, ship]
category: engineer/ship
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Set up CI/CD pipelines for YrY monorepo — quality gates that catch issues before they reach production"
acceptance_criteria:
  - "Quality gates defined per project"
  - "Pipeline stage descriptions"
  - "Local CI simulation commands"
  - "Failure recovery guidance"
related:
  - ./06-交付-搭建测试基础设施.md
  - ./02-交付-加固供应链.md
  - ../../INDEX.md
---

# CI/CD 流水线

> 自动化质量门禁——在代码合并到主分支之前捕获问题。YrY 的 CI/CD 策略是按项目独立流水线，因为它们的技术栈和检查方式不同。

## 流水线架构

```
Push/PR 触发
│
├── YiAi 流水线（Python）
│   ├── Lint: ruff check
│   ├── Type/Import: python -m compileall
│   ├── Test: pytest -v --cov
│   └── Security: pip-audit
│
├── YiVad 流水线（TypeScript/Vue）
│   ├── Lint: eslint + stylelint
│   ├── Type: vue-tsc --noEmit
│   ├── Test: vitest run
│   ├── Security: npm audit
│   └── Build: pnpm build:dev
│
├── YiPet 流水线（TypeScript/Chrome Ext）
│   ├── Lint: eslint
│   ├── Type: tsc --noEmit
│   ├── Test: vitest run
│   ├── Security: npm audit
│   └── Build: npm run build
│
└── YiKnowledge（文档）
    └── Validate: frontmatter + 目录深度 + 命名约定
```

## 质量门禁定义

### 阻塞级（必须通过才允许合并）

| 项目 | 门禁 | 命令 | 超时 |
|------|------|------|------|
| YiAi | Ruff lint | `ruff check src/` | 1 min |
| YiAi | 所有测试通过 | `python -m pytest tests/ -v` | 5 min |
| YiAi | 依赖无已知漏洞 | `pip-audit` | 2 min |
| YiVad | ESLint 无错误 | `pnpm lint` | 2 min |
| YiVad | 类型检查通过 | `pnpm type:check` | 3 min |
| YiVad | 构建成功 | `pnpm build:dev` | 5 min |
| YiPet | TypeScript 编译通过 | `npm run type:check` | 2 min |
| YiPet | 构建成功 | `npm run build` | 3 min |
| YiPet | 所有测试通过 | `npm test` | 2 min |

### 警告级（不阻塞但需关注）

| 项目 | 门禁 | 命令 |
|------|------|------|
| YiAi | 测试覆盖率下降 > 5% | `pytest --cov --cov-fail-under=50` |
| YiVad | Stylelint 警告 | `pnpm stylelint` |
| YiVad/YiPet | npm audit 中低危漏洞 | `npm audit` |
| 所有项目 | 提交信息格式 | commitlint |

## 本地模拟 CI

在 push 之前本地运行相同的检查：

### YiAi

```bash
cd YiAi
ruff check src/              # Lint
python -m pytest tests/ -v   # 测试
pip-audit                    # 安全审计
```

### YiVad

```bash
cd YiVad
pnpm lint                    # ESLint
pnpm type:check              # vue-tsc --noEmit
pnpm test                    # vitest run
pnpm build:dev               # 构建验证
```

### YiPet

```bash
cd YiPet
npm run lint                 # ESLint
npm run type:check           # tsc --noEmit
npm test                     # vitest run
npm run build                # 构建验证
```

## 流水线配置示例

### GitHub Actions（推荐）

```yaml
# .github/workflows/ci-yiai.yml
name: CI — YiAi

on:
  push:
    paths: ['YiAi/**']
  pull_request:
    paths: ['YiAi/**']

jobs:
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: YiAi

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Lint
        run: ruff check src/

      - name: Type check (compileall)
        run: python -m compileall src/

      - name: Test
        run: python -m pytest tests/ -v --cov --cov-fail-under=50

      - name: Security audit
        run: pip-audit
```

```yaml
# .github/workflows/ci-yivad.yml
name: CI — YiVad

on:
  push:
    paths: ['YiVad/**']
  pull_request:
    paths: ['YiVad/**']

jobs:
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: YiVad

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: YiVad/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type:check

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build:dev

      - name: Security audit
        run: pnpm audit-ci --moderate
```

### 路径触发优化

利用 `paths` 过滤器避免不必要的流水线运行：

```yaml
# YiVad 流水线仅在 YiVad/ 下有变更时触发
on:
  push:
    paths:
      - 'YiVad/**'
      - '.github/workflows/ci-yivad.yml'

# YiAi 流水线仅在 YiAi/ 下有变更时触发
on:
  push:
    paths:
      - 'YiAi/**'
      - '.github/workflows/ci-yiai.yml'
```

## 流水线失败处理

### 常见失败及修复

| 失败类型 | 含义 | 修复 |
|---------|------|------|
| `ruff check` 失败 | 代码风格不符 | `ruff check --fix src/` 自动修复 |
| `vue-tsc --noEmit` 失败 | 类型错误 | 查看错误行号，修复类型不匹配 |
| `pytest` 失败 | 测试未通过 | 查看失败测试的错误信息，修复代码或更新测试 |
| `npm audit` 高危 | 依赖有已知漏洞 | `npm audit fix` 或手动升级 |
| `pnpm build:dev` 失败 | 构建错误 | 查看构建日志，通常为未使用的导入或类型错误 |
| `pip-audit` 高危 | Python 依赖有漏洞 | `pip install --upgrade <package>` |

### 快速诊断

```bash
# 查看最近一次 CI 运行
gh run list --limit 1

# 查看具体失败日志
gh run view <run-id> --log-failed

# 在本地复现 CI 环境
# 模拟 clean install
cd YiVad
rm -rf node_modules && pnpm install --frozen-lockfile
pnpm type:check && pnpm build:dev
```

## 部署流水线（规划中）

当前 YrY 部署为手动操作。未来自动化方向：

```
GitHub Actions (CI 通过)
  │
  ├── YiAi → Docker build → push to registry → deploy to server
  ├── YiVad → Build static files → upload to OSS/CDN
  └── YiPet → Build extension → upload to Chrome Web Store
```

## 流水线健康监控

| 指标 | 当前目标 | 说明 |
|------|---------|------|
| CI 通过率 | > 90% | 近 30 天 main/master 分支 |
| CI 平均耗时 | < 10 min | 从 push 到全部通过 |
| 类型检查通过率 | 100% | 阻塞级门禁，必须通过 |
| 测试覆盖率 | > 50% | 低于阈值产生警告 |

## 反模式

| 反模式 | 正确做法 |
|---|---|
| CI 只在 PR 时运行，不检查 push 到 main | main 分支也需要 CI（防止直接 push 绕过 PR） |
| 在 CI 中使用 `npm install` | 使用 `npm ci`（严格按 lockfile 安装） |
| CI 配置不限制路径触发 | 每个 commit 都触发所有项目流水线，浪费资源 |
| CI 失败后直接 merge | 修复 CI 失败再合并，除非是已知的 infra 问题 |
| 不维护 CI 配置 | CI 配置是代码的一部分，随项目演进同步更新 |