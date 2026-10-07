---

doc_type: test
title: "YA-09-60: 服务端 API 响应分页统一规范 — 基于 Cursor 的游标分页与 Offset 对比 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-60"
source_prds: ["64-需求-统一分页规范"]
source_modules: ["64-prd-task-统一分页规范"]
source_okr: [yiai-001]

type: test
---

# YA-09-60: 统一分页规范 — 测试规格

> 来源 PRD：[64-需求-统一分页规范.md](../../prds/2026-09/64-需求-统一分页规范.md)

本文档定义统一分页规范的**验证方式**——覆盖 Offset 分页正确性、Cursor 游标分页、分页稳定性、分页响应格式统一、总数字段。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx + MongoDB | MongoDB 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | Offset 分页——page/pageSize 正确性 | L2 |
| COV-2 | Cursor 游标分页——cursor/limit 正确性 | L2 |
| COV-3 | 分页响应格式统一（list, total, pageNum, pageSize, totalPages） | L2 |
| COV-4 | 排序 + tiebreaker 保证分页稳定 | L2 |
| COV-5 | Cursor 分页不受插入/删除影响 | L2 |
| COV-6 | 默认分页参数（page=1, pageSize=20） | L1 |
| COV-7 | 分页边界处理（超出范围、负值） | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `paged_data` | 50 条有序文档 | 分页查询测试 |
| `cursor_test_data` | 100 条含 `_id` 的文档 | 游标分页测试 |
| `page_response` | `{list, total, pageNum, pageSize, totalPages}` | 分页响应格式 |

---

## 二、测试用例

### 2.1 Offset 分页（COV-1,3,4,6,7 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-PAG-001 | 第 1 页返回前 20 条 | 1. `query_documents(page=1, pageSize=20)` | list 含 20 条，total=50, totalPages=3 | P0 | 待实现 |
| TC-PAG-002 | 第 2 页返回第 21-40 条 | 1. page=2, pageSize=20 | list 含 20 条，第 1 条 order=20 | P0 | 待实现 |
| TC-PAG-003 | 最后一页返回剩余条数 | 1. page=3, pageSize=20 | list 含 10 条 | P0 | 待实现 |
| TC-PAG-004 | 超出范围 page > totalPages 返回空 | 1. page=100 | list=[], total 不变，totalPages 不变 | P1 | 待实现 |
| TC-PAG-005 | page=0 或负值 → 默认 page=1 | 1. page=0 或 page=-1 | 按 page=1 处理 | P1 | 待实现 |
| TC-PAG-006 | pageSize=0 → 默认 20 | 1. pageSize=0 | 使用默认 20 | P1 | 待实现 |
| TC-PAG-007 | 分页排序稳定——同 order 文档不跨页重复 | 1. 插入同 createdTime 文档；2. 两次查询相邻页 | tiebreaker 确保无文档跨页重复 | P0 | 待实现 |
| TC-PAG-008 | total 字段正确 | 1. 使用 filter 查询部分文档 | total 反映过滤后的总数 | P0 | 待实现 |

### 2.2 Cursor 游标分页（COV-2,5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-PAG-009 | Cursor 取首页（无 cursor） | 1. `query_documents(cursor=null, limit=20)` | 返回前 20 条 + nextCursor | P0 | 待实现 |
| TC-PAG-010 | 使用 nextCursor 取下一页 | 1. 首页得到 nextCursor；2. 用 cursor 取第二页 | 返回第 21-40 条 | P0 | 待实现 |
| TC-PAG-011 | Cursor 分页——中间插入不影響 | 1. 首页取 20 条；2. 在位置 5 插入文档；3. 用 cursor 取下一页 | 第二页不受插入影响（cursor 已定位） | P0 | 待实现 |
| TC-PAG-012 | 最后一页无 nextCursor | 1. 取最后一页 | nextCursor=null，hasMore=false | P0 | 待实现 |
| TC-PAG-013 | Cursor 不可伪造 | 1. 篡改 cursor 值；2. 请求 | 返回错误或被忽略（cursor 含签名/校验） | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-PAG-EDGE-001 | 空集合分页 | 1. 查询空集合 | list=[], total=0, totalPages=0 | P1 | 待实现 |
| TC-PAG-EDGE-002 | pageSize 极大（1000） | 1. pageSize=1000 | 受复杂度限制（max 500），实际 500 | P1 | 待实现 |
| TC-PAG-EDGE-003 | cursor 与 filter 同时使用 | 1. cursor + filter 组合 | 两者共同作用，结果正确 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-PAG-REG-001 | 缺陷 1：排序不稳定导致分页重复 | 同 order 值文档跨页 | tiebreaker 消除重复 | P0 | 待实现 |
| TC-PAG-REG-002 | 缺陷 2：现有 query_documents 行为不变 | Offset 分页保持兼容 | 所有现有测试通过 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 Offset 分页 | page/pageSize | TC-PAG-001 ~ 006 |
| FR-02 Cursor 分页 | cursor/limit/nextCursor | TC-PAG-009 ~ 013 |
| FR-03 分页稳定 | tiebreaker 排序 | TC-PAG-007 |
| FR-04 响应格式统一 | list/total/pageNum/pageSize/totalPages | TC-PAG-001, 008 |
| FR-05 Cursor 不受插入影响 | 中间插入不偏移 | TC-PAG-011 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | GraphQL Relay 分页规范兼容 | 跨项目统一需考虑 | 评估 Relay connection 规范 |
| G-2 | 极大数据量（百万级）分页性能 | Offset 深分页性能差 | Cursor 分页作为推荐方案 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/64-需求-统一分页规范.md`*
