---
title: TDD 技能说明
updated: 2026-09-23
---

## 测试驱动开发 AI 智能体

### 快速开始

```
你：开始执行步骤 4，先写测试

助手：[TDD 模式 — RED]
  步骤 4：在页面头部添加主题切换开关

  先写测试——ThemeToggle 组件应：
  1. 渲染当前主题标签（「浅色」/「深色」/「跟随系统」）
  2. 点击按钮触发 toggle 事件
  3. 三种模式循环切换

  [写测试...]

  RED ✅ — 测试失败（组件不存在）
  进入 GREEN：写最小实现...
```

### 为什么先写测试？

**为什么不先写代码再补测试？**
「写完再补测试」经常变成「没时间补」。TDD 确保每行代码都有保护——先写测试定义行为，再写代码满足测试。

**为什么是 Red-Green-Refactor 三步？**
RED 确认测试有效（不写代码它也通过 = 测试写错了），GREEN 让你专注最小实现，REFACTOR 让你在安全网下优化代码。

**为什么不测框架行为？**
测试 `ref` 是否响应式 = 测试 Vue 框架，不是你的代码。每个测试都应回答「我的代码行为正确吗」，而非「框架工作正常吗」。

### 与其他技能的协作

- **task-planning** → TDD：每个执行步骤嵌入 TDD 循环
- TDD → **code-review**：审查时检查测试覆盖是否充分
- TDD → **verification**：测试全通过是完成门禁的核心条件
- Bug 修复 TDD ← **debugging**：先写复现测试再修复

### 架构

```
test-driven-development/
├── SKILL.md                # 技能本身（Red-Green-Refactor + 测试金字塔）
└── references/
    └── tdd-patterns.md     # 各语言/框架 TDD 模式速查（Vitest/pytest/Chrome）
```