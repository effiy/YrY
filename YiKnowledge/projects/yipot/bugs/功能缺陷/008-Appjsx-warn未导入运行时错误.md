---
title: "App.jsx warn() 函数未导入导致运行时 ReferenceError"
tags: [bug, frontend, js, import, runtime-error]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: yipot
module: src/App.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# App.jsx warn() 函数未导入导致运行时 ReferenceError

---

## 一、现象

> **一句话描述**：`App.jsx` 中 `catch {}` 块内调用 `warn("Can't detect system theme.")` 但未导入 `warn` 函数。当系统主题检测失败时，触发 `ReferenceError: warn is not defined`。

**错误日志**：

```
Uncaught ReferenceError: warn is not defined
    at App.jsx:92
```

---

## 二、复现步骤

1. 启动 YiPot
2. 将 `app_theme` 配置设为 `system`
3. 如果 `window.matchMedia` 抛出异常 → `catch` 块执行 `warn(...)` → ReferenceError

**大概率触发环境**：在不支持 `matchMedia` 的旧版 WebView2 环境中。

---

## 三、根因分析

**问题代码**：`src/App.jsx:92-94`

```jsx
try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
    // ...
} catch {
    warn("Can't detect system theme.");  // ← warn 未导入!
}
```

**根因**：Bug #008 修复时删除了 `import { warn } from 'tauri-plugin-log-api'`（当时 `warn` 确实未被使用），但 `catch` 块中仍保留了对 `warn` 的调用。删除导入时遗漏了此调用点。

---

## 四、修复方案

恢复 `warn` 的导入语句：

```jsx
import { warn } from 'tauri-plugin-log-api';
```

---

## 五、验证方法

- [x] `pnpm build` 构建成功
- [ ] 在不支持 `matchMedia` 的环境中触发系统主题检测失败，应用不崩溃
- [ ] 日志中正确出现 "Can't detect system theme."

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `App.jsx` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 是（应用崩溃） |
| 用户感知 | 旧版 WebView2 环境中应用无法启动 |
| 数据完整性 | 不涉及 |

---

## 七、预防措施

| 层面 | 措施 |
|------|------|
| 代码 | ESLint `no-undef` 规则可捕获此类问题（当前未启用） |
| 测试 | 添加 catch 路径的单元测试覆盖 |
| 流程 | 删除导入时检查所有调用点 |
| CI | 启用 `pnpm lint` 检查 |