---
title: "Git Workflow Guide"
aliases: [git-workflow, branch-strategy, commit-convention, pr-process]
tags: [git, workflow, branch, commit, conventional-commits, collaboration]
category: engineer/run
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Consistent Git workflow across all YrY projects — branch naming, commit conventions, PR process"
acceptance_criteria:
  - "Branch naming convention documented"
  - "Conventional Commits with examples"
  - "PR creation and review process"
  - "Merge vs rebase decision guide"
related:
  - ./02-运行-开发工作流.md
---

# Git 工作流指南

> YrY 所有项目遵循统一的分支策略和提交规范。commitlint + cz-git 在 YiVad 和 YiPet 中自动执行 Conventional Commits。

## 分支策略

### 分支类型

| 分支 | 用途 | 命名前缀 | 示例 |
|------|------|---------|------|
| 主分支 | 生产就绪代码 | `main` | — |
| 开发分支 | 集成开发中的功能 | `master`（当前） | — |
| 功能分支 | 新功能或修复 | `claude/` | `claude/fix-sse-abort-bug` |
| 发布分支 | 发布准备 | `release/` | `release/v1.2.0` |
| 热修复分支 | 生产紧急修复 | `hotfix/` | `hotfix/auth-token-expiry` |

### 分支命名规范

```
{type}/{short-description}

type: claude | feature | fix | refactor | release | hotfix
short-description: kebab-case, 3-5 words
```

```
✓ claude/add-rpc-parameter-validation
✓ fix/sse-onDone-abort-guard
✓ feature/project-dashboard-view
✓ refactor/api-client-error-handling
✗ fix-bug  (缺少 type/)
✗ claude/fixSSEAbortBug  (应使用 kebab-case)
✗ feature/添加用户管理  (英文优先，便于 git 命令行操作)
```

## Conventional Commits

### 格式

```
<type>(<scope>): <subject>

[body]

[footer]
```

### Type（提交类型）

| Type | 含义 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(yivad): add project dashboard page` |
| `fix` | Bug 修复 | `fix(yivad): guard onDone callback after SSE abort` |
| `refactor` | 代码重构（无功能变更） | `refactor(yiai): extract filter builder to shared` |
| `perf` | 性能优化 | `perf(yiai): add index for session queries` |
| `style` | 代码格式（不影响逻辑） | `style(yivad): format with prettier` |
| `test` | 测试相关 | `test(yiai): add unit tests for error codes` |
| `docs` | 文档变更 | `docs(yiknowledge): update engineering README` |
| `chore` | 构建/工具链变更 | `chore(yivad): upgrade rsbuild to v2` |
| `ci` | CI 配置变更 | `ci: add type-check to GitHub Actions` |

### Scope（影响范围）

```
yiai | yivad | yipet | yiknowledge | root
```

`root` 用于影响整个单体仓库的变更（如根级 CLAUDE.md、GitHub Actions）。

### 示例

```bash
# 标准功能提交
git commit -m "feat(yivad): add ai chat message export to markdown"

# Bug 修复
git commit -m "fix(yiai): prevent session key collision on concurrent create"

# 带详细说明
git commit -m "$(cat <<'EOF'
feat(yipet): add pet skin customization panel

- Skin selection with preview thumbnails
- Skin state persisted to chrome.storage.local
- Default skin fallback when custom skin unavailable

Closes #42
EOF
)"

# 破坏性变更
git commit -m "$(cat <<'EOF'
refactor(yiai)!: rename query_documents sortField parameter to sort_field

BREAKING CHANGE: Frontend must update from sortField to sort_field
in all query_documents calls. See migration guide in ship/03.
EOF
)"
```

### 使用 cz-git（推荐）

YiVad 和 YiPet 已配置 cz-git 交互式提交：

```bash
git add <files>
npx cz  # 或 git cz
# → 交互式选择 type → scope → subject → body → footer
```

## 日常开发流程

### 开始新功能

```bash
# 1. 确保在最新的 master/main
git checkout master
git pull origin master

# 2. 创建功能分支
git checkout -b claude/feature-description

# 3. 开发 → 小步提交
git add src/services/ai/chat_service.py
git commit -m "feat(yiai): add streaming response helper"

git add src/api/modules/chatService.ts
git commit -m "feat(yivad): consume streaming chat endpoint"

# 4. 推送分支
git push -u origin claude/feature-description
```

### 变基到最新 master

```bash
# 开发过程中同步 master 的变更
git fetch origin
git rebase origin/master

# 解决冲突后
git add <resolved-files>
git rebase --continue
```

### 本地提交管理

```bash
# 修改最后一次提交（未 push 时）
git add <forgotten-file>
git commit --amend --no-edit

# 合并最近 3 次提交
git rebase -i HEAD~3
# 将第 2、3 个 pick 改为 squash
```

## Pull Request 流程

### 创建 PR

```bash
# 推送分支后，使用 gh CLI 创建 PR
gh pr create \
  --title "feat(yivad): add project dashboard" \
  --body "$(cat <<'EOF'
## Summary
- 添加项目仪表盘页面，展示项目关键指标
- 使用 ECharts 展示任务分布、进度趋势
- 复用 ProTable 展示最近活动

## Test plan
- [ ] 仪表盘在 3 种项目中正确展示数据
- [ ] 无项目时显示空状态引导
- [ ] 图表在不同窗口尺寸正常渲染

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### PR 标题规范

```
<type>(<scope>): <description>
```

与 commit message 格式一致。PR 标题通常会成为 squash merge 的提交信息。

### Code Review 关注点

| 检查项 | 重点关注 |
|--------|---------|
| RPC 参数名 | `filter` 不是 `query`，`target_file` 不是 `path` |
| 模块边界 | 不跨层调用（如 View 不直接调 repository） |
| 安全 | 无硬编码密钥、无 SQL/命令注入、用户输入校验 |
| 错误处理 | 不要吞掉异常、给用户友好的错误提示 |
| 类型安全 | TypeScript 无 `any`、Python 有类型注解 |

## 合并策略

| 场景 | 策略 | 命令 |
|------|------|------|
| 单提交的功能分支 | Squash merge | GitHub UI 选择 "Squash and merge" |
| 多提交但逻辑独立 | Rebase merge | `git rebase master && git merge --ff-only` |
| 多人协作的长期分支 | Merge commit | `git merge --no-ff claude/long-running-feature` |

**默认使用 Squash merge**——保持 master 历史线性清晰。

## 特殊情况处理

### 紧急热修复

```bash
# 1. 从 main 创建 hotfix 分支
git checkout main
git checkout -b hotfix/critical-bug

# 2. 修复 + 提交
git commit -m "fix(yiai): prevent null pointer on empty session history"

# 3. 合并到 main
gh pr create --title "fix(yiai): prevent null pointer on empty session history" --base main

# 4. 同步到 master
git checkout master
git merge main
```

### 回滚已合并的提交

```bash
# 使用 revert 而非 reset——不重写历史
git revert <commit-hash>
git commit -m "revert: undo broken session migration"
```

## 预提交检查（自动执行）

YiVad 和 YiPet 通过 Husky + lint-staged 在提交前自动执行：

```
git commit 触发 →
  ├── lint-staged: ESLint + Prettier 格式化暂存文件
  ├── commitlint: 验证提交信息格式
  └── (手动) type:check 不阻塞提交
```

## 反模式

| 反模式 | 正确做法 |
|---|---|
| `git add -A` 或 `git add .` | 按文件或目录选择性 `git add`，避免提交敏感文件 |
| 提交包含 `.env` 或密钥 | 加入 `.gitignore`，已提交的用 `git rm --cached` |
| 一个大提交包含 20 个文件的改动 | 拆分成多个逻辑独立的小提交 |
| Force push 到 main/master | 永远不要 force push 共享分支 |
| `git commit --no-verify` 绕过 hooks | 修复 hook 报的错误，而不是跳过 |