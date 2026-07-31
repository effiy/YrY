---
title: Claude Code 使用经验
tags: [工具, Claude Code, AI 开发]
category: work/tools
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Claude Code 使用经验

## 1. 适用场景

Claude Code 是 Anthropic 官方 CLI，让 Claude 在终端中读写文件、运行命令、与 Git / GitHub 交互，配 sub-agents、skills、hooks、slash commands 等扩展机制。适合：

- 中大型代码库的代码搜索与重构
- 跨文件批量修改
- 复杂任务的多步执行
- PR / Issue 操作
- 工程师个人开发流

## 2. 关键功能

| 功能 | 用途 |
|---|---|
| /help | 内置帮助 |
| /clear | 清空当前会话上下文 |
| /init | 生成 CLAUDE.md 项目说明 |
| /review | 评审 PR |
| /loop | 定时循环任务（监控类） |
| Skills | 用户自定义 slash 命令 |
| Subagents | 子代理（并行 / 隔离上下文） |
| Hooks | 事件钩子（pre / post tool） |
| MCP servers | 接入外部工具 |
| Settings.json | 权限、env、hooks 配置 |

## 3. 最佳实践配置

### CLAUDE.md

- 项目根写 CLAUDE.md，让 Claude 理解项目
- 包含：架构、约定、命令、关键路径
- 不要写太长（几百行内）

### 权限配置

```json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Bash(git status)", "Bash(git log)"],
    "deny": ["Bash(rm -rf *)", "Bash(git push --force:*)"]
  }
}
```

按团队风险偏好调整，减少权限弹窗。

### Hooks

- PreToolUse：拦截危险命令
- PostToolUse：格式化、lint、自动 commit message
- Stop：会话结束通知

### Subagents

- 探索型任务用 Explore agent
- 复杂研究用 general-purpose
- 独立工作并行（一条消息多个 Agent 调用）

### Skills

- 把团队流程沉淀成 skill
- yry-code / yry-tools / yry-init 这类多 leaf skill 路由

## 4. 常用快捷键 / 命令

| 命令 | 作用 |
|---|---|
| /clear | 清上下文 |
| /compact | 压缩上下文（保留摘要） |
| /cost | 看本次会话花费 |
| /model | 切模型 |
| /fast | 切 Opus 4.6 fast 模式 |
| ! prefix | 直接运行 shell 命令 |
| # prefix | 添加记忆（memory） |
| @ prefix | 引用文件 / 目录 |

## 5. 与替代品对比

| 工具 | 优势 | 劣势 |
|---|---|---|
| Claude Code | 终端原生、sub-agents / skills / hooks 强 | Anthropic 模型绑定 |
| Cursor | IDE 集成、UI 友好 | 终端任务弱 |
| GitHub Copilot | 内置 VS Code、企业普及 | 单文件上下文弱 |
| Aider | 开源、git 友好 | 能力弱于 Claude Code |

## 6. 工作流推荐

### 大型重构

1. /init 更新 CLAUDE.md
2. 用 Explore agent 摸清代码
3. 让 Claude 写 plan，ExitPlanMode 对齐
4. 分步执行 + 每步测试
5. 最后 review + 提交

### 调试 bug

1. 用 Grep + Read 找根因
2. 让 Claude 修复 + 写测试
3. 运行测试验证
4. 必要时 explore agent 排查更广

### 文档生成

1. 用 yry-init skill 重建 CLAUDE.md / README
2. 让 Claude 写 RFC / ADR 草稿
3. 人工编辑

### 跨文件修改

1. Grep 找所有匹配
2. 让 Claude 批量 Edit
3. 跑测试验证

## 7. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 不读 CLAUDE.md | Claude 不懂项目 | /init 生成 |
| 权限太松 | 误执行危险命令 | 配 deny |
| 不用 subagent | 主上下文爆 | 独立任务用 Agent |
| 不用 plan mode | 大任务跑偏 | EnterPlanMode 对齐 |
| Hooks 不维护 | 阻塞正常工作 | 定期 review |
| 一次让改 10 文件 | 上下文丢失 | 分批 + 测试 |

## 8. 与其他工具关系

- 与 IDE（VS Code / Cursor）：互补，Claude Code 强在终端任务
- 与 Git：原生集成，PR / commit / branch 操作
- 与 MCP servers：扩展外部工具（数据库、Linear、Notion）
- 与 Skills：沉淀团队流程

## 9. 落地建议

- 团队共享 CLAUDE.md 模板
- 公共 skills 仓库（如 yry-* 系列）
- 权限配置文件版本控制
- 新人 onboarding 用 Claude Code 加速

## 10. 参考资料

- Claude Code 官方文档
- Anthropic — *Best Practices for Agentic Workflows*
- `/help` 内置
