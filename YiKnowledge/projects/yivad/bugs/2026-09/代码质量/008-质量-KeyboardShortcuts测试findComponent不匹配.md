---
title: "code-quality: KeyboardShortcuts 测试 findComponent 名称不匹配"
tags: [yivad, bug, test, code-quality]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: closed
severity: trivial
priority: p3
project: YiVad
module: tests/components/KeyboardShortcuts.test.ts
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
benefit: "缺陷记录：质量-KeyboardShortcuts测试findComponent不匹配"
lifecycle: active
---

# code-quality: KeyboardShortcuts 测试 findComponent 名称不匹配

## 现象

`pnpm test` 中 1 个测试失败：
```
FAIL  tests/components/KeyboardShortcuts.test.ts > KeyboardShortcuts > has keyboard shortcut data
AssertionError: expected false to be true
 ❯ tests/components/KeyboardShortcuts.test.ts:22:75
```

## 复现步骤

1. 运行 `cd YiVad && pnpm test`
2. 观察 KeyboardShortcuts 测试失败

## 预期行为

测试应验证组件成功挂载并包含快捷键数据

## 实际行为

`wrapper.findComponent({ name: "keyboardShortcuts" })` 返回 `false`。`findComponent` 查找的是子组件，而 `KeyboardShortcuts` 是根组件，因此找不到同名的子组件。

## 根因分析

`findComponent` 在组件树中查找子组件，不会匹配根组件自身。`<script setup name="keyboardShortcuts">` 中的 `name` 属性需要 `unplugin-vue-define-options` 插件才能生效，在当前配置下被忽略。

## 修复方案

将测试改为直接验证组件实例和内部数据：

```diff
- expect(wrapper.findComponent({ name: "keyboardShortcuts" }).exists()).toBe(true);
+ expect(wrapper.vm).toBeDefined();
+ expect(wrapper.vm.groups).toBeDefined();
+ expect(wrapper.vm.groups.length).toBeGreaterThan(0);
```

## 影响范围

- **影响模块**：tests/components/KeyboardShortcuts.test.ts
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否

## 验证方法

- [x] `pnpm test` 通过（17 个文件，109 个测试）
- [x] `vue-tsc --noEmit` 通过

## 预防措施

| 层面 | 措施 |
|------|------|
| 测试 | 使用 `wrapper.vm` 直接访问组件实例，避免依赖 `findComponent` 查找根组件 |
| 流程 | 提交前运行 `pnpm test` |

## 经验教训

- **`findComponent` 查找子组件，不匹配根组件**：`wrapper.findComponent({ name: "keyboardShortcuts" })` 在组件树中向下搜索，不会匹配 wrapper 自身的根组件。验证根组件应使用 `wrapper.vm` 直接访问实例
- **`<script setup name>` 的插件依赖**：`name` 属性在 `<script setup>` 中需要 `unplugin-vue-define-options` 才能生效。测试中依赖 `name` 查找组件是脆弱的——组件重命名后测试可能静默失败

