---
paths:
  - "skills/rui-version/**"
  - "skills/rui-version/SKILL.md"
description: "语义化版本管理的规则和策略"
---

# rui-version 版本策略

> 语义化版本管理的规则和策略，独立于实现细节。

## SemVer 决策树

```
变更类型判定流程:
  1. 扫描 git diff (HEAD~1..HEAD 或 staged changes)
  2. 按以下规则分类变更:

     ┌─ 包含破坏性 API 变更? ───→ MAJOR (X.0.0)
     │  (删除/重命名公开接口、变更函数签名、修改 Agent 契约)
     │
     ├─ 包含新增功能/接口? ───→ MINOR (x.Y.0)
     │  (新增 export、新增故事、新增 skill)
     │
     └─ 仅修复/文档/重构? ───→ PATCH (x.y.Z)
        (bug fix、文档更新、内部重构)
```

## 版本文件同步

| 文件 | 字段 | 更新方式 |
|------|------|---------|
| plugin.json | version | 直接替换 |
| marketplace.json | version | 直接替换 |
| CLAUDE.md | 版本行 | 正则替换 |
| README.md | 版本徽章 | 正则替换 |

## --up 流程

```
git checkout main → 检查工作区干净 → 分析变更 → 判定版本 →
更新所有版本文件 → 生成变更日志 → git commit → git tag →
git push origin main + git push --tags → 输出升级摘要
```

## --rollback 流程

```
定位故事版本记录 → 确认回滚目标版本 → 恢复版本文件 →
git commit → git push
```

## 核心规则

| # | 规则 | 设计理由 |
|---|------|---------|
| 1 | 全自主操作，无需用户确认版本号 | 信模型 |
| 2 | 必须在 main 分支上操作 | 版本管理在主干 |
| 3 | 工作区必须干净 | 防止未提交变更混入版本 |
| 4 | 版本号严格递增，不可回退 | SemVer 规范 |
| 5 | 所有版本文件同步更新 | 单一真相源 |
| 6 | 变更日志从 git log 自动提取 | 可追溯 |

## 冲突解决

| 情况 | 处置 |
|------|------|
| 非 main 分支 | git stash → checkout main → stash pop |
| 工作区不干净 | 中止，提示提交或暂存变更 |
| 版本文件不一致 | 以 plugin.json 为真相源，同步其他文件 |
| tag 已存在 | 中止，提示手动处理 |

## 版本历史

每次版本升级必须记录到 version_history：

```
version_history 条目格式:
  - version: X.Y.Z
  - date: ISO 8601
  - type: MAJOR | MINOR | PATCH
  - summary: 变更摘要 (≤ 50 字)
  - stories: [涉及的故事名]
```

## 变更日志生成

从 git log 自动提取变更摘要：

```
生成规则:
  1. 取上一次 tag 到 HEAD 的 commit 列表
  2. 按类型分组: feat→MINOR, fix→PATCH, BREAKING→MAJOR
  3. 去重合并同类变更
  4. 生成 Markdown 格式变更日志
```

## 边界场景

| 场景 | 处置 |
|------|------|
| 首次发布 | 版本号为 0.1.0，tag 为 v0.1.0 |
| 无变更 | 不升级，提示"无变更可升级" |
| 混合变更 | 按最高级别判定 (MAJOR > MINOR > PATCH) |
| 多人同时升级 | 检测远程 tag，冲突时提示手动处理 |
| 回滚后再次升级 | 版本号从回滚后的版本递增 |
| 跨多个版本升级 | 自动生成中间版本的变更日志摘要 |