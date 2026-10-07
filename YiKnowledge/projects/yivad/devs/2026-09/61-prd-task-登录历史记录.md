---
prd_task_id: "YV-09-131"
title: "YV-09-131: 登录历史记录 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "61-prd-登录历史记录.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 登录历史记录]
roles: [engineer]
benefit: "开发方案：task-登录历史记录"
lifecycle: active
---

# YV-09-131: 登录历史记录 — 开发方案

> 需求编号：YV-09-131 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `LoginHistory.vue` | 登录历史页面（ProTable） | `src/views/settings/` |
| `LoginAlert.vue` | 异常登录告警组件 | `src/components/security/` |
| `authStore.ts` | 登录历史相关操作 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可查看登录历史：时间/IP/设备/状态（成功/失败）。

### 架构方案

**技术路线**：安全设置子页面 Tab。ProTable 展示登录历史，每行显示时间/IP/设备/状态/位置。数据由 YiAi 认证服务自动记录（每次登录写入 `login_history` 集合）。异常登录（新IP+新设备）自动标记并高亮显示。

**数据模型**：
```typescript
interface LoginRecord {
  id: string;
  user_id: string;
  ip: string;
  user_agent: string;
  device: string;       // UserAgent 解析结果
  location: string;     // IP 地理位置
  status: 'success' | 'failed';
  fail_reason?: string; // 'wrong_password' | 'account_locked' | 'totp_invalid'
  is_suspicious: boolean; // 新IP+新设备 → true
  created_at: string;
}
```

**组件树**：
```
LoginHistory.vue (ProTable)
├── FilterBar.vue (el-select: 全部/成功/失败 + 时间范围)
├── ProTable
│   ├── 列: Time | IP | Device | Location | Status (el-tag) | Alert
│   ├── 状态标签: 成功→绿色, 失败→红色
│   └── 异常标记: is_suspicious → 黄色警告图标 + tooltip
└── LoginAlert.vue (异常登录提示横幅)
    └── "检测到来自新设备的登录 (IP: xxx, 地点: xxx)" + [确认是我] [不是我的账号] 按钮
```

**数据流**：
```
页面加载 → authStore.fetchLoginHistory({ page, pageSize })
  → YiAi data_service.query_documents("login_history", { 
      filter: { user_id: currentUser.id },
      sort: { created_at: -1 }
    })
  → 渲染 ProTable

异常检测（YiAi 后端认证中间件）:
  每次登录 → 检查 IP + UserAgent 是否在历史记录中出现过
  → 新设备 → 标记 is_suspicious: true
  → 前端展示黄色警告图标
  → LoginAlert 横幅提示（仅在页面顶部展示一次）
```

**关键决策**：
- 数据存储：MongoDB `login_history` 集合，由 YiAi 认证中间件自动写入
- 异常检测：同一 user_id 的登录记录中，对比 IP + UserAgent 哈希，不匹配则标记 suspicious
- 前端只读：不提供删除/修改功能
- 保留周期：90 天（MongoDB TTL 索引），与 security_events 一致
- 登录失败展示：失败时显示 fail_reason（密码错误/账号锁定/TOTP 无效）
- UserAgent 解析：复用 `ua-parser-js`（与 SessionList 共享解析逻辑，提取为 `parseUserAgent` 工具函数）

### 日志字段

| 字段 | 说明 | 示例 |
|------|------|------|
| 时间 | 登录时间 | 2026-09-15 14:30 |
| IP | 登录 IP | 192.168.1.1 |
| 设备 | UserAgent 解析 | "Chrome 120 / macOS" |
| 状态 | 成功 / 失败 | el-tag: success→绿, failed→红 |
| 位置 | IP 地理位置（可选） | "Beijing, CN" |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | LoginHistory ProTable + 筛选 | 列表 + 状态过滤 + 分页 | 0.10 |
| 2 | 异常登录标记（is_suspicious 高亮） | 黄色警告图标 + tooltip | 0.06 |
| 3 | LoginAlert 横幅（确认/否认按钮） | 异常提示 + 交互 | 0.05 |
| 4 | parseUserAgent 工具函数提取 | 复用 SessionList 解析逻辑 | 0.04 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] ProTable 列表：时间/IP/设备/位置/状态 正确渲染
- [ ] 状态标签着色：成功→绿, 失败→红
- [ ] 异常登录标记（is_suspicious）黄色警告图标 + tooltip
- [ ] LoginAlert 横幅：异常检测 → 提示 → 确认/否认
- [ ] 筛选器：全部/成功/失败 + 时间范围
- [ ] parseUserAgent 提取为共享工具函数
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
| 页面 | 1 | LoginHistory.vue |
| 组件 | 1 | LoginAlert.vue |
| Store | 1 | authStore (登录历史) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单
- [x] ProTable + 状态标签着色
- [x] 异常登录标记 + 黄色警告
- [x] LoginAlert 横幅交互
- [x] 筛选器（全部/成功/失败 + 时间）
- [x] parseUserAgent 共享工具函数
- [x] 90 天 TTL 索引
- [x] 只读（无编辑/删除）
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过