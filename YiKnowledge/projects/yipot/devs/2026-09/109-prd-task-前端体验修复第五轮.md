---
doc_type: dev
title: "YiPot 前端体验修复（第五轮）— 开发方案"
tags: [开发方案, 前端, 音频, 截图, 生命周期]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-109
prd_ref: YP-09-68
estimate: 0.5
review_status: 已评审
roles: [engineer]
---

# YiPot 前端体验修复（第五轮）— 开发方案

> 开发编号：YP-09-109 · 关联 PRD：YP-09-68 · 预估人天：0.5d

---

## 一、变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/hooks/useVoice.jsx` | 重写 | 完整重写为 useRef + 懒初始化 + 错误处理 |
| `src/window/Screenshot/index.jsx` | 修改 | async/await + try/catch + null guard |
| `src/window/Recognize/index.jsx` | 修改 | `unlisten` → `blurUnlisten` |
| `src/window/Config/pages/Backup/index.jsx` | 修改 | module-level `refreshTimer` → `useRef` |

---

## 二、实施步骤

### Step 1: useVoice.jsx — 完整重写

**Before 的 4 个问题**:
1. `let audioContext = new AudioContext()` — 模块加载时创建，被 autoplay policy 暂停
2. `let source = null` — 模块级共享状态
3. `decodeAudioData(buffer, successCb)` — 无错误回调
4. `source.stop()` — 无 try/catch，可能 InvalidStateError

**After**:
- AudioContext 用 `useRef` 懒创建，suspended 时自动 `resume()`
- source 用 `useRef` 隔离每个 hook 实例
- `decodeAudioData(buffer, onSuccess, onError)` 双回调
- stop/disconnect 包裹 try/catch

### Step 2: Screenshot/index.jsx — async/await

嵌套 `.then()` → `async/await + try/catch`。`onMouseUp` 添加 `imgRef.current` null guard。

### Step 3: Recognize/index.jsx — 变量重命名

`unlisten` → `blurUnlisten`（与 Translate 窗口保持一致）。

### Step 4: Backup/index.jsx — useRef

`let refreshTimer = null` (模块级) → `const refreshTimerRef = useRef(null)` (组件内)。已有 useEffect cleanup。

---

## 三、验证

```bash
cd YiPot && pnpm build
```

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/68-prd-前端体验修复第五轮.md` |
| 测试 | `../tests/2026-09/114-prd-test-前端体验修复第五轮.md` |
| Bug 020-023 | `../bugs/功能缺陷/020-023-*.md` |