---
title: "前端代码质量：未使用变量与可变声明"
tags: [bug, frontend, code-quality, unused-vars, let-vs-const]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: yipot
module: src/
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# 前端代码质量：未使用变量与可变声明

---

## 一、现象

> **一句话描述**：`yiaiAdapter.ts` 中存在未使用的 `YIAI_ENABLED` 常量，`App.jsx` 中 `allowKeys` 使用 `let` 声明而非 `const`，`warn` 导入未使用。

---

## 二、复现步骤

1. 查看 `src/services/yiaiAdapter.ts:13` — `const YIAI_ENABLED = true;` 未被引用
2. 查看 `src/App.jsx:44,60` — `let allowKeys = [...]` 声明后无重新赋值
3. 查看 `src/App.jsx:4` — `import { warn }` 未被调用

TypeScript/ESLint 检查（如果启用）会报：
```
'yiaiAdapter.ts(13,7): error TS6133: 'YIAI_ENABLED' is declared but never read.'
```

---

## 三、根因分析

**问题代码位置**：

| 文件 | 行号 | 问题 |
|------|------|------|
| `src/services/yiaiAdapter.ts` | 13 | `YIAI_ENABLED` 声明但未使用——可能为功能开关预留但始终为 `true` |
| `src/App.jsx` | 4 | `warn` 从 `tauri-plugin-log-api` 导入但未使用 |
| `src/App.jsx` | 44,60 | `allowKeys` 使用 `let` 声明但未重新赋值 |

**根因**：
1. `YIAI_ENABLED` — 最初设计为控制 YiAi 集成开关，但 `shouldUseYiAi()` 函数已按 provider 类型判断，该常量成为死代码
2. `warn` 导入 — `App.jsx` 最初有 `warn("Can't detect system theme.")` 调用，后改为 `catch {}` 空块但导入未清理
3. `let allowKeys` — 数组引用未变，应使用 `const`

---

## 四、修复方案

1. 删除 `YIAI_ENABLED` 常量声明
2. 删除 `warn` 导入
3. `let allowKeys` → `const allowKeys`

---

## 五、验证方法

- [ ] `pnpm build` 构建成功
- [ ] TypeScript 检查无 `noUnusedLocals` 错误
- [ ] 翻译窗口快捷键行为不变

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `yiaiAdapter.ts`, `App.jsx` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 否 |
| 用户感知 | 无 |
| 数据完整性 | 不涉及 |