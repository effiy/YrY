---
title: "YV-09-104-TASK: 关键基础设施漏洞修复 — 实施"
tags: [开发方案, 内存泄漏, 认证安全, 跨项目]
category: 项目/管理后台/开发
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: task
status: 已完成
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-104-TASK
prd_ref: YV-09-104
estimate: 0.5
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-104-TASK: 关键基础设施漏洞修复 — 实施

---

## Step 1: Grid KeepAlive 守卫

**文件**: `src/components/Grid/index.vue`

**问题**: `onMounted` + `onActivated` 双重注册 → 监听器累积

**修改**:
```typescript
let _resizeListener = false;
function addResizeListener() {
  if (_resizeListener) return;
  window.addEventListener("resize", resize);
  _resizeListener = true;
}
function removeResizeListener() {
  if (!_resizeListener) return;
  window.removeEventListener("resize", resize);
  _resizeListener = false;
}

onMounted(() => { resize(/*...*/); addResizeListener(); });
onActivated(() => { resize(/*...*/); addResizeListener(); });
onUnmounted(() => removeResizeListener());
onDeactivated(() => removeResizeListener());
```

**关键**: `addResizeListener()` 是幂等的——第二次调用直接返回，不注册重复监听器。

---

## Step 2: SSE localStorage Key

**文件**: `src/hooks/useNotificationSSE.ts`

**修改**: `"user-store"` → `"yivad-user"` (匹配 Pinia `persist(id)` 参数)

---

## Step 3: Feedback RPC 重路由

**文件**: `src/api/modules/feedbackService.ts`

**修改**: `http.post(module_name: "services.ai.feedback_service")` → `createDocument("feedback", ...)`

使用通用 data_service 持久化，无需专属后端模块。

---

## 变更文件

| 文件 | 变更 |
|------|------|
| `src/components/Grid/index.vue` | 添加 `_resizeListener` 守卫 |
| `src/hooks/useNotificationSSE.ts` | `"user-store"` → `"yivad-user"` |
| `src/api/modules/feedbackService.ts` | RPC → data_service |

## 验证

- `vue-tsc --noEmit`: 0 errors
- Grid: DevTools → Performance Monitor → JS Event Listeners → 切换 10 次后检查
- SSE: DevTools → Network → `/notification/stream?token=` 检查
- Feedback: 点击 👍 → MongoDB `feedback` 集合检查