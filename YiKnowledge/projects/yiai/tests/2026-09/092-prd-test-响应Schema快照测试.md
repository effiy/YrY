---

doc_type: test
title: "YA-09-88: 服务端 API 响应 Schema 快照测试 — 基于 JSON Schema 的回归对比验证 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-88"
source_prds: ["92-需求-响应Schema快照测试"]
source_modules: ["92-prd-task-响应Schema快照测试"]
source_okr: [yiai-001]

type: test
---

# YA-09-88: 响应 Schema 快照测试 — 测试规格

> 来源 PRD：[92-需求-响应Schema快照测试.md](../../prds/2026-09/92-需求-响应Schema快照测试.md)
> 需求编号：YA-09-88 · 优先级：P2 · 人天：0.5d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 一、测试范围与策略

### 1.1 测试范围

| 模块 | 测试重点 | 层级 |
|------|---------|------|
| Schema 快照生成 | 为每个 RPC 方法生成 JSON Schema 快照文件 | 单元 |
| Schema 对比引擎 | 快照差异对比（字段新增/删除/类型变更/重命名） | 单元 |
| 动态字段替换器 | 自动替换 timestamp/uuid/random_id 为 placeholder | 单元 |
| 快照文件管理 | `pytest --snapshot-update` 批量更新快照 | 集成 |
| CI 回归验证 | 每次 CI 自动运行全量快照对比 | 集成 |

### 1.2 测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | Schema 提取、动态字段替换、对比逻辑、差异分类 | 60% |
| 集成测试 | pytest + syrupy | 快照文件读写、`--snapshot-update` 标志、CI 模式 | 40% |

---

## 二、测试数据与前置条件

| 组件 | 要求 |
|------|------|
| 测试快照目录 | `tests/snapshots/` 含 5 个预置 JSON 快照文件 |
| 测试响应样本 | 10 组 RPC 响应（含动态字段：timestamp/uuid/random_id） |
| 变更对比样本 | 字段新增/删除/类型变更/重命名各 2 组 |
| syrupy 依赖 | `pip install syrupy` 用于快照管理 |

---

## 三、测试用例

### 3.1 功能验证（10 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-SS-01 | 提取响应 Schema | 传入标准 RPC 响应 `{code, message, data}` | 生成 JSON Schema（type/required/properties） | P0 |
| UT-SS-02 | 动态字段替换-ISO时间戳 | 响应含 `"created_at": "2026-09-23T10:00:00Z"` | 替换为 `"<TIMESTAMP>"` | P0 |
| UT-SS-03 | 动态字段替换-UUID | 响应含 `"session_id": "abc123-def456..."` | 替换为 `"<UUID>"` | P0 |
| UT-SS-04 | 动态字段替换-随机ID | 响应含 `"record_id": "a1b2c3d4e5f6"` | 替换为 `"<RANDOM_ID>"` | P1 |
| UT-SS-05 | 首次快照生成 | 运行 `test_snapshot` 首次 | 快照文件写入 `tests/snapshots/` | P0 |
| UT-SS-06 | 快照一致通过 | 响应 Schema 与快照完全一致 | 测试 PASS | P0 |
| UT-SS-07 | 字段新增检测 | 响应中新增 `"new_field"` 不在快照中 | 对比失败，报告"快照缺少字段 new_field" | P0 |
| UT-SS-08 | 字段类型变更检测 | `"count"` 从 `int` 变为 `str` | 报告"字段 count 类型变更 int -> str" | P0 |
| UT-SS-09 | 字段删除检测 | 响应删除了 `"deprecated_field"` | 报告"快照字段 deprecated_field 在响应中缺失" | P1 |
| UT-SS-10 | 嵌套结构变更检测 | `"user.name"` 从 `string` 变为 `object` | 报告深层路径 `user.name` 类型变更 | P1 |

### 3.2 快照更新（2 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-SU-01 | `--snapshot-update` 批量更新 | 运行 `pytest --snapshot-update` | 所有快照文件更新为最新响应 Schema | P0 |
| UT-SU-02 | 部分端点更新 | 仅 2/5 个端点 Schema 变更后更新 | 仅变更的快照被更新，其余保持原样 | P1 |

---

## 四、边界与异常测试

### 4.1 边界场景（4 条）

| 编号 | 场景 | 输入 | 预期 |
|------|------|------|------|
| BE-01 | 空响应体 | `{}` | 生成 `{type: "object", properties: {}}` |
| BE-02 | 10 层嵌套 JSON | 10 层嵌套响应 | 正常生成 Schema，限制递归深度 20 层 |
| BE-03 | 数组类型字段 | `"tags": ["a","b"]` | Schema 识别为 `{type: "array", items: {type: "string"}}` |
| BE-04 | 快照文件不存在 | 新端点无快照文件 | 自动创建快照，测试通过 |

### 4.2 异常场景（3 条）

| 编号 | 场景 | 触发条件 | 预期 |
|------|------|---------|------|
| EX-01 | 非 JSON 响应 | 端点返回 HTML/纯文本 | 跳过 Schema 生成，记录 WARNING |
| EX-02 | 快照文件损坏 | 快照 JSON 格式非法 | 明确报错"快照文件 xxx 解析失败"，退出码非 0 |
| EX-03 | 并发快照写入 | 多个测试同时写同一快照 | 文件锁保护，最终内容完整 |

---

## 五、回归测试（2 条）

| 编号 | 回归场景 | 验证方法 |
|------|---------|---------|
| RG-01 | 所有 RPC 端点快照一致 | CI 全量快照测试通过，无意外 Schema 变更 |
| RG-02 | 新增端点自动纳入 | 新 RPC 方法首次运行自动生成快照，后续 CI 自动校验 |

---

## 六、可追溯性矩阵

| 需求点 | 测试用例 | 覆盖状态 |
|--------|---------|---------|
| Schema 快照保存 | UT-SS-01, UT-SS-05 | 已覆盖 |
| CI 自动对比 | UT-SS-06 | 已覆盖 |
| 动态字段替换 | UT-SS-02, UT-SS-03, UT-SS-04 | 已覆盖 |
| 变更检测（增/删/改/嵌套） | UT-SS-07 至 UT-SS-10 | 已覆盖 |
| 快照可更新 | UT-SU-01, UT-SU-02 | 已覆盖 |
| Git 可追溯 | RG-02 | 已覆盖 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 全端点 Schema 覆盖 | 需所有端点实现完成后生成快照 | 增量补充：新端点添加时同步添加快照 |
| 大响应裁剪 | 分页裁剪逻辑需大量测试数据 | 准备 500+ 条结果的大响应测试 |
| 快照文件大小上限 | 未定义单快照上限 | 超过 100KB 的快照使用分页裁剪 |
| 变更审查流程 | 需人工确认变更是否预期 | 补充 PR 审查检查清单 |