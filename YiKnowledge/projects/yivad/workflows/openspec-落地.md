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
  │  - 用户可在此步骤审查 verify 结果后再决定
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
   - 移除字段 → 从 scenario 字段列表中删除
   - 新增功能 → 加 ADDED Requirements 或在现有 scenario 中补充
   - 修改行为 → 更新 scenario 的 WHEN/THEN 描述

2. **tasks 回写**：已完成的代码改动，在 tasks 中标记 `[x]` 并更新描述使其准确反映实现。
   - 如果实现和原 task 描述有偏差，修正描述而不是保持旧描述

3. **不回写的情况**：纯 bug 修复不涉及 spec 定义的变更时，可以只改代码不回写 spec。

## 快捷命令

Claude Code 中使用 `/opsx:land <change-name>` 一键执行完整流程。

其他 AI 工具参考此文档手动执行：回写 → 验证 → 确认 → 提交。

## 示例

**场景**：合箱详情页合箱号在信息区和表头重复展示，需要移除信息区的合箱号字段。

**回写操作**：
- `spec.md`：从"合箱信息区展示"scenario 中移除合箱号字段，加注释"合箱号已在顶部信息栏展示，不在信息区重复"
- `tasks.md`：更新 task 8.4 字段顺序描述，移除"合箱号"并加说明

**验证**：`opsx:verify sp-combined-box-info` → 无 CRITICAL 问题

**确认**：用户审查 verify 结果，确认继续 → commit + push

**提交**：代码 + spec + tasks 变更一起 commit