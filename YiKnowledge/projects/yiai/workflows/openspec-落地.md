# OpenSpec Land 工作流

> 代码变更落地后的收口流程：回写 artifacts → 验证 → 提交推送

## 适用场景

当你对代码做了修改（bug 修复、功能调整、字段变更等），且这些修改涉及 `openspec/changes/` 下的某个 change 时，必须走此流程确保代码和文档同步。

## 流程步骤

```
代码修改完成
  │
  ▼
1. 回写 OpenSpec artifacts
  │  - 对照代码变更，更新对应的 spec.md（scenario 描述）
  │  - 更新对应的 tasks.md（标记已完成 / 修正描述）
  │  - 如果是新增行为，在 spec 中加 ADDED Requirements
  │  - 如果是删除行为，在 spec 中移除对应 scenario 或字段
  │
  ▼
2. Verify（opsx:verify <change-name>）
  │  - 检查 completeness / correctness / coherence
  │  - CRITICAL 问题必须修复
  │  - WARNING 记录但不阻塞
  │
  ▼
3. ⏸️ 确认卡点：是否 commit + push？
  │  - 询问用户是否继续提交推送
  │  - 用户可选择：全部提交 / 仅 commit 不 push / 跳过提交
  │
  ▼
4. Commit + Push（用户确认后执行）
  │  - 代码和 artifacts 变更一起提交
  │  - commit message 描述实际改动
  │
  ▼
完成
```

## 回写原则

1. **spec 回写**：代码改了什么，spec 就描述什么。不要让 spec 和代码不一致。
2. **tasks 回写**：已完成的代码改动，在 tasks 中标记 `[x]` 并更新描述使其准确反映实现。
3. **不回写的情况**：纯 bug 修复不涉及 spec 定义的变更时，可以只改代码不回写 spec。

## 快捷命令

Claude Code 中使用 `/opsx:land <change-name>` 一键执行完整流程。