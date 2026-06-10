---
name: rui-version
description: Semantic version management — autonomous bump determination, file sync, git commit, push, and story version rollback. Command: /rui-version.
user_invocable: true
lifecycle: default-pipeline
---

# rui-version

> 自主判定下一版本号，更新所有版本文件，git commit + auto-merge → main + push。
> **全自主操作，无需用户确认版本号。项目级和故事级统一入口。**
>
> `/rui version --up` 或 `/rui version --rollback <name>`（通过 rui 编排器调用）
> 或 `/rui-version --up` 或 `/rui-version --rollback <name>`

## version --up

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    CMD["/rui-version --up"]:::src --> CHECK{"当前分支?"}
    CHECK -->|"非 main"| STASH["git stash → checkout main<br/>→ stash pop → 在 main 上操作"]:::op
    CHECK -->|"main"| ANALYZE["分析当前变更<br/>git diff + 版本历史"]:::op
    STASH --> ANALYZE
    ANALYZE --> DECIDE{"变更类型?"}
    DECIDE -->|"PATCH<br/>措辞/格式/修复"| PATCH["bump PATCH<br/>1.7.0 → 1.7.1"]:::op
    DECIDE -->|"MINOR<br/>新功能/新命令"| MINOR["bump MINOR<br/>1.7.0 → 1.8.0"]:::op
    DECIDE -->|"MAJOR<br/>架构变更/破坏性"| MAJOR["bump MAJOR<br/>1.7.0 → 2.0.0"]:::op
    PATCH --> UPDATE["更新版本文件<br/>plugin.json · marketplace.json<br/>CLAUDE.md · README.md"]:::op
    MINOR --> UPDATE
    MAJOR --> UPDATE
    UPDATE --> COMMIT["git commit<br/>含版本号 + 变更摘要"]:::op
    COMMIT --> PUSH["git push origin main<br/>+ git tag + push --tags"]:::op
    PUSH --> REPORT["输出升级摘要"]:::out
```

### 版本判定规则

| 变更信号 | 版本升级 | 示例 |
|---------|---------|------|
| 仅文档措辞/格式调整 | PATCH | `1.30.0` → `1.30.1` |
| 新增 skill/agent/rule/命令 | MINOR | `1.30.0` → `1.31.0` |
| 删除/重命名命令或接口 | MINOR | `1.30.0` → `1.31.0` |
| 架构重构/破坏性变更 | MAJOR | `1.30.0` → `2.0.0` |

### 版本文件同步清单

| 文件 | 路径 | 字段 |
|------|------|------|
| plugin.json | `.claude-plugin/plugin.json` | `.version` |
| marketplace.json | `.claude-plugin/marketplace.json` | `.metadata.version` + `.plugins[0].version` |
| CLAUDE.md | `CLAUDE.md` | 项目画像表 `版本` 行 |
| README.md | `README.md` | 版本引用 |

## version --rollback

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    CMD["/rui-version --rollback &lt;name&gt;"]:::src --> LOG["git log<br/>查看版本历史"]:::op
    LOG --> SELECT["定位目标版本<br/>按 commit message 匹配"]:::op
    SELECT --> CONFIRM{"用户确认?"}
    CONFIRM -->|"是"| REVERT["git revert<br/>回退版本变更"]:::op
    CONFIRM -->|"否"| ABORT["中止"]:::abort
    REVERT --> REPORT["输出回退摘要"]:::out
```

## 核心规则

| 约束 | 规则 |
|------|------|
| 不降级 | 新版本号必须 > 旧版本号 |
| 四文件同步 | plugin.json / marketplace.json / CLAUDE.md / README.md 版本号一致 |
| 不跳号 | 版本号严格递增 |
| git 强制 | 必须产生 git commit + tag |
| 仅 main | 在 main 分支上操作，推送目标为 origin/main |
| 工作区干净 | 执行前检查 `git status --porcelain`，有未提交变更时中止 |
| 回退需确认 | rollback 为破坏性操作，执行前必须用户确认 |

## 生效标志

| 标志 | 验证方式 |
|------|---------|
| 四文件版本号一致 | grep version 四文件 |
| git tag 已创建 | `git tag --list 'v*'` |
| 版本号严格递增 | 对比 version_history |

## 自循环

> 版本漂移检测。Agent 可按间隔检查全局版本一致性。

| 属性 | 值 |
|------|-----|
| 推荐间隔 | `0 9 * * 1`（每周一早 9 点） |
| 触发条件 | 有新的 git tag 或 commit 但 version_history 未更新 |
| 终止条件 | 四文件版本号一致且与 git tag 对齐 |
| 迭代动作 | 检查 plugin.json · CLAUDE.md · README.md · package.json → 对比版本号 → 不一致时提示 |
| 收敛判定 | 全局版本号一致且无漂移 |
