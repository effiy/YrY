---
title: 页面锁定与并发编辑控制
tags:
- 锁定
- 并发编辑
- 乐观锁
- 冲突解决
- WebSocket
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202609"
prd_task_id: YV-09-45
estimate_frontend: 0.5
review_status: 待评审
issue_type: 功能
roles:
- engineer
- qa
source_okr: [yivad-003]
---

# 页面锁定与并发编辑控制

> 需求编号：YV-09-45 · 优先级：P2 · 人天：0.5d
> 依赖：YiAi 后端需提供 lock API 端点（后端人天 0.5d）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| useEditLock Composable | 新增 | `src/composables/useEditLock.ts` |
| LockIndicator 锁定指示器组件 | 新增 | `src/components/lock/LockIndicator.vue` |
| ConflictResolver 冲突解决组件 | 新增 | `src/components/lock/ConflictResolver.vue` |
| LockStatusBadge 锁定状态徽章 | 新增 | `src/components/lock/LockStatusBadge.vue` |
| useLockHeartbeat 心跳 Hook | 新增 | `src/composables/useLockHeartbeat.ts` |
| useConcurrentEdit 并发编辑检测 Hook | 新增 | `src/composables/useConcurrentEdit.ts` |
| 锁定状态类型定义 | 新增 | `src/types/lock.ts` |
| 锁定 API 客户端 | 新增 | `src/api/lock.ts` |
| WebSocket 锁定状态监听 | 新增 | `src/composables/useLockWebSocket.ts` |
| 详情页面集成锁定指示器 | 修改 | 各详情页面组件 |

## 涉及文件

```
YiVad/
└── src/
    ├── api/
    │   └── lock.ts                            # 新增：锁定 API 客户端
    ├── composables/
    │   ├── useEditLock.ts                     # 新增：编辑锁定 Composable
    │   ├── useLockHeartbeat.ts                # 新增：锁心跳 Hook
    │   ├── useConcurrentEdit.ts               # 新增：并发编辑检测 Hook
    │   └── useLockWebSocket.ts                # 新增：WebSocket 锁定状态监听
    ├── components/
    │   └── lock/
    │       ├── LockIndicator.vue              # 新增：锁定指示器组件
    │       ├── ConflictResolver.vue           # 新增：冲突解决 UI
    │       └── LockStatusBadge.vue            # 新增：锁定状态徽章
    ├── types/
    │   └── lock.ts                            # 新增：锁定状态类型定义
    └── styles/
        └── lock.scss                          # 新增：锁定组件样式
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-45 |
| 模块 | 数据协作基础设施 |
| 优先级 | **P2**（防止数据覆盖丢失，非阻塞） |
| 前端人天 | 0.5d |
| 后端人天 | 0.5d（lock API 端点） |
| 依赖 | YiAi 后端 lock API 端点 |

---

## 背景

YiVad 作为团队协作管理后台，多个用户可能同时编辑同一个项目详情、同一个 Issue 或同一份文档。当前没有任何并发编辑控制机制，后保存的用户会静默覆盖先保存用户的内容，导致数据丢失且无法追溯。这种"最后写入者胜出"的模式在多人协作场景下存在严重的数据安全风险。

**核心问题：**

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **并发编辑覆盖** -- 后保存者静默覆盖先保存者 | **高** | 用户 A 编辑的内容被用户 B 覆盖，且无任何提示，数据丢失不可追溯 |
| 2 | **无编辑感知** -- 用户不知道其他人正在编辑同一实体 | **中** | 多人同时编辑同一页面，浪费精力且增加冲突概率 |
| 3 | **无冲突解决机制** -- 冲突发生后无法选择保留哪个版本 | **中** | 用户只能手动对比和合并，耗时且易出错 |
| 4 | **无只读保护** -- 无法阻止其他用户在编辑期间修改 | **中** | 编辑锁缺失，任何人都可以随时修改任何内容 |
| 5 | **无编辑历史** -- 无法追踪谁在何时编辑了什么 | **低** | 冲突发生后无法追溯责任和恢复内容 |

## 一、现状分析

### 当前并发编辑场景

| 场景 | 当前行为 | 风险 |
|------|---------|------|
| 两人同时编辑同一项目详情 | 后保存者覆盖先保存者内容 | 数据丢失 |
| 用户 A 编辑中，用户 B 删除 | 用户 A 保存时发现数据已不存在 | 编辑内容丢失 |
| 用户 A 打开表单，离开 30 分钟回来继续编辑 | 期间用户 B 已修改并保存 | 用户 A 基于旧版本修改，覆盖 B 的更改 |
| 管理员修改权限配置 | 无锁定，其他管理员可同时修改 | 权限配置冲突 |
| 同一用户多个标签页编辑同一实体 | 两个标签页各自保存，互相覆盖 | 自身编辑冲突 |

### 根因分析矩阵

| 缺失项 | 根因 | 影响链 |
|--------|------|--------|
| 编辑锁定 | 后端无 lock 端点，前端无锁获取/释放逻辑 | 无法阻止并发编辑，依赖用户自觉协调 |
| 版本号机制 | 数据模型无版本号字段，保存时不校验版本 | 无法检测"基于旧版本修改"的场景 |
| 冲突检测 | 保存时仅发送 PUT 请求，不携带 if-match 条件 | 静默覆盖，用户不知道发生了冲突 |
| 冲突解决 UI | 无并排对比界面，无合并/选择操作 | 冲突发生后用户只能手动处理 |
| 实时状态同步 | 无 WebSocket 推送，用户无法感知他人编辑状态 | 锁定状态不是实时的，依赖轮询 |

---

## 二、设计决策

### 锁定策略选型

| 维度 | 乐观锁（版本号） | 悲观锁（编辑锁） | 混合策略 | 决策 |
|------|---------------|---------------|---------|------|
| 并发性能 | 高，不阻塞其他用户 | 低，锁持有期间其他用户只读 | 中 | -- |
| 数据安全性 | 中，保存时检测冲突 | 高，编辑期间独占 | 高 | **混合策略** |
| 用户体验 | 中，冲突时需解决 | 高，编辑期间无冲突 | 高 | **混合策略** |
| 锁超时处理 | 不需要 | 需要心跳 + 超时释放 | 需要 | -- |
| 实现复杂度 | 低 | 中 | 高 | -- |

**决策：** 采用混合策略。默认使用乐观锁（版本号校验），当用户开始编辑时自动获取悲观锁（编辑锁）。悲观锁有 5 分钟超时，心跳续期。悲观锁获取失败时降级为乐观锁模式（只读 + 保存时冲突检测）。

### 锁超时与心跳

| 参数 | 值 | 说明 |
|------|-----|------|
| 锁超时时间 | 5 分钟 | 用户无操作 5 分钟后自动释放锁 |
| 心跳间隔 | 60 秒 | 每 60 秒发送心跳续期 |
| 心跳触发条件 | 用户有键盘/鼠标操作 | 仅在用户活跃时续期，避免锁被"僵尸"持有 |
| 锁强制释放 | 管理员操作 | 管理员可强制释放任何锁，记录审计日志 |

### 冲突解决策略

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| 采用我的版本 (Theirs) | 保留当前用户的编辑内容 | 用户确信自己的修改是最新的 |
| 采用对方的版本 (Yours) | 放弃当前编辑，使用对方保存的版本 | 用户发现自己的修改已过时 |
| 手动合并 (Merge) | 并排显示两个版本，用户手动选择字段 | 两个版本都有需要保留的内容 |

---

## 三、目标架构

```
┌──────────────────────────────────────────────────────────────────┐
│                  Page Lock & Concurrent Edit Control             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    YiAi Backend (Lock API)                │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │    │
│  │  │ POST /lock   │  │ DELETE /lock │  │ GET /lock     │  │    │
│  │  │ acquire      │  │ release      │  │ status        │  │    │
│  │  └──────────────┘  └──────────────┘  └───────────────┘  │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │  Lock Model: { entity_type, entity_id, user_id,    │  │    │
│  │  │    user_name, acquired_at, expires_at, version }   │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │  WebSocket: /ws/locks → 实时推送锁状态变更          │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   YiVad Frontend                          │    │
│  │                                                           │    │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐  │    │
│  │  │  useEditLock         │  │  useLockHeartbeat         │  │    │
│  │  │  - acquire(entity)   │  │  - start(lockId)          │  │    │
│  │  │  - release()         │  │  - stop()                 │  │    │
│  │  │  - checkStatus()     │  │  - onUserActivity()       │  │    │
│  │  │  - isLockedByMe      │  │  - interval: 60s          │  │    │
│  │  │  - isLockedByOther   │  │  - timeout: 5min          │  │    │
│  │  └──────────┬───────────┘  └────────────┬─────────────┘  │    │
│  │             │                            │                │    │
│  │             ▼                            ▼                │    │
│  │  ┌──────────────────────────────────────────────────┐    │    │
│  │  │              useConcurrentEdit                    │    │    │
│  │  │  - detectConflict(localVersion, serverVersion)   │    │    │
│  │  │  - resolveConflict(strategy)                     │    │    │
│  │  │  - strategies: theirs / yours / merge             │    │    │
│  │  └──────────────────────────────────────────────────┘    │    │
│  │                                                           │    │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐  │    │
│  │  │  LockIndicator.vue   │  │  ConflictResolver.vue     │  │    │
│  │  │  - 锁定者头像+姓名    │  │  - 并排 Diff 视图         │  │    │
│  │  │  - "正在编辑"徽章     │  │  - 选择：我的/对方/合并    │  │    │
│  │  │  - 锁状态图标         │  │  - 逐字段差异高亮         │  │    │
│  │  │  - 管理员强制解锁     │  │  - 确认后保存             │  │    │
│  │  └──────────────────────┘  └──────────────────────────┘  │    │
│  │                                                           │    │
│  │  ┌──────────────────────────────────────────────────┐    │    │
│  │  │          useLockWebSocket                        │    │    │
│  │  │  - 监听锁状态变更事件                              │    │    │
│  │  │  - lock_acquired / lock_released / lock_expired  │    │    │
│  │  │  - 实时更新 LockIndicator                        │    │    │
│  │  └──────────────────────────────────────────────────┘    │    │
│  │                                                           │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 四、具体改动

### 4.1 锁定状态类型定义

**文件：** `src/types/lock.ts`（新增）

```typescript
// 锁定状态
interface LockStatus {
  entityType: string;          // 实体类型：project, issue, document, bug
  entityId: string;            // 实体 ID
  locked: boolean;             // 是否已锁定
  lockedBy?: {
    userId: string;
    userName: string;
    avatar?: string;
  };
  lockedAt?: string;           // ISO 时间戳
  expiresAt?: string;          // ISO 时间戳
  version: number;             // 实体当前版本号
}

// 锁获取请求
interface AcquireLockRequest {
  entityType: string;
  entityId: string;
}

// 锁获取响应
interface AcquireLockResponse {
  success: boolean;
  lockId?: string;
  version: number;
  reason?: string;             // 获取失败原因：already_locked, entity_not_found
  lockedBy?: {
    userId: string;
    userName: string;
  };
}

// 锁释放请求
interface ReleaseLockRequest {
  lockId: string;
}

// 冲突信息
interface ConflictInfo {
  localVersion: number;
  serverVersion: number;
  localData: Record<string, any>;
  serverData: Record<string, any>;
  conflictingFields: string[]; // 冲突的字段列表
}

// 冲突解决策略
type ConflictStrategy = 'theirs' | 'yours' | 'merge';

// 冲突解决请求
interface ResolveConflictRequest {
  entityType: string;
  entityId: string;
  baseVersion: number;         // 本地基于的版本
  strategy: ConflictStrategy;
  mergedData?: Record<string, any>; // merge 策略时提供
}

// WebSocket 锁事件
interface LockEvent {
  type: 'lock_acquired' | 'lock_released' | 'lock_expired' | 'lock_force_released';
  entityType: string;
  entityId: string;
  userId?: string;
  userName?: string;
  timestamp: string;
}
```

### 4.2 锁定 API 客户端

**文件：** `src/api/lock.ts`（新增）

```typescript
import { RequestHttp } from '@/api/request';
import type {
  AcquireLockRequest,
  AcquireLockResponse,
  ReleaseLockRequest,
  LockStatus,
  ResolveConflictRequest,
} from '@/types/lock';

const http = RequestHttp.getInstance();

export const lockApi = {
  // 获取编辑锁
  async acquireLock(params: AcquireLockRequest): Promise<AcquireLockResponse> {
    return http.post({
      module_name: 'services.lock.lock_service',
      method_name: 'acquire_lock',
      parameters: params,
    });
  },

  // 释放编辑锁
  async releaseLock(params: ReleaseLockRequest): Promise<void> {
    return http.post({
      module_name: 'services.lock.lock_service',
      method_name: 'release_lock',
      parameters: params,
    });
  },

  // 续期锁（心跳）
  async heartbeat(lockId: string): Promise<void> {
    return http.post({
      module_name: 'services.lock.lock_service',
      method_name: 'heartbeat',
      parameters: { lock_id: lockId },
    });
  },

  // 查询锁状态
  async getLockStatus(entityType: string, entityId: string): Promise<LockStatus> {
    return http.post({
      module_name: 'services.lock.lock_service',
      method_name: 'get_lock_status',
      parameters: { entity_type: entityType, entity_id: entityId },
    });
  },

  // 管理员强制释放锁
  async forceReleaseLock(entityType: string, entityId: string): Promise<void> {
    return http.post({
      module_name: 'services.lock.lock_service',
      method_name: 'force_release_lock',
      parameters: { entity_type: entityType, entity_id: entityId },
    });
  },

  // 解决冲突并保存
  async resolveConflict(params: ResolveConflictRequest): Promise<void> {
    return http.post({
      module_name: 'services.lock.lock_service',
      method_name: 'resolve_conflict',
      parameters: params,
    });
  },
};
```

### 4.3 useEditLock Composable

**文件：** `src/composables/useEditLock.ts`（新增）

```typescript
import { ref, readonly, onUnmounted } from 'vue';
import { lockApi } from '@/api/lock';
import type { LockStatus } from '@/types/lock';

export function useEditLock(entityType: string, entityId: string) {
  const lockStatus = ref<LockStatus>({
    entityType,
    entityId,
    locked: false,
    version: 0,
  });

  const isLockedByMe = ref(false);
  const isLockedByOther = ref(false);
  const isReadOnly = ref(false);
  const lockId = ref<string | null>(null);
  const error = ref<string | null>(null);

  // 获取编辑锁
  async function acquireLock(): Promise<boolean> {
    try {
      error.value = null;
      const res = await lockApi.acquireLock({ entityType, entityId });

      if (res.success) {
        lockId.value = res.lockId!;
        lockStatus.value.locked = true;
        lockStatus.value.version = res.version;
        lockStatus.value.lockedBy = {
          userId: '', // 从当前用户信息获取
          userName: '', // 从当前用户信息获取
        };
        isLockedByMe.value = true;
        isLockedByOther.value = false;
        isReadOnly.value = false;
        return true;
      } else {
        // 获取失败：已被他人锁定
        if (res.reason === 'already_locked' && res.lockedBy) {
          lockStatus.value.locked = true;
          lockStatus.value.lockedBy = res.lockedBy;
          isLockedByMe.value = false;
          isLockedByOther.value = true;
          isReadOnly.value = true;
        }
        return false;
      }
    } catch (e) {
      error.value = '获取编辑锁失败';
      console.error('[EditLock] Failed to acquire lock:', e);
      return false;
    }
  }

  // 释放编辑锁
  async function releaseLock(): Promise<void> {
    if (!lockId.value) return;
    try {
      await lockApi.releaseLock({ lockId: lockId.value });
      resetState();
    } catch (e) {
      console.error('[EditLock] Failed to release lock:', e);
    }
  }

  // 检查锁状态
  async function checkStatus(): Promise<void> {
    try {
      const status = await lockApi.getLockStatus(entityType, entityId);
      lockStatus.value = status;
      isLockedByMe.value = status.lockedBy?.userId === ''; // 比较当前用户 ID
      isLockedByOther.value = status.locked && !isLockedByMe.value;
      isReadOnly.value = isLockedByOther.value;
    } catch (e) {
      console.error('[EditLock] Failed to check lock status:', e);
    }
  }

  function resetState(): void {
    lockId.value = null;
    lockStatus.value.locked = false;
    lockStatus.value.lockedBy = undefined;
    isLockedByMe.value = false;
    isLockedByOther.value = false;
    isReadOnly.value = false;
  }

  // 组件卸载时释放锁
  onUnmounted(() => {
    if (lockId.value) {
      releaseLock();
    }
  });

  return {
    lockStatus: readonly(lockStatus),
    isLockedByMe: readonly(isLockedByMe),
    isLockedByOther: readonly(isLockedByOther),
    isReadOnly: readonly(isReadOnly),
    error: readonly(error),
    acquireLock,
    releaseLock,
    checkStatus,
  };
}
```

### 4.4 锁心跳 Hook

**文件：** `src/composables/useLockHeartbeat.ts`（新增）

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { lockApi } from '@/api/lock';

const HEARTBEAT_INTERVAL = 60_000; // 60 秒
const USER_ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export function useLockHeartbeat(lockId: string | null) {
  const isActive = ref(false);
  const lastActivity = ref(Date.now());
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  function onUserActivity() {
    lastActivity.value = Date.now();
  }

  function startHeartbeat() {
    if (!lockId) return;

    heartbeatTimer = setInterval(async () => {
      // 仅在用户活跃时发送心跳（5 分钟内有操作）
      const idleTime = Date.now() - lastActivity.value;
      if (idleTime < 5 * 60_000) {
        try {
          await lockApi.heartbeat(lockId!);
          isActive.value = true;
        } catch (e) {
          console.error('[LockHeartbeat] Failed:', e);
          isActive.value = false;
        }
      }
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    isActive.value = false;
  }

  onMounted(() => {
    USER_ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, onUserActivity, { passive: true });
    });
    startHeartbeat();
  });

  onUnmounted(() => {
    USER_ACTIVITY_EVENTS.forEach((event) => {
      document.removeEventListener(event, onUserActivity);
    });
    stopHeartbeat();
  });

  return { isActive };
}
```

### 4.5 并发编辑检测 Hook

**文件：** `src/composables/useConcurrentEdit.ts`（新增）

```typescript
import { ref, readonly } from 'vue';
import { lockApi } from '@/api/lock';
import type { ConflictInfo, ConflictStrategy } from '@/types/lock';

export function useConcurrentEdit() {
  const conflict = ref<ConflictInfo | null>(null);
  const isResolving = ref(false);

  // 检测冲突
  async function detectConflict(
    localVersion: number,
    localData: Record<string, any>,
    entityType: string,
    entityId: string
  ): Promise<boolean> {
    const status = await lockApi.getLockStatus(entityType, entityId);

    if (status.version > localVersion) {
      // 服务器版本更新，发生了冲突
      conflict.value = {
        localVersion,
        serverVersion: status.version,
        localData,
        serverData: {}, // 需要从后端获取服务器当前数据
        conflictingFields: [], // 后端返回冲突字段
      };
      return true;
    }

    return false;
  }

  // 解决冲突
  async function resolveConflict(
    strategy: ConflictStrategy,
    entityType: string,
    entityId: string,
    mergedData?: Record<string, any>
  ): Promise<void> {
    if (!conflict.value) return;

    isResolving.value = true;
    try {
      await lockApi.resolveConflict({
        entityType,
        entityId,
        baseVersion: conflict.value.localVersion,
        strategy,
        mergedData,
      });
      conflict.value = null;
    } catch (e) {
      console.error('[ConcurrentEdit] Failed to resolve conflict:', e);
      throw e;
    } finally {
      isResolving.value = false;
    }
  }

  function clearConflict(): void {
    conflict.value = null;
  }

  return {
    conflict: readonly(conflict),
    isResolving: readonly(isResolving),
    detectConflict,
    resolveConflict,
    clearConflict,
  };
}
```

### 4.6 LockIndicator 锁定指示器组件

**文件：** `src/components/lock/LockIndicator.vue`（新增）

核心功能：
- 在实体详情页顶部显示锁定状态
- 自己被锁定："正在编辑"绿色徽章，显示用户头像
- 被他人锁定：显示锁定者头像 + 姓名 + "正在编辑"红色徽章，页面进入只读模式
- 未锁定：显示"点击编辑以获取锁"提示
- 管理员可点击"强制解锁"按钮（需确认，记录审计日志）
- 锁定超时倒计时显示（距锁过期还有 X 分钟）

### 4.7 ConflictResolver 冲突解决组件

**文件：** `src/components/lock/ConflictResolver.vue`（新增）

核心功能：
- 模态对话框，并排显示两个版本
- 左侧："我的版本 (Your Version)" -- 用户当前编辑的内容
- 右侧："对方的版本 (Server Version)" -- 服务器当前保存的内容
- 差异字段高亮显示（黄色背景）
- 三个操作按钮：
  - "采用我的版本" -- 覆盖服务器版本
  - "采用对方的版本" -- 放弃本地修改
  - "手动合并" -- 展开逐字段选择界面，每个冲突字段可选择保留本地或服务器版本
- 合并结果预览
- 确认后保存

### 4.8 WebSocket 锁定状态监听

**文件：** `src/composables/useLockWebSocket.ts`（新增）

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import type { LockEvent } from '@/types/lock';

export function useLockWebSocket(entityType: string, entityId: string) {
  const lastEvent = ref<LockEvent | null>(null);
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const reconnectDelay = ref(1000); // 重连延迟，指数退避

  function connect() {
    const wsUrl = `${import.meta.env.VITE_WS_BASE || 'ws://localhost:10086'}/ws/locks`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      reconnectDelay.value = 1000;
      // 订阅实体锁状态
      ws!.send(JSON.stringify({
        action: 'subscribe',
        entity_type: entityType,
        entity_id: entityId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const lockEvent: LockEvent = JSON.parse(event.data);
        if (
          lockEvent.entityType === entityType &&
          lockEvent.entityId === entityId
        ) {
          lastEvent.value = lockEvent;
        }
      } catch (e) {
        console.warn('[LockWS] Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      // 指数退避重连
      reconnectTimer = setTimeout(() => {
        reconnectDelay.value = Math.min(reconnectDelay.value * 2, 30000);
        connect();
      }, reconnectDelay.value);
    };

    ws.onerror = (e) => {
      console.error('[LockWS] WebSocket error:', e);
    };
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  onMounted(() => connect());
  onUnmounted(() => disconnect());

  return { lastEvent };
}
```

---

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义锁定状态类型接口 | `types/lock.ts` | TypeScript 类型检查通过 | 0.03 |
| 2 | 实现锁定 API 客户端 | `api/lock.ts` | 6 个 API 方法定义完整 | 0.03 |
| 3 | 实现 useEditLock Composable | `useEditLock.ts` | 获取/释放锁、状态检查正常 | 0.08 |
| 4 | 实现锁心跳 Hook | `useLockHeartbeat.ts` | 60s 心跳、5min 超时逻辑正常 | 0.06 |
| 5 | 实现并发编辑检测 Hook | `useConcurrentEdit.ts` | 冲突检测、3 种解决策略正常 | 0.06 |
| 6 | 实现 LockIndicator 组件 | `LockIndicator.vue` | 3 种状态正确渲染 | 0.06 |
| 7 | 实现 ConflictResolver 组件 | `ConflictResolver.vue` | 并排 Diff 视图、合并选择正常 | 0.08 |
| 8 | 实现 LockStatusBadge 组件 | `LockStatusBadge.vue` | 徽章样式和状态正确 | 0.02 |
| 9 | 实现 WebSocket 锁定状态监听 | `useLockWebSocket.ts` | 锁状态变更实时推送 | 0.04 |
| 10 | 详情页集成锁定功能 | 修改详情页组件 | 进入编辑模式时获取锁，离开时释放 | 0.02 |
| 11 | 组件测试 + 端到端验证 | 测试文件 | 6 个测试场景通过 | 0.02 |

**总计：** 0.5d

---

## 六、测试规格

### Scenario 1: 获取编辑锁
- **GIVEN** 用户 A 打开项目"Platform"的详情页，当前无人编辑
- **WHEN** 用户 A 点击"编辑"按钮进入编辑模式
- **THEN** 页面顶部显示"正在编辑"绿色徽章（含用户 A 头像），其他用户看到"用户 A 正在编辑"红色徽章，页面进入只读模式

### Scenario 2: 编辑锁被他人持有
- **GIVEN** 用户 A 正在编辑项目"Platform"，持有编辑锁
- **WHEN** 用户 B 打开同一项目详情页并点击"编辑"
- **THEN** 页面显示"用户 A 正在编辑，当前为只读模式"，编辑按钮禁用或显示为"只读"，用户 B 无法编辑

### Scenario 3: 锁超时自动释放
- **GIVEN** 用户 A 获取了编辑锁，但已离开电脑（无键盘/鼠标操作）超过 5 分钟
- **WHEN** 用户 B 打开同一项目详情页
- **THEN** 锁已自动释放，用户 B 可正常获取锁并编辑

### Scenario 4: 并发编辑冲突检测
- **GIVEN** 用户 A 基于版本 3 编辑项目详情，期间用户 B 已保存版本 4
- **WHEN** 用户 A 点击"保存"
- **THEN** 弹出冲突解决对话框，并排显示用户 A 的版本 3 修改和用户 B 的版本 4 修改，差异字段黄色高亮

### Scenario 5: 冲突解决 -- 采用对方版本
- **GIVEN** 冲突解决对话框已打开，显示"我的版本"和"对方的版本"
- **WHEN** 用户点击"采用对方的版本"
- **THEN** 本地编辑内容被放弃，页面显示用户 B 保存的版本 4 内容，编辑锁释放

### Scenario 6: 管理员强制解锁
- **GIVEN** 用户 A 持有锁已 30 分钟（异常），用户 B 是管理员
- **WHEN** 管理员用户 B 点击 LockIndicator 上的"强制解锁"按钮并确认
- **THEN** 用户 A 的锁被释放，用户 B 可获取锁进行编辑；操作记录在审计日志中

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| 锁未正确释放（浏览器崩溃） | 中 | 中 | 中 | 5 分钟超时自动释放 + 心跳机制 | 管理员手动强制解锁 |
| 网络断开导致心跳失败 | 中 | 中 | 中 | 心跳失败时不立即释放锁，连续 3 次心跳失败后才释放 | 网络恢复后自动重新获取锁 |
| 版本号冲突解决后仍需手动合并 | 低 | 低 | 低 | 合并界面提供逐字段选择，降低手动合并负担 | 保存冲突数据到草稿，后续处理 |
| WebSocket 连接不稳定 | 中 | 低 | 低 | 指数退避重连 + 降级为轮询（每 30 秒检查锁状态） | 完全降级为定时轮询模式 |
| 后端锁 API 未就绪 | 中 | 高 | 高 | 前端锁定功能通过 feature flag 控制，后端未就绪时不启用 | 前端回退为乐观锁模式（仅版本号校验） |

---

## 八、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 锁定功能导致页面无法编辑 | 通过 feature flag 禁用锁定功能，恢复自由编辑模式 | 所有详情页 | < 2min |
| 锁 API 接口异常 | 前端降级为乐观锁模式，仅校验版本号 | 编辑锁定 | < 5min |
| 冲突解决组件异常 | 隐藏冲突解决对话框，使用"最后写入者胜出"模式 | 冲突解决 | < 3min |
| WebSocket 连接导致页面卡顿 | 断开 WebSocket，降级为定时轮询 | 实时状态 | < 1min |

**回滚验证：**
- 回滚后编辑功能正常，无锁定提示
- 回滚后保存操作正常，无版本号校验
- 回滚后无 console 错误
- 回滚后 `pnpm build` 构建成功

---

## 九、设计决策记录

### D-01: 混合策略（乐观锁 + 悲观锁）

**背景：** 纯乐观锁在冲突时需要用户手动解决，体验差；纯悲观锁在用户不活跃时浪费锁资源。
**决策：** 默认使用乐观锁（版本号），进入编辑模式时自动获取悲观锁（编辑锁）。悲观锁有 5 分钟超时，心跳续期。
**权衡：** 实现复杂度较高，但提供了最佳的用户体验：编辑时无冲突，仅在异常情况下触发冲突解决。
**后果：** 需要后端提供完整的 lock API 端点（acquire/release/heartbeat/status/force-release），增加了后端开发工作量。

### D-02: 锁超时设为 5 分钟

**背景：** 锁超时时间需要平衡用户体验（不希望锁频繁过期）和资源利用（不希望锁被僵尸用户长期持有）。
**决策：** 5 分钟超时，60 秒心跳间隔。
**权衡：** 5 分钟足够用户完成一次编辑操作，同时不会因为用户离开而长时间锁定资源。
**后果：** 如果用户编辑时间超过 5 分钟且期间无键盘/鼠标操作（如阅读长文档），锁可能超时。需要在前端显示倒计时提示。

### D-03: 使用 WebSocket 实现实时锁状态

**背景：** 轮询方式获取锁状态有延迟，用户可能看到过期的锁状态。
**决策：** 使用 WebSocket 实时推送锁状态变更事件。
**权衡：** 增加了 WebSocket 基础设施的复杂度，但显著提升了用户体验（锁状态变更实时可见）。
**后果：** 需要后端提供 WebSocket 端点。如果 WebSocket 不可用，前端降级为 30 秒轮询。

### D-04: 管理员强制解锁需审计日志

**背景：** 管理员强制解锁是敏感操作，需要追溯。
**决策：** 强制解锁时在后端记录审计日志：操作人、操作时间、被解锁的实体、被解锁的用户。
**权衡：** 增加了后端存储和查询审计日志的复杂度。
**后果：** 需要在管理后台提供审计日志查看页面（后续需求）。

---

## 十、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| 锁获取成功率 | API 响应统计 | < 95% | 锁获取失败率过高，可能锁服务异常 |
| 锁冲突率 | 获取失败原因统计 | > 20% | 同一实体同时被多人编辑的比例 |
| 并发编辑冲突率 | 保存时冲突检测统计 | > 10% | 保存时发现版本冲突的比例 |
| 锁平均持有时间 | 锁获取/释放时间差 | > 10min | 用户编辑时间过长，可能需要优化表单 |
| 锁超时次数 | 超时释放事件统计 | > 5 次/天 | 心跳机制可能有问题 |
| 强制解锁次数 | 审计日志统计 | > 2 次/周 | 管理员是否有滥用强制解锁 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `INFO` | 锁获取/释放 | `[Lock] Acquired: entity=project:PL, user=陈铭` |
| `WARN` | 锁冲突 | `[Lock] Conflict: entity=project:PL, user=陈铭, existing=李四` |
| `WARN` | 锁超时 | `[Lock] Expired: entity=project:PL, user=陈铭, idle=5min` |
| `ERROR` | 锁操作失败 | `[Lock] Failed to acquire: entity=project:PL, reason=service_unavailable` |

---

## 十一、代码审查检查清单

- [ ] `types/lock.ts` 中 LockStatus、ConflictInfo、LockEvent 等类型定义完整
- [ ] `api/lock.ts` 中 6 个 API 方法（acquire/release/heartbeat/status/forceRelease/resolveConflict）定义正确
- [ ] `useEditLock.ts` 中 acquire/release/checkStatus 逻辑正确，onUnmounted 释放锁
- [ ] `useLockHeartbeat.ts` 中 60s 心跳 + 5min 超时 + 用户活跃检测逻辑正确
- [ ] `useConcurrentEdit.ts` 中冲突检测（版本号比较）和 3 种解决策略逻辑正确
- [ ] `LockIndicator.vue` 中 3 种状态（我的锁/他人锁/未锁定）正确渲染
- [ ] `ConflictResolver.vue` 中并排 Diff 视图、差异高亮、合并选择功能正常
- [ ] `useLockWebSocket.ts` 中 WebSocket 连接、重连、事件处理逻辑正确
- [ ] 详情页集成锁定功能：进入编辑获取锁，离开/取消释放锁
- [ ] Feature flag 控制锁定功能启用/禁用
- [ ] WebSocket 不可用时降级为定时轮询
- [ ] `vue-tsc --noEmit` 类型检查通过

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 锁未释放导致实体永久锁定 | 用户关闭浏览器标签页但未触发 onUnmounted | `beforeunload` 事件中未发送释放锁请求 | 监听 `beforeunload` 事件，使用 `navigator.sendBeacon()` 发送释放请求 |
| 2 | 同一用户多标签页编辑同一实体 | 用户在标签页 A 和标签页 B 同时编辑同一项目 | 两个标签页各自持有锁（后端允许同一用户） | 后端检查同一用户是否已有锁，前端检测到多标签页时提示 |
| 3 | 版本号溢出或回绕 | 频繁编辑导致版本号增加到极大值 | 版本号使用 Number 类型，超出安全整数范围 | 使用 BigInt 或定期重置版本号（如按年归档） |
| 4 | 心跳因浏览器节流而延迟 | 标签页在后台时，setInterval 被浏览器节流至 1 分钟以上 | 浏览器对后台标签页的定时器节流策略 | 使用 Web Worker 发送心跳，不受主线程节流限制 |
| 5 | 冲突解决时数据已再次变更 | 用户在冲突解决对话框中查看差异时，数据又被第三方修改 | 冲突解决时间窗口内数据再次变更 | 提交冲突解决时再次校验版本号，不匹配则重新检测冲突 |
| 6 | WebSocket 消息积压导致状态不同步 | 网络断开后恢复，积压消息一次性处理导致状态跳跃 | 重连后未处理积压消息的顺序 | 重连后先获取全量锁状态，再处理增量事件 |

---

## 性能分析

### 锁操作性能

| 操作 | 耗时 | 说明 |
|------|------|------|
| 获取锁 | < 100ms | API 请求 + MongoDB 写入 |
| 释放锁 | < 80ms | API 请求 + MongoDB 删除 |
| 心跳续期 | < 50ms | API 请求 + MongoDB 更新 |
| 查询锁状态 | < 60ms | API 请求 + MongoDB 查询 |
| 冲突检测 | < 100ms | 获取服务器版本 + 字段 diff |

### WebSocket 性能

| 指标 | 值 | 说明 |
|------|-----|------|
| 连接建立 | < 200ms | WebSocket 握手 |
| 消息延迟 | < 50ms | 锁事件推送 |
| 重连间隔 | 1s / 2s / 4s / 8s / 16s / 30s (max) | 指数退避 |
| 心跳消息频率 | 每 60s 一次 | 仅在用户活跃时 |

### 前端内存占用

| 组件实例 | 内存占用 | 说明 |
|---------|---------|------|
| useEditLock | ~2KB | 状态 + 事件监听 |
| useLockHeartbeat | ~1KB | 定时器 + 事件监听 |
| useConcurrentEdit | ~2KB | 冲突数据 |
| LockIndicator | ~3KB | 组件渲染 |
| ConflictResolver | ~8KB | 组件渲染 + Diff 数据 |
| useLockWebSocket | ~2KB | WebSocket 连接 |

---

