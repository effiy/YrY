---
title: 完成前验证说明
updated: 2026-09-23
---

## 完成前验证 AI 智能体

### 快速开始

```
用户：改好了，应该没问题了

助手：[完成前验证模式]
  先跑自动化检查...
  
  YiVad:
  ✅ vue-tsc --noEmit — 0 errors
  ✅ pnpm test — 41/41 passed
  ✅ pnpm lint — 0 warnings
  
  自动化检查全部通过。接下来人工验证清单：
  
  - [ ] 功能按验收标准验证
  - [ ] 边界情况（空数据、网络错误）
  - [ ] UI 一致性
  ...
```

### 为什么需要完成前验证？

**为什么「写完了」不等于「完成了」？**
类型错误、测试失败、调试代码残留——这些是机器能发现但人眼容易忽略的问题。完成前验证用自动化 + 清单的方式，把「完成」从主观感觉变为客观事实。

**为什么不直接合并？**
在合并前发现问题 = 本地修复 5 分钟。在合并后发现 = 回滚 + 修复 + 重新审查 30 分钟。

### 与其他技能的协作

- **task-planning** → verification：所有执行步骤完成后触发验证
- **code-review** → verification：审查修复完成后触发验证
- **verification** → issue-creator：验证中发现的遗留问题创建 Issue

### 架构

```
verification-before-completion/
├── SKILL.md                            # 技能本身（4 阶段验证流程）
└── references/
    └── verification-checklist-full.md  # 按项目分类的完整检查清单
```