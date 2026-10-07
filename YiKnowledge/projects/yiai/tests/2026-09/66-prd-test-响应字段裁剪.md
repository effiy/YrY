---

doc_type: test
title: "YA-09-62: 服务端 API 响应字段裁剪 — Sparse Fieldsets 按需返回字段优化传输 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-62"
source_prds: ["66-需求-响应字段裁剪"]
source_modules: ["66-prd-task-响应字段裁剪"]
source_okr: [yiai-001]

type: test
---

# YA-09-62: 响应字段裁剪 — 测试规格

> 来源 PRD：[66-需求-响应字段裁剪.md](../../prds/2026-09/66-需求-响应字段裁剪.md)

本文档定义 API 响应字段裁剪的**验证方式**——覆盖 projection 投影正确性、Sparse Fieldsets 字段选择、排除敏感字段、嵌套对象投影、默认字段集。

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
| COV-1 | projection 包含字段（仅返回指定字段） | L2 |
| COV-2 | projection 排除字段（_id=0） | L2 |
| COV-3 | Sparse Fieldsets——?fields=name,email | L2 |
| COV-4 | 敏感字段默认排除 | L2 |
| COV-5 | 嵌套对象投影（dot notation） | L2 |
| COV-6 | 默认字段集 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `full_doc` | `{_id, key, title, content, tags, status, createdTime, updatedTime, _secret}` | 完整文档 |
| `fields_param` | `?fields=title,status,createdTime` | Sparse Fieldsets |

---

## 二、测试用例

### 2.1 Projection 投影（COV-1~2 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FLD-001 | projection 仅返回指定字段 | 1. `projection: {title: 1, status: 1, _id: 0}` | 返回 `[{title, status}]`，无 `_id`, `content` 等 | P0 | 待实现 |
| TC-FLD-002 | projection 排除 _id | 1. `projection: {_id: 0}` | 返回文档不含 `_id` 字段 | P0 | 待实现 |
| TC-FLD-003 | 无 projection 返回所有字段 | 1. 不传 projection | 返回所有字段（除 `_secret`） | P0 | 待实现 |
| TC-FLD-004 | projection 仅 `{_id: 1}` 返回 _id | 1. `projection: {_id: 1}` | 仅返回 `_id` | P1 | 待实现 |
| TC-FLD-005 | 混合包含/排除（非法） | 1. `{title: 1, _id: 0}` 以外的组合 | MongoDB 返回错误，或服务端规范化处理 | P1 | 待实现 |

### 2.2 Sparse Fieldsets（COV-3 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FLD-006 | ?fields=title,status 仅返回指定字段 | 1. 查询参数 `fields=title,status` | 响应仅含 `title`, `status`，不含其他字段 | P0 | 待实现 |
| TC-FLD-007 | 多字段逗号分隔 | 1. `fields=title,content,tags` | 3 个字段均返回 | P0 | 待实现 |
| TC-FLD-008 | 无效字段名忽略 | 1. `fields=nonexistent_field` | 返回空（该字段不存在），不报错 | P1 | 待实现 |

### 2.3 敏感字段排除（COV-4~6 . L1+L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FLD-009 | `_secret` 字段默认排除 | 1. 查询文档含 `_secret` 字段 | 响应中不含 `_secret`（以 `_` 开头的内部字段） | P0 | 待实现 |
| TC-FLD-010 | MongoDB `_id` 默认返回 | 1. 无 projection 查询 | `_id` 正常返回（非敏感字段） | P0 | 待实现 |
| TC-FLD-011 | 嵌套字段投影——dot notation | 1. `projection: {"meta.author": 1}` | 返回 `{meta: {author: "xxx"}}` | P1 | 待实现 |
| TC-FLD-012 | 默认字段集正确 | 1. 无 fields 参数；2. 检查返回字段 | 返回项目定义的默认字段列表 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-FLD-EDGE-001 | projection 为空对象 `{}` | 1. `projection: {}` | 返回所有默认字段 | P1 | 待实现 |
| TC-FLD-EDGE-002 | fields 参数为空字符串 | 1. `fields=` | 返回所有默认字段 | P1 | 待实现 |
| TC-FLD-EDGE-003 | 仅返回 _id（最小响应） | 1. `projection: {_id: 1}` | 响应体积极小 | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-FLD-REG-001 | 缺陷 1：不传 fields/projection 时行为不变 | 现有测试全部通过 | 响应格式、字段数量不变 | P0 | 待实现 |
| TC-FLD-REG-002 | 缺陷 2：字段裁剪后 response size 明显减小 | 对比裁前/裁后大小 | 裁后体积显著减小 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 projection 投影 | 仅返回指定字段 | TC-FLD-001 ~ 005 |
| FR-02 Sparse Fieldsets | ?fields= 参数 | TC-FLD-006 ~ 008 |
| FR-03 敏感字段排除 | `_` 前缀字段 | TC-FLD-009 ~ 010 |
| FR-04 嵌套投影 | dot notation | TC-FLD-011 |
| FR-05 默认字段集 | 无参数时默认 | TC-FLD-012 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | GraphQL 字段选择对比未测试 | 未来可能引入 GraphQL | 评估与 Sparse Fieldsets 的差异 |
| G-2 | 大数据量下的字段裁剪性能 | 字段裁剪本身有开销 | 基准测试补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/66-需求-响应字段裁剪.md`*
