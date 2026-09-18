---
doc_type: module
prd_task_id: "YA-08-15"
title: "YA-08-15: 数据访问层 — MongoDB 单例 + Repository 模式 + RPC 动态路由 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202608"
estimate_frontend: 1.5
source_prd: "15-需求-数据访问层.md"
source_okr: [yiai-001]
related_tests: ["15-prd-test-数据访问层"]
---

# YA-08-15: 数据访问层 — MongoDB 单例 + Repository 模式 + RPC 动态路由 — 开发方案

> 来源 PRD：[15-需求-数据访问层.md](../../prds/2026-08/15-需求-数据访问层.md)
> 需求编号：YA-08-15 · 优先级：P1 · 人天：1.5d
> 类型：架构 · 状态：已完成

---

## 一、方案概述

规范化数据访问层——`MongoDB` 单例管理连接池，`repository.py` 提供通用 CRUD，`data_service` 通过 RPC 暴露动态路由。前端通过 `data_service.query_documents` 等方法操作任意集合。

```mermaid
flowchart LR
  RPC["POST / RPC 调度"] --> DS["services/database/data_service.py"]
  DS --> REPO["data/repository.py"]
  REPO --> DB["data/database.py<br/>MongoDB 单例 (Motor)"]
  DB --> MONGO["MongoDB"]
```

### 职责

| 组件 | 文件 | 职责 |
|------|------|------|
| 单例 | `data/database.py` | 连接管理、`find_many`/`insert_one`/`update_one`/`delete_one` 包装器 |
| Repository | `data/repository.py` | `_build_filter` 过滤构建、分页、排序 |
| 服务 | `services/database/data_service.py` | `query_documents`/`create_document`/`update_document`/`delete_document` RPC 方法 |

---

## 二、关键设计

### 2.1 过滤构建 — `_build_filter`

```python
def _build_filter(query_params: dict) -> dict:
    """将查询参数转为 Mongo filter dict"""
    filter_dict = {}
    for key, value in query_params.items():
        # 跳过内部参数
        if key in ("pageNum", "pageSize", "limit", "fields", "excludeFields", "orderBy", "orderType"):
            continue
        # 处理范围查询 {key: {"gte": 1, "lte": 10}}
        if isinstance(value, dict) and any(k in value for k in ("gte", "gt", "lte", "lt", "in", "ne")):
            filter_dict[key] = value
        else:
            filter_dict[key] = value
    return filter_dict
```

### 2.2 关键契约

| 方法 | 参数 | 注意 |
|------|------|------|
| `query_documents` | `cname`/`collection_name`, **`filter`** | **禁止使用 `query`**——静默忽略 |
| `create_document` | `cname`, `data` | — |
| `update_document` | `cname`, `key`, `data` | `key` 用于匹配 `_id` 或自定义 key 字段 |
| `delete_document` | `cname`, `key` | — |

---

## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | MongoDB 单例增强（find_many/delete_one） | 方法补充 | 0.5 |
| 2 | Repository filter 修复（范围/列表） | `tags: ["a","b"]` → `$in` 生效 | 0.5 |
| 3 | data_service 方法完善 + 测试 | CRUD 完整覆盖 | 0.5 |

**合计：1.5d**。

---

## 四、已知缺陷

### 缺陷 1：`filter` vs `query` 参数名不匹配

前端使用 `query` 而非 `filter` 时，`_build_filter` 跳过该字段，查询退化为全表——静默 bug。修复：前端统一使用 `filter`。

### 缺陷 2：2 元素字符串列表过滤被丢弃

`tags: ["work", "personal"]` 曾被误判为范围查询而丢弃。已在 `_handle_range_or_list_filter` 中修复，改为穿透到 `$in`。

---

## 五、关联模块

- 消费：[YA-08-04 审计日志](./04-prd-task-预写审计日志.md)
- 消费：[YA-08-05 文件管理服务](./05-prd-task-文件管理服务.md)
- 下游：[九月数据层扩展](../2026-09/06-prd-task-数据层.md)