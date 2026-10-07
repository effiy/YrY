---
doc_type: dev
title: "YiPot 收尾修复（第六轮）— 开发方案"
tags: [开发方案, 前端, 生命周期, timer, listener]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-110
prd_ref: YP-09-69
estimate: 0.25
review_status: 已评审
roles: [engineer]
---

# YiPot 收尾修复（第六轮）— 开发方案

> 开发编号：YP-09-110 · 关联 PRD：YP-09-69 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/window/Config/pages/General/index.jsx` | 修改 | 模块级 `timer` → `useRef` |
| `src/components/WindowControl/index.jsx` | 修改 | resize listener 添加 useEffect cleanup |

---

## 二、实施步骤

### Step 1: General/index.jsx — timer 生命周期

```jsx
// Before (module-level):
let timer = null;

// After (component scope):
const timerRef = useRef(null);
// All references: timerRef.current
```

Import add: `useRef` from React.

### Step 2: WindowControl/index.jsx — listener cleanup

```jsx
// Before:
useEffect(() => {
    listen('tauri://resize', async () => { ... });
}, []);

// After:
useEffect(() => {
    const unlisten = listen('tauri://resize', async () => { ... });
    return () => { unlisten.then((f) => f()); };
}, []);
```

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/69-prd-收尾修复第六轮.md` |
| 测试 | `../tests/2026-09/115-prd-test-收尾修复第六轮.md` |
| Bug 024 | `../bugs/功能缺陷/024-general-timer-windowcontrol-listener.md` |