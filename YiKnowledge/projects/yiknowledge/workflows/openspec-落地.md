# OpenSpec Land 工作流

> 代码变更落地后的收口流程：回写 artifacts → 验证 → 提交推送

## 适用场景

当你对 YiKnowledge 知识库做了修改，且这些修改涉及 `openspec/changes/` 下的某个 change 时，必须走此流程确保文档和代码同步。

## 流程步骤

```
代码修改完成
  │
  ▼
1. 回写 OpenSpec artifacts
  │  - 对照变更更新 spec.md
  │  - 更新 tasks.md（标记已完成）
  │  - 新增行为加 ADDED Requirements
  │
  ▼
2. Verify（opsx:verify <change-name>）
  │  - CRITICAL 问题必须修复
  │  - WARNING 记录但不阻塞
  │
  ▼
3. ⏸️ 确认卡点：是否 commit + push？
  │
  ▼
4. Commit + Push（用户确认后执行）
  │
  ▼
完成
```

## 回写原则

1. **spec 回写**：代码改了什么，spec 就描述什么
2. **tasks 回写**：已完成的标记 `[x]`
3. **不回写的情况**：纯格式修正不涉及 spec 定义的变更

## 快捷命令

Claude Code 中使用 `/opsx:land <change-name>` 一键执行完整流程。