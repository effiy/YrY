---
title: 活动日志与审计追踪
tags:
- 活动日志
- 审计追踪
- ActivityLog
- 合规
- 数据导出
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202609"
prd_task_id: YV-09-50
estimate_frontend: 0.5
review_status: 待评审
issue_type: 功能
roles:
- engineer
- qa
source_okr: [yivad-003]
---

# 活动日志与审计追踪

> 需求编号：YV-09-50 · 优先级：P2 · 人天：0.5d
> 依赖：YiAi 审计服务（`services.audit.audit_service`）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| 活动日志列表页面 | 新增 | `src/views/audit/ActivityLog.vue` |
| 活动详情抽屉 | 新增 | `src/views/audit/ActivityDetail.vue` |
| 活动时间线组件 | 新增 | `src/components/audit/ActivityTimeline.vue` |
| 活动过滤器组件 | 新增 | `src/components/audit/ActivityFilter.vue` |
| 变更差异对比组件 | 新增 | `src/components/audit/DiffViewer.vue` |
| 活动日志 Composable | 新增 | `src/composables/useActivityLog.ts` |
| 活动日志类型定义 | 新增 | `src/types/activity.ts` |
| 活动日志 API 服务 | 新增 | `src/services/activity.service.ts` |
| 仪表盘活动 Feed 组件 | 新增 | `src/components/dashboard/ActivityFeed.vue` |
| 实体详情页活动时间线集成 | 修改 | 各实体详情页面添加活动时间线 |
| 路由配置 | 修改 | `src/router/` 添加审计路由 |

## 涉及文件

```
YiVad/
└── src/
    ├── views/
    │   └── audit/
    │       ├── ActivityLog.vue                  # 新增：活动日志列表页
    │       └── ActivityDetail.vue               # 新增：活动详情抽屉
    ├── components/
    │   ├── audit/
    │   │   ├── ActivityTimeline.vue             # 新增：活动时间线组件
    │   │   ├── ActivityFilter.vue               # 新增：活动过滤器组件
    │   │   └── DiffViewer.vue                   # 新增：变更差异对比组件
    │   └── dashboard/
    │       └── ActivityFeed.vue                 # 新增：仪表盘活动 Feed
    ├── composables/
    │   └── useActivityLog.ts                    # 新增：活动日志 Composable
    ├── services/
    │   └── activity.service.ts                  # 新增：活动日志 API 服务
    ├── types/
    │   └── activity.ts                          # 新增：活动日志类型定义
    ├── router/
    │   └── index.ts                             # 修改：添加审计路由
    └── styles/
        └── audit.scss                           # 新增：审计页面样式
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-50 |
| 模块 | 审计与合规 |
| 优先级 | **P2**（合规需求，非紧急但必要） |
| 前端人天 | 0.5d |
| 后端人天 | 0.5d（YiAi 审计服务） |
| 依赖 | YiAi `services.audit.audit_service` 提供活动日志查询接口 |

---

## 背景

YiVad 当前缺乏用户操作记录和审计追踪能力。管理员无法查看谁在什么时间做了什么操作，当发生误操作或安全事件时，无法追溯责任人和操作细节。对于企业级管理后台，活动日志是合规性（SOC 2、ISO 27001）的基本要求。

**核心问题：**

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **无操作追溯能力** -- 数据被误删或误改后无法追溯操作人 | **高** | 安全事件无法追责，合规风险 |
| 2 | **无变更历史对比** -- 无法查看记录被修改前后的差异 | **中** | 无法判断修改是否合理，恢复困难 |
| 3 | **无活动概览** -- 管理员无法快速了解系统近期活动情况 | **中** | 缺乏对系统使用情况的全局感知 |
| 4 | **无合规导出** -- 无法按合规要求导出操作日志 | **中** | 审计时无法提供操作记录证据 |
| 5 | **实体页面无操作历史** -- 单个项目详情页看不到谁改过什么 | **低** | 协作时缺乏上下文，不知道队友做了什么 |

## 一、现状分析

### 当前活动日志能力矩阵

| 场景 | 当前行为 | 期望行为 | 差距 |
|------|---------|---------|------|
| 数据被误删追溯 | 无法追溯，MongoDB 无操作日志 | 查看活动日志，定位删除操作人、时间、IP | 完全缺失 |
| 变更前后对比 | 无变更记录 | 通过 DiffViewer 查看 before/after 字段级差异 | 完全缺失 |
| 合规审计 | 无法提供操作记录 | 按时间范围、用户、操作类型导出 CSV/PDF | 完全缺失 |
| 管理员仪表盘 | 无活动概览 | 实时活动 Feed 展示最近操作 | 完全缺失 |
| 实体详情页操作历史 | 无操作时间线 | 实体详情页底部展示操作时间线 | 完全缺失 |
| 用户操作频率统计 | 无统计数据 | 按用户、操作类型统计操作频率 | 完全缺失 |

### 根因分析矩阵

| 缺失项 | 根因 | 影响链 |
|--------|------|--------|
| 活动日志记录 | YiAi 后端未实现审计中间件，未拦截 RPC 调用并记录操作 | 所有操作无痕，无法追溯 |
| 活动日志查询 | 未实现活动日志查询 API（筛选、分页、排序） | 前端无法展示活动日志 |
| 变更差异对比 | 未记录操作前后的数据快照 | 无法展示字段级变更差异 |
| 活动日志导出 | 未实现 CSV/PDF 导出功能 | 无法满足合规审计要求 |
| 实时活动 Feed | 未实现 WebSocket 或轮询机制推送活动事件 | 仪表盘无实时活动展示 |

---

## 二、设计决策

### 审计数据存储策略

| 维度 | MongoDB 活动日志集合 | 独立审计数据库 | 决策 |
|------|---------------------|---------------|------|
| 查询性能 | 单集合查询，索引优化后性能好 | 跨库查询延迟高 | **MongoDB 活动日志集合** |
| 运维复杂度 | 与现有基础设施一致，无额外运维 | 需要独立部署和维护 | **MongoDB 活动日志集合** |
| 数据隔离 | 与业务数据同库，需注意集合权限 | 天然隔离 | 通过集合级权限控制 |
| 成本 | 无额外成本 | 额外存储和计算成本 | **MongoDB 活动日志集合** |

**决策：** 在现有 MongoDB 中新建 `activity_logs` 集合，通过 TTL 索引实现 90 天自动过期，冷数据归档至文件存储。

### 活动日志记录时机

| 策略 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| RPC 中间件拦截 | 在 YiAi RPC 路由层统一拦截所有调用 | 覆盖面广，不遗漏 | 无法获取业务上下文 |
| Service 层显式记录 | 在各 Service 方法中显式调用 `audit_service.log()` | 业务上下文丰富 | 可能遗漏，依赖开发者 |
| 混合策略 | RPC 中间件记录基础信息 + Service 层补充业务上下文 | **兼顾覆盖面和上下文** | 需要协调两层数据 |

**决策：** 采用混合策略。RPC 中间件自动记录 `module_name`、`method_name`、`user_id`、`timestamp`、`ip_address`；Service 层通过 `audit_service.enrich()` 补充 `entity_type`、`entity_id`、`entity_name`、`action_type`、`before`、`after`。

### 活动类型分类

| 类型 | 用途 | 示例 |
|------|------|------|
| `create` | 创建操作 | 创建 Issue、创建项目、创建文档 |
| `update` | 更新操作 | 修改 Issue 标题、更新文档内容 |
| `delete` | 删除操作 | 删除文件、删除 Issue |
| `archive` | 归档操作 | 归档项目、归档 Issue |
| `restore` | 恢复操作 | 从归档恢复、从回收站恢复 |
| `comment` | 评论操作 | 添加评论、回复评论 |
| `assign` | 分配操作 | 分配 Issue 负责人 |
| `status_change` | 状态变更 | Issue 状态从"待处理"变为"进行中" |

---

## 三、目标架构

```
┌──────────────────────────────────────────────────────────────────┐
│                    Activity Log & Audit System                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    YiAi 后端 (审计层)                       │    │
│  │  ┌────────────────────┐  ┌────────────────────────────┐   │    │
│  │  │  RPC 审计中间件      │  │  audit_service             │   │    │
│  │  │  - 拦截所有 RPC 调用  │  │  - log(activity)           │   │    │
│  │  │  - 提取 user/ip      │  │  - query(filter)           │   │    │
│  │  │  - 记录基础操作信息    │  │  - enrich(id, context)     │   │    │
│  │  └────────┬───────────┘  │  - export(format, filter)   │   │    │
│  │           │               │  - get_timeline(entity_id)  │   │    │
│  │           ▼               │  - get_stats(time_range)    │   │    │
│  │  ┌────────────────────┐  └──────────────┬─────────────┘   │    │
│  │  │  activity_logs     │                 │                  │    │
│  │  │  MongoDB 集合        │◄────────────────┘                  │    │
│  │  │  - TTL 索引 90 天    │                                    │    │
│  │  │  - 复合索引筛选优化   │                                    │    │
│  │  └────────────────────┘                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    YiVad 前端 (展示层)                      │    │
│  │                                                             │    │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐   │    │
│  │  │  ActivityLog.vue  │  │  ActivityFeed.vue            │   │    │
│  │  │  - 活动日志列表    │  │  - 仪表盘实时活动 Feed        │   │    │
│  │  │  - 多维度筛选      │  │  - 最近 20 条操作            │   │    │
│  │  │  - 分页/排序       │  │  - 自动刷新 (30s 轮询)       │   │    │
│  │  │  - 导出 CSV/PDF   │  └──────────────────────────────┘   │    │
│  │  └────────┬─────────┘                                        │    │
│  │           │                                                   │    │
│  │           ▼                                                   │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │  ActivityDetail.vue (抽屉)                            │    │    │
│  │  │  - 操作详情 (用户/时间/IP/操作类型/实体)                 │    │    │
│  │  │  - DiffViewer: before/after 字段级差异对比             │    │    │
│  │  │  - 关联活动: 同一实体的前后操作                         │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                               │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │  ActivityTimeline.vue (实体详情页集成)                  │    │    │
│  │  │  - 时间线展示: 谁在什么时候做了什么                       │    │    │
│  │  │  - 按实体 ID 筛选活动日志                               │    │    │
│  │  │  - 支持展开查看变更详情                                  │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                               │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │  ActivityFilter.vue                                   │    │    │
│  │  │  - 用户筛选 (Select 下拉)                              │    │    │
│  │  │  - 操作类型筛选 (多选 Checkbox)                         │    │    │
│  │  │  - 实体类型筛选 (Select 下拉)                           │    │    │
│  │  │  - 日期范围筛选 (DatePicker)                           │    │    │
│  │  │  - 项目筛选 (Select 下拉)                               │    │    │
│  │  │  - 快速预设: 今天/本周/本月                             │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 四、具体改动

### 4.1 活动日志类型定义

**文件：** `src/types/activity.ts`（新增）

```typescript
// 活动类型枚举
export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'comment'
  | 'assign'
  | 'status_change';

// 活动日志条目
export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  actionType: ActivityType;
  entityType: string;       // 'issue', 'project', 'document', 'file' 等
  entityId: string;
  entityName: string;
  projectId?: string;
  projectName?: string;
  timestamp: string;         // ISO 8601
  ipAddress: string;
  userAgent?: string;
  moduleName: string;        // RPC module_name
  methodName: string;        // RPC method_name
  before?: Record<string, any>;  // 变更前数据快照
  after?: Record<string, any>;   // 变更后数据快照
  description: string;       // 人类可读的操作描述
  metadata?: Record<string, any>; // 扩展元数据
}

// 活动日志筛选条件
export interface ActivityFilter {
  userId?: string;
  actionTypes?: ActivityType[];
  entityType?: string;
  entityId?: string;
  projectId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  keyword?: string;          // 搜索 entityName 或 description
}

// 活动日志统计
export interface ActivityStats {
  totalActions: number;
  actionsByType: Record<ActivityType, number>;
  actionsByUser: Array<{ userId: string; userName: string; count: number }>;
  actionsByDay: Array<{ date: string; count: number }>;
  topEntities: Array<{ entityType: string; entityId: string; entityName: string; count: number }>;
}

// 活动日志查询参数
export interface ActivityQueryParams {
  filter: ActivityFilter;
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

// 活动日志查询响应
export interface ActivityQueryResponse {
  items: ActivityLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  stats?: ActivityStats;
}
```

### 4.2 活动日志 API 服务

**文件：** `src/services/activity.service.ts`（新增）

```typescript
import { RequestHttp } from '@/utils/request';
import type {
  ActivityQueryParams,
  ActivityQueryResponse,
  ActivityLogEntry,
  ActivityStats,
} from '@/types/activity';

const http = new RequestHttp();

export const activityService = {
  // 查询活动日志列表
  async queryActivities(params: ActivityQueryParams): Promise<ActivityQueryResponse> {
    return http.post('/', {
      module_name: 'services.audit.audit_service',
      method_name: 'query_activities',
      parameters: {
        filter: params.filter,
        page: params.page,
        page_size: params.pageSize,
        sort_field: params.sortField,
        sort_order: params.sortOrder,
      },
    });
  },

  // 获取单条活动日志详情
  async getActivityDetail(id: string): Promise<ActivityLogEntry> {
    return http.post('/', {
      module_name: 'services.audit.audit_service',
      method_name: 'get_activity_detail',
      parameters: { activity_id: id },
    });
  },

  // 获取实体活动时间线
  async getEntityTimeline(
    entityType: string,
    entityId: string
  ): Promise<ActivityLogEntry[]> {
    return http.post('/', {
      module_name: 'services.audit.audit_service',
      method_name: 'get_entity_timeline',
      parameters: { entity_type: entityType, entity_id: entityId },
    });
  },

  // 获取活动统计
  async getActivityStats(
    dateRange?: { start: string; end: string }
  ): Promise<ActivityStats> {
    return http.post('/', {
      module_name: 'services.audit.audit_service',
      method_name: 'get_activity_stats',
      parameters: dateRange ? { date_range: dateRange } : {},
    });
  },

  // 导出活动日志
  async exportActivities(
    filter: ActivityQueryParams['filter'],
    format: 'csv' | 'pdf'
  ): Promise<Blob> {
    return http.post('/', {
      module_name: 'services.audit.audit_service',
      method_name: 'export_activities',
      parameters: { filter, format },
    }, { responseType: 'blob' });
  },

  // 获取最近活动（仪表盘 Feed）
  async getRecentActivities(limit: number = 20): Promise<ActivityLogEntry[]> {
    return http.post('/', {
      module_name: 'services.audit.audit_service',
      method_name: 'get_recent_activities',
      parameters: { limit },
    });
  },
};
```

### 4.3 useActivityLog Composable

**文件：** `src/composables/useActivityLog.ts`（新增）

```typescript
import { ref, reactive, computed, watch } from 'vue';
import { activityService } from '@/services/activity.service';
import type {
  ActivityLogEntry,
  ActivityFilter,
  ActivityQueryParams,
  ActivityStats,
} from '@/types/activity';
import { ElMessage } from 'element-plus';

export function useActivityLog() {
  // 状态
  const activities = ref<ActivityLogEntry[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const stats = ref<ActivityStats | null>(null);
  const selectedActivity = ref<ActivityLogEntry | null>(null);
  const detailVisible = ref(false);

  // 筛选条件
  const filter = reactive<ActivityFilter>({
    actionTypes: [],
    dateRange: undefined,
    keyword: '',
  });

  // 分页
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    sortField: 'timestamp',
    sortOrder: 'desc' as const,
  });

  // 查询参数
  const queryParams = computed<ActivityQueryParams>(() => ({
    filter: { ...filter },
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
  }));

  // 获取活动日志列表
  async function fetchActivities() {
    loading.value = true;
    try {
      const res = await activityService.queryActivities(queryParams.value);
      activities.value = res.items;
      total.value = res.total;
      if (res.stats) stats.value = res.stats;
    } catch (e) {
      ElMessage.error('获取活动日志失败');
    } finally {
      loading.value = false;
    }
  }

  // 查看活动详情
  async function viewDetail(activity: ActivityLogEntry) {
    try {
      selectedActivity.value = await activityService.getActivityDetail(activity.id);
      detailVisible.value = true;
    } catch (e) {
      ElMessage.error('获取活动详情失败');
    }
  }

  // 导出活动日志
  async function exportLog(format: 'csv' | 'pdf') {
    try {
      const blob = await activityService.exportActivities(filter, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'csv' ? 'csv' : 'pdf';
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success(`导出 ${format.toUpperCase()} 成功`);
    } catch (e) {
      ElMessage.error('导出失败');
    }
  }

  // 重置筛选
  function resetFilter() {
    filter.userId = undefined;
    filter.actionTypes = [];
    filter.entityType = undefined;
    filter.projectId = undefined;
    filter.dateRange = undefined;
    filter.keyword = '';
    pagination.page = 1;
  }

  // 分页变化时重新查询
  watch(
    () => [pagination.page, pagination.pageSize, pagination.sortField, pagination.sortOrder],
    () => fetchActivities()
  );

  return {
    activities,
    loading,
    total,
    stats,
    filter,
    pagination,
    selectedActivity,
    detailVisible,
    fetchActivities,
    viewDetail,
    exportLog,
    resetFilter,
  };
}
```

### 4.4 DiffViewer 变更差异对比组件

**文件：** `src/components/audit/DiffViewer.vue`（新增）

核心功能：
- 接收 `before` 和 `after` 两个对象，逐字段对比差异
- 新增字段以绿色高亮显示（`+` 前缀）
- 删除字段以红色高亮显示（`-` 前缀）
- 修改字段以黄色高亮显示，同时展示旧值和新值
- 未变更字段以灰色弱化显示
- 支持 JSON 嵌套对象的递归展开对比
- 空状态：当无 before/after 数据时显示"此操作无变更数据"

### 4.5 ActivityTimeline 活动时间线组件

**文件：** `src/components/audit/ActivityTimeline.vue`（新增）

核心功能：
- 垂直时间线布局，使用 Element Plus Timeline 组件
- 每条记录显示：用户头像、用户名、操作描述、时间戳（相对时间 + 绝对时间）
- 操作类型图标映射：create(✓)、update(✎)、delete(✕)、archive(📦)、restore(↩)、comment(💬)、assign(👤)、status_change(🔄)
- 支持"展开详情"按钮，点击后在下方显示 DiffViewer
- 支持"加载更多"按钮，分页加载历史活动
- 空状态提示："暂无活动记录"

### 4.6 ActivityFilter 活动过滤器组件

**文件：** `src/components/audit/ActivityFilter.vue`（新增）

核心功能：
- 用户筛选：远程搜索 Select，支持输入用户名搜索
- 操作类型筛选：多选 Checkbox Group，横向排列
- 实体类型筛选：Select 下拉，选项包括 Issue、项目、文档、文件等
- 日期范围筛选：DatePicker 范围选择，带快速预设按钮（今天、本周、本月、近 90 天）
- 项目筛选：Select 下拉，支持搜索
- 关键词搜索：Input 输入框，支持搜索实体名称和操作描述
- 重置按钮：一键清除所有筛选条件
- 筛选条件变更时自动触发查询（debounce 300ms）

### 4.7 样式

**文件：** `src/styles/audit.scss`（新增）

```scss
.activity-log {
  &__filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
    background: var(--el-bg-color);
    border-radius: var(--el-border-radius-base);
    margin-bottom: 16px;
  }

  &__table {
    .activity-type-tag {
      &.create { color: var(--el-color-success); }
      &.update { color: var(--el-color-primary); }
      &.delete { color: var(--el-color-danger); }
      &.archive { color: var(--el-color-warning); }
      &.restore { color: var(--el-color-info); }
      &.comment { color: #8b5cf6; }
      &.assign { color: #06b6d4; }
      &.status_change { color: #f59e0b; }
    }
  }
}

.diff-viewer {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;

  &__field {
    padding: 4px 8px;
    border-radius: 2px;

    &--added {
      background: rgba(34, 197, 94, 0.1);
      color: var(--el-color-success);
    }

    &--removed {
      background: rgba(239, 68, 68, 0.1);
      color: var(--el-color-danger);
    }

    &--modified {
      background: rgba(245, 158, 11, 0.1);
      color: var(--el-color-warning);
    }

    &--unchanged {
      color: var(--el-text-color-disabled);
    }
  }
}

.activity-timeline {
  .el-timeline-item__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.activity-feed {
  max-height: 400px;
  overflow-y: auto;

  &__item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }
  }
}
```

---

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义活动日志类型接口 | `types/activity.ts` | TypeScript 类型检查通过 | 0.03 |
| 2 | 实现活动日志 API 服务 | `services/activity.service.ts` | 接口调用返回正确数据结构 | 0.04 |
| 3 | 实现 useActivityLog Composable | `composables/useActivityLog.ts` | 筛选/分页/导出逻辑正确 | 0.05 |
| 4 | 实现 ActivityFilter 组件 | `components/audit/ActivityFilter.vue` | 6 种筛选条件均正常工作 | 0.06 |
| 5 | 实现 ActivityLog 列表页面 | `views/audit/ActivityLog.vue` | 列表展示、筛选、分页、导出正常 | 0.08 |
| 6 | 实现 DiffViewer 组件 | `components/audit/DiffViewer.vue` | 新增/删除/修改/未变更 4 种状态正确渲染 | 0.06 |
| 7 | 实现 ActivityDetail 抽屉 | `views/audit/ActivityDetail.vue` | 详情抽屉正常打开/关闭 | 0.04 |
| 8 | 实现 ActivityTimeline 组件 | `components/audit/ActivityTimeline.vue` | 时间线正确展示，展开详情正常 | 0.05 |
| 9 | 实现 ActivityFeed 仪表盘组件 | `components/dashboard/ActivityFeed.vue` | 仪表盘展示最近 20 条活动 | 0.03 |
| 10 | 实体详情页集成时间线 | 修改 Issue/项目/文档详情页 | 详情页底部显示操作时间线 | 0.03 |
| 11 | 编写样式文件 | `styles/audit.scss` | 样式与 Element Plus 一致 | 0.02 |
| 12 | 组件测试 | 测试文件 | 6 个测试场景通过 | 0.01 |

**总计：** 0.5d

---

## 六、测试规格

### Scenario 1: 活动日志列表正常展示
- **GIVEN** 系统中存在 100 条活动日志记录
- **WHEN** 管理员访问活动日志页面
- **THEN** 页面展示活动日志列表，每行显示用户、操作类型、实体名称、时间戳，默认按时间倒序排列，分页显示每页 20 条

### Scenario 2: 多维度筛选活动日志
- **GIVEN** 活动日志列表已加载
- **WHEN** 管理员选择操作类型为"删除"，日期范围为"本周"，用户为"张三"
- **THEN** 列表仅显示张三在本周内执行的所有删除操作，分页总数相应更新

### Scenario 3: 查看活动详情与变更差异
- **GIVEN** 活动日志列表中有一条"更新 Issue"类型的记录
- **WHEN** 管理员点击该记录的"查看详情"按钮
- **THEN** 右侧抽屉打开，显示操作详情（用户、时间、IP、操作类型），下方 DiffViewer 展示 before/after 字段级差异对比，修改字段以黄色高亮

### Scenario 4: 导出活动日志
- **GIVEN** 管理员已设置筛选条件（本月、操作类型为"删除"和"修改"）
- **WHEN** 管理员点击"导出 CSV"按钮
- **THEN** 浏览器下载一个 CSV 文件，文件名包含日期，内容包含当前筛选条件下所有活动日志的完整字段

### Scenario 5: 实体详情页活动时间线
- **GIVEN** 用户打开某个 Issue 的详情页
- **WHEN** 页面滚动到底部的"活动历史"区域
- **THEN** 时间线组件展示该 Issue 的所有历史操作，按时间倒序排列，每条记录显示操作人、操作描述和时间

### Scenario 6: 仪表盘实时活动 Feed
- **GIVEN** 管理员打开仪表盘页面
- **WHEN** 页面加载完成
- **THEN** "最近活动"区域展示最近 20 条操作记录，每 30 秒自动刷新，显示操作人、操作类型图标、实体名称和相对时间（如"3 分钟前"）

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| 活动日志数据量过大导致查询慢 | 中 | 中 | 中 | 复合索引（user_id + timestamp, entity_type + entity_id），TTL 索引自动清理 90 天前数据 | 限制查询时间范围最大 90 天，默认 30 天 |
| before/after 快照占用大量存储 | 中 | 中 | 中 | 仅记录变更字段（非全量快照），限制单个快照最大 10KB | 超过 10KB 的快照仅记录字段名列表 |
| 导出大量数据导致浏览器超时 | 中 | 低 | 低 | 导出时分批查询（每次 1000 条），后端流式写入文件 | 限制单次导出最大 50000 条 |
| 仪表盘轮询增加服务器负载 | 中 | 低 | 低 | 30 秒轮询间隔，使用轻量查询（仅返回最近 20 条） | 改为 60 秒轮询或手动刷新 |
| 审计服务不可用阻塞业务操作 | 低 | 高 | 中 | 审计中间件使用 try/catch，日志记录失败不影响业务操作 | 审计服务恢复后补录缺失日志 |

---

## 八、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 活动日志页面加载失败 | 移除审计路由，隐藏导航菜单项 | 审计模块 | < 2min |
| 活动日志查询导致数据库压力 | 临时关闭活动日志查询 API，返回空列表 | 审计模块 | < 3min |
| DiffViewer 渲染异常 | 回退为纯文本展示 before/after JSON | 活动详情页 | < 5min |
| 仪表盘 Feed 请求失败 | 隐藏 ActivityFeed 组件，仪表盘其他区域正常 | 仪表盘 | < 2min |

**回滚验证：**
- 回滚后其他页面功能正常
- 回滚后无 console 错误
- 回滚后 `pnpm build` 构建成功
- 回滚后仪表盘其他组件正常展示

---

## 九、设计决策记录

### D-01: 活动日志保留 90 天

**背景：** 活动日志数据量随时间线性增长，需要平衡存储成本和合规需求。
**决策：** 在线保留 90 天，通过 MongoDB TTL 索引自动过期；超过 90 天的数据归档至冷存储（文件存储）。
**权衡：** 90 天满足大多数合规审计需求（SOC 2 要求至少 90 天），超过 90 天的查询需要从冷存储恢复，延迟较高。
**后果：** 需实现冷存储归档 Job（每日定时任务），并在查询界面提示数据保留期限。

### D-02: 使用混合策略记录活动日志

**背景：** 纯 RPC 中间件拦截无法获取业务上下文（如 entity_name、before/after），纯 Service 层记录可能遗漏。
**决策：** RPC 中间件记录基础信息 + Service 层补充业务上下文。
**权衡：** 需要两层协调，但保证了覆盖面和信息丰富度。
**后果：** 开发者需在 Service 层调用 `audit_service.enrich()` 补充上下文，Code Review 时需检查此调用。

### D-03: DiffViewer 仅展示变更字段

**背景：** 全量展示 before/after 会导致大量未变更字段干扰阅读。
**决策：** DiffViewer 默认仅展示变更字段（新增、删除、修改），未变更字段折叠显示。
**权衡：** 用户可能想查看完整快照，但大多数场景下变更字段足以满足需求。
**后果：** 提供"展开全部字段"按钮，允许用户查看完整快照。

### D-04: 仪表盘 Feed 使用轮询而非 WebSocket

**背景：** 实时活动 Feed 可以通过 WebSocket 推送或定时轮询实现。
**决策：** 使用 30 秒轮询，而非 WebSocket。
**权衡：** 轮询有 30 秒延迟，但实现简单、无需维护 WebSocket 连接，对服务器负载影响可控。
**后果：** 如果未来需要真正的实时推送，可升级为 WebSocket（后端已预留接口）。

---

## 十、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| 活动日志查询耗时 | API 响应时间监控 | P95 > 2s | 索引是否有效 |
| 活动日志日增量 | 数据库计数 | 日增量 > 100 万条 | 是否存在异常批量操作 |
| 活动日志页面 PV | 前端埋点 | -- | 审计功能使用频率 |
| 导出操作次数 | 前端埋点 | -- | 合规导出需求频率 |
| 活动日志集合大小 | 数据库监控 | > 10GB | 是否需要调整 TTL 或清理策略 |
| 冷存储归档任务成功率 | 定时任务日志 | < 95% | 归档任务是否正常 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `DEBUG` | 活动日志查询 | `[ActivityLog] Query filter={user_id:xxx, action_types:[delete]}` |
| `INFO` | 活动日志记录 | `[ActivityLog] Logged action=delete entity=issue:123 by user=zhangsan` |
| `WARN` | 快照大小超限 | `[ActivityLog] Before snapshot truncated for entity=doc:456, size=15KB` |
| `ERROR` | 活动日志写入失败 | `[ActivityLog] Failed to log activity: MongoDB write error` |

---

## 十一、代码审查检查清单

- [ ] `types/activity.ts` 中 ActivityType 联合类型完整，覆盖所有 8 种操作类型
- [ ] `activity.service.ts` 中所有 API 调用使用正确的 RPC 信封格式
- [ ] `useActivityLog.ts` 中筛选/分页/排序/导出逻辑正确
- [ ] `ActivityFilter.vue` 中 6 种筛选条件均正常工作，日期预设按钮正确
- [ ] `ActivityLog.vue` 中列表分页、排序、导出功能正常
- [ ] `DiffViewer.vue` 正确渲染新增/删除/修改/未变更 4 种状态
- [ ] `ActivityDetail.vue` 抽屉打开/关闭动画流畅，数据正确展示
- [ ] `ActivityTimeline.vue` 时间线正确排序，展开详情功能正常
- [ ] `ActivityFeed.vue` 30 秒自动刷新正常，组件卸载时清除定时器
- [ ] 导出功能正确处理 Blob 响应，文件名包含日期
- [ ] `vue-tsc --noEmit` 类型检查通过

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 活动日志页面首次加载慢 | 活动日志数据量超过 10 万条时，首次查询超时 | 缺少 `timestamp` 字段索引，全表扫描 | 在 `activity_logs` 集合上创建复合索引 `(timestamp: -1, user_id: 1)` |
| 2 | DiffViewer 大对象渲染卡顿 | before/after 包含嵌套 JSON 对象（50+ 字段）时渲染慢 | 递归渲染未做虚拟化，DOM 节点过多 | 限制 DiffViewer 展开深度为 3 级，超过 30 个字段时分页展示 |
| 3 | 导出文件包含乱码 | CSV 导出中文内容时 Excel 打开乱码 | 未添加 BOM 头 | 导出 CSV 时在文件开头添加 UTF-8 BOM（`\uFEFF`） |
| 4 | 仪表盘 Feed 定时器未清理 | 用户离开仪表盘页面后，30 秒轮询仍在运行 | 组件卸载时未清除 `setInterval` | 在 `onUnmounted` 中调用 `clearInterval` |
| 5 | 筛选条件切换时重复请求 | 快速切换多个筛选条件，触发多次 API 请求 | 未使用 debounce，每次变更立即请求 | 对筛选条件变更使用 300ms debounce，切换时取消上一次未完成的请求 |
| 6 | 活动时间线分页加载重复数据 | 加载更多时，新数据插入导致分页偏移 | 使用 offset 分页时，新数据插入导致偏移量失效 | 使用 cursor 分页（基于 `timestamp` + `_id`），避免 offset 偏移问题 |

---

## 性能分析

### 列表查询性能

| 场景 | 数据量 | 预估查询时间 | 说明 |
|------|--------|-------------|------|
| 默认查询（最近 30 天） | < 1000 条 | < 200ms | 使用 timestamp 索引，分页 20 条 |
| 筛选查询（指定用户 + 操作类型） | < 500 条 | < 150ms | 使用复合索引 |
| 关键词搜索 | < 1000 条 | < 300ms | 正则匹配 entity_name 和 description |
| 全量导出（CSV） | < 50000 条 | < 5s | 分批查询，流式写入 |

### 组件渲染性能

| 组件 | 数据量 | 预估渲染时间 | 说明 |
|------|--------|-------------|------|
| ActivityLog 表格 | 20 行/页 | < 10ms | 标准 Element Plus 表格渲染 |
| DiffViewer | 10 个变更字段 | < 5ms | 纯文本对比，无复杂计算 |
| DiffViewer | 50 个变更字段 | < 15ms | 递归渲染，DOM 节点较多 |
| ActivityTimeline | 20 条记录 | < 10ms | Element Plus Timeline 组件 |
| ActivityFeed | 20 条记录 | < 8ms | 简单列表渲染 |

### 内存占用

| 组件实例 | 内存占用 | 说明 |
|---------|---------|------|
| ActivityLog 页面 | ~15KB | 列表数据 + 筛选状态 + 分页状态 |
| ActivityDetail 抽屉 | ~8KB | 单条活动详情 + before/after 数据 |
| DiffViewer | ~5KB | 变更字段对比数据 |
| ActivityFeed | ~5KB | 最近 20 条活动数据 |

