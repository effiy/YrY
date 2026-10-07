---
prd_task_id: "YV-09-133"
title: "YV-09-133: 安全事件日志 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "63-prd-安全事件日志.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 安全事件日志]
roles: [engineer]
benefit: "开发方案：task-安全事件日志"
lifecycle: active
---

# YV-09-133: 安全事件日志 — 开发方案

> 需求编号：YV-09-133 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `SecurityLog.vue` | 安全事件日志页面（ProTable + 筛选） | `src/views/system/` |
| `SecurityEventDetail.vue` | 安全事件详情（IP/UA/时间/结果） | `src/components/security/` |
| `securityStore.ts` | 安全事件状态管理 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

记录安全相关事件：登录失败/密码修改/权限变更/异常 IP。

### 架构方案

**技术路线**：系统管理子页面 `/system/security-log`。数据由 YiAi 审计服务自动记录（各安全操作触发 `security_log.insert_one`），前端 ProTable 只读展示 + 筛选 + 详情查看。严重度标签着色（ERROR→红色，WARN→橙色，INFO→蓝色）。

**数据模型**：
```typescript
interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  user_id: string;
  ip: string;
  user_agent: string;
  details: string;          // 事件描述
  metadata: Record<string, unknown>; // 扩展信息（旧密码hash/新IP等）
  created_at: string;
}

type SecurityEventType = 
  | 'login.failed' | 'login.success' | 'login.suspicious'
  | 'password.changed' | 'password.reset'
  | 'permission.changed' | 'role.assigned' | 'role.revoked'
  | 'twofactor.enabled' | 'twofactor.disabled'
  | 'session.revoked' | 'account.deletion_requested';
```

**组件树**：
```
SecurityLog.vue (页面容器)
├── FilterBar.vue (el-select: 事件类型 + 严重度 + 时间范围)
├── ProTable (安全事件列表)
│   ├── 列: Time | Event Type | Severity (el-tag 颜色) | User | IP | Details | Actions
│   └── 排序: 默认按时间倒序
└── SecurityEventDetail.vue (el-drawer: 完整事件详情)
    ├── 事件元数据（IP/UA/时间/用户）
    ├── Details 全文
    └── Metadata JSON 展示
```

**数据流**：
```
页面加载 → securityStore.fetchEvents({ filter, page, pageSize })
  → YiAi data_service.query_documents("security_events", { filter, sort: { created_at: -1 } })
  → 渲染 ProTable

筛选变更 → watch(filter) → debounce 300ms → securityStore.fetchEvents(newFilter)
  → ProTable 刷新

点击详情 → SecurityEventDetail.vue 打开 el-drawer
  → 展示完整 metadata（JSON 格式化显示）
```

**关键决策**：
- 数据存储：MongoDB `security_events` 集合，由 YiAi 审计中间件自动写入（各 service 调用 `audit_log()` 辅助函数）
- 保留周期：90 天（MongoDB TTL 索引: `{ created_at: 1, expireAfterSeconds: 7776000 }`）
- 高危事件通知：CRITICAL 级别事件（如连续登录失败 10 次、管理员权限变更）触发 `ElNotification` + 邮件通知
- 严重度颜色映射：CRITICAL→红色(#F56C6C)、ERROR→红色、WARN→橙色(#E6A23C)、INFO→蓝色(#409EFF)
- 筛选器：事件类型多选 + 严重度多选 + 时间范围（今天/7天/30天/自定义）
- 只读展示：前端不提供编辑/删除功能，数据完全由后端审计服务管理

### 事件类型

| 事件 | 级别 | 触发条件 |
|------|------|---------|
| 登录失败 (5次) | WARN | 同一 IP 5 分钟内连续失败 |
| 登录失败 (10次) | CRITICAL | 同一 IP 10 分钟内连续失败 → 临时封禁 |
| 密码修改 | INFO | 用户主动修改密码 |
| 权限变更 | WARN | 管理员修改角色权限 |
| 异常 IP 登录 | ERROR | 新 IP + 新设备首次登录 |
| 两步验证更改 | INFO | TOTP 启用/禁用 |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | SecurityLog ProTable + 严重度标签着色 | 列表渲染 + 颜色映射 | 0.10 |
| 2 | 筛选器（事件类型+严重度+时间范围） | 筛选交互 + API 参数 | 0.06 |
| 3 | SecurityEventDetail el-drawer | 详情展示 + metadata JSON | 0.05 |
| 4 | 分页 + 时间倒序排列 | 分页器 + 排序 | 0.04 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] ProTable 列表：时间/事件类型/严重度(着色)/用户/IP/详情 正确渲染
- [ ] 严重度颜色映射：CRITICAL/ERROR→红, WARN→橙, INFO→蓝
- [ ] 筛选器：事件类型多选 + 严重度多选 + 时间范围
- [ ] SecurityEventDetail drawer：完整详情 + metadata JSON
- [ ] 分页 + 按时间倒序排列
- [ ] 90 天 TTL 索引（后端 MongoDB 配置）
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口
| — | 无 | — | — |

### 技术债
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出
| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | SecurityLog.vue |
| 组件 | 1 | SecurityEventDetail.vue |
| Store | 1 | securityStore |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单
- [x] ProTable + 严重度颜色映射
- [x] 筛选器（类型+严重度+时间）
- [x] SecurityEventDetail drawer
- [x] 分页 + 时间倒序
- [x] 90 天 TTL 索引配置
- [x] 只读（无编辑/删除按钮）
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过