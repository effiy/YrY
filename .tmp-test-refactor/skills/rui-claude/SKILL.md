---
name: rui-claude
description: Manage ALL .claude/ directories across the repo — sync from remote, analyze health, and recommend tasks.
user_invocable: true
lifecycle: default-pipeline
---

# rui-claude

作用范围：当前项目的 `.claude/` 目录。sync / retro 均以 `.claude/` 为操作边界。

## 命令

| 命令 | 流程 |
|------|------|
| `/rui-claude sync` | `rm -rf .claude` → rsync 远端配置到本地。前置：本机 SSH key 已授权 `root@www.effiy.cn` |
| `/rui-claude retro` | 分析 .claude/ 结构健康度 → 复盘文档写入 `docs/自改进故事面板/<project>-<date>.md` |
| `/rui-claude history` | 查看操作历史：`list [--limit N]` / `stats [--json]`。存储于 `.claude/.history/rui-claude-history.jsonl` |
| `/rui-claude <req>` | 需求解析→故事拆分→逐故事 doc+code 管线→交付。管线与 `/rui <req>` 一致，**所有文件变更限制在 `.claude/` 内** |
| `/rui-claude` | 调用 `node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/recommend.js --json` → 推荐 5~10 条 .claude/ 相关任务 |

## sync

覆盖式更新：`rsync -avz --exclude '.git' root@www.effiy.cn:/home/claude/YiKnowledge/static/${PROJECT}/.claude/ ./.claude/`。`${PROJECT}` = `basename "$PWD"`。完成后自动记录 history。

## retro

`node ~/.claude/plugins/marketplaces/yry/skills/rui-claude/scripts/retro.js` 采集 agents/rules/formulas.md/skills 统计 → 三节复盘（§1 配置结构 §2 健康度 §3 改进项）。参数：`--name <story>` / `--json`。纯本地分析，不连远端。

## history

每次 sync/retro/\<requirement\> 完成后自动调用 `node ~/.claude/plugins/marketplaces/yry/skills/rui-claude/scripts/history.js record`。存储 `.claude/.history/rui-claude-history.jsonl`（append-only，不入库不同步）。

## 核心规则

1. 操作范围仅限 `.claude/`，不得触及外部文件
2. 对 `.claude/` 的代码修改必须通过 rui code 管线，必须在 `feat/<project>-<name>` 分支(`no-checkout`)
3. 禁止自动合并(`auto-merge`)
4. sync 覆盖式更新，执行前确认意图
5. retro 纯本地分析
6. 空输入只推荐不执行
7. 禁止自动 commit/push

详见 [rules/rui-claude.md](../../rules/rui-claude.md)。
