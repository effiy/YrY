---
name: rui-claude
description: Manage ALL .claude/ directories across the repo — sync from remote, analyze health, and recommend tasks.
user_invocable: true
lifecycle: default-pipeline
---

# rui-claude

作用范围：当前项目的 `.claude/` 目录。sync / retro 均以 `.claude/` 为操作边界。

## 命令概览

| 命令 | 流程 |
|------|------|
| `/rui-claude sync` | `rm -rf .claude` → rsync 远端配置到本地 |
| `/rui-claude retro` | 分析 .claude/ 结构健康度 → 复盘文档写入 `docs/自改进故事面板/<project>-<date>.md` |
| `/rui-claude history` | 查看操作历史（list 最近20条 / stats 按命令统计） |
| `/rui-claude <requirement>` | 需求解析 → 故事拆分 → 逐故事 doc+code 管线 → 交付（仅限 .claude/ 内变更） |
| `/rui-claude` (空输入) | 扫描 .claude/ 健康 → 推荐 5~10 条任务 |

## sync

覆盖式更新：
1. `rm -rf .claude`
2. `rsync -avz --exclude '.git' root@www.effiy.cn:/home/claude/YiKnowledge/static/${PROJECT}/.claude/ ./.claude/`

`${PROJECT}` = `basename "$PWD"`。前置条件：本机 SSH key 已授权 `root@www.effiy.cn`。
完成后自动 `node skills/rui-claude/scripts/history.js record --command sync --outcome <result>`。

## retro

`node skills/rui-claude/scripts/retro.js` 采集 agents/rules/templates/skills 统计 → 生成三节复盘文档（§1 配置结构 §2 健康度 §3 改进项） → 写入 `docs/自改进故事面板/<project>-<date>.md`。

参数：`--name <story>` 关联故事，`--json` 输出 JSON 到 stdout。
复盘聚焦 .claude/ 配置本身，纯本地分析，不连远端。
完成后自动 `history.js record --command retro`。

## history

自动记录 + 查询。每次 sync/retro/<requirement> 完成后自动调用 `history.js record`。

记录字段：session_id, timestamp, command, args, project, outcome, duration_ms, summary。
存储：`.claude/.history/rui-claude-history.jsonl`（append-only，不入库不同步）。

查询：`history.js list [--limit N] [--json]` / `history.js stats [--json]`。

## \<requirement\> — .claude 配置变更端到端

从需求出发，拆分故事，逐故事走文档管线+代码管线。**所有文件变更限制在 `.claude/` 目录内。**

需求输入：文本 / @文件 / URL。故事目录以 `claude-` 为前缀（如 `claude-security-agent`）。

适用需求：新增 agent/rule/skill、修改 template、更新 CLAUDE.md、MCP 配置、脚本变更、组合变更。

管线阶段（与 `/rui <requirement>` 一致）：自适应规划→影响分析→架构设计→文档生成→预检→测试先行→实现→验证→自改进→交付。

**约束**：仅修改 `.claude/` 内文件；必须从 main 创建 `feat/<name>` 分支（H13）；禁止自动合并（H12）；故事文档 `docs/故事任务面板/` 除外。

## 空输入

扫描 agents/ rules/ templates/ skills/ CLAUDE.md .mcp.json + 复盘历史 + 故事目录 → 推荐分类：首次复盘/增量复盘(>7天)/配置补齐/全文档补齐/结构优化/定期巡检。

## 核心规则

1. 操作范围仅限 `.claude/`，不得触及外部文件
2. 分支隔离：对 `.claude/` 的任何代码修改必须通过 rui code 管线，必须在 `feat/<name>` 分支（H13）
3. 禁止自动合并（H12）
4. sync 覆盖式更新，执行前确认意图
5. retro 纯本地分析，不连远端
6. 空输入只推荐不执行
7. 不管理凭据（SSH key 由系统管理员配置）
8. 禁止自动 commit/push

详见 [rules/rui-claude.md](../../rules/rui-claude.md)。
