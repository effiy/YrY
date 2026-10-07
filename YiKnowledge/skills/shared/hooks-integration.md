---
title: Hooks 集成指南
updated: 2026-09-23
tags: [skills, reference, hooks, automation]
type: reference
status: stable
---

# Hooks 集成指南

> 参考 everything-claude-code 的 hooks 模式。将技能接入 Claude Code 的生命周期钩子，实现自动化触发。

## 什么是 Hooks？

Hooks 是 Claude Code 在特定事件点自动执行的脚本或指令。它们让你在正确的时间自动触发正确的技能，减少手动提示。

## 可用的钩子点

| 钩子 | 触发时机 | 适合自动化的技能 |
|------|---------|----------------|
| **SessionStart** | 每次新会话开始 | task-planning（恢复上次任务） |
| **PreToolUse** | 执行工具调用前 | 无（技能在对话层触发） |
| **PostToolUse** | 执行工具调用后 | verification（文件修改后检查） |
| **Notification** | 收到通知时 | 按通知内容触发对应技能 |
| **Stop** | 会话结束时 | task-planning（保存进度摘要） |

## 推荐配置

### 1. SessionStart — 会话恢复

每次新会话开始时，自动检查是否有进行中的任务：

```json
// .claude/settings.json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "command": "cat <<'PROMPT'\n检查 tasks/ 目录是否有进行中的三文件任务。如有，执行 task-planning 恢复流程。\nPROMPT\n"
      }
    ]
  }
}
```

### 2. Stop — 进度快照

会话结束时，自动保存当前进度摘要：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "command": "cat <<'PROMPT'\n如果当前有进行中的 task-planning 任务，在 progress.md 末尾追加一条会话结束记录（时间 + 当前状态）。\nPROMPT\n"
      }
    ]
  }
}
```

### 3. PostToolUse — 关键操作后自动检查

在文件写入操作后，可以触发快速检查：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "cat <<'PROMPT'\n检查刚才的修改是否引入了明显问题：\n1. 是否有未使用的导入？\n2. 参数名是否符合 RPC 契约（filter/query, target_file/path）？\n3. 是否有调试代码残留（console.log/print）？\nPROMPT\n"
      }
    ]
  }
}
```

## 技能链自动化

将多个技能串联为自动化流水线：

### 新功能开发流水线

```
SessionStart
  → 检查是否有未完成的 task-planning 任务
  → 如有，恢复执行

每个步骤完成（手动提示）
  → TDD: RED → GREEN → REFACTOR
  → progress.md 更新

所有步骤完成后（手动提示）
  → code-review（自动触发审查）
  → verification（审查通过后自动验证）
  → finishing（验证通过后提示提交）
```

### 提交流水线（finishing 触发）

```
用户说「提交」
  → finishing 自动执行：
    1. 最终验证确认
    2. 检查是否需要更新文档
    3. 生成 Conventional Commits 信息
    4. 创建提交
    5. 询问是否推送/创建 PR
```

## 与 task-planning 的深度集成

task-planning 的三文件模式天然适合 hooks：

```
SessionStart:
  → 扫描 tasks/*/task_plan.md
  → 发现未完成任务 → 自动恢复
  → 无未完成任务 → 正常开始

Stop:
  → 扫描 tasks/*/progress.md
  → 追加会话结束记录
  → 标记最后活动时间

PostToolUse (Write/Edit):
  → 检测是否修改了 task_plan 中涉及的文件的文件
  → 如是 → 提示更新 progress.md
```

## 注意事项

1. **钩子不替代技能** — 钩子用于自动化触发，技能指令仍需完整
2. **避免循环触发** — PostToolUse 中的检查不应再次触发 PostToolUse
3. **最小干预** — 钩子指令应简短，不打断主要工作流
4. **可关闭** — 用户应能临时禁用钩子（如「跳过自动检查」）