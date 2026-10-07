---

doc_type: test
title: 'YA-09-147: API 版本化策略 — 多版本共存 + 废弃生命周期 + 迁移指南自动生成 — 测试规格'
status: 待开始
priority: P2
owner: 陈铭
roles:
- engineer
- qa
created: 2026-09-11
updated: '2026-09-23'
project: YiAi
project_id: yiai
prd_month: '202609'
prd_task_id: YA-09-147
source_prds:
- 153-需求-API版本化策略
source_modules: []
source_okr:
- yiai-002

type: test
---

# YA-09-147: API 版本化策略 — 测试规格

> 来源 PRD：[153-需求-API版本化策略.md](../../prds/2026-09/153-需求-API版本化策略.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **版本路由**：`src/domain/versioning/router.py`（新建）— URL 路径版本化路由（`/v1/`、`/v2/`）的注册与匹配
- **废弃管理器**：`src/domain/versioning/deprecation.py`（新建）— `DeprecationManager` 类，管理 API 端点的废弃声明、Sunset 日期和警告头部注入
- **迁移指南生成**：`src/domain/versioning/migration_guide.py`（新建）— 从版本 diff 自动生成 Markdown 迁移指南
- **OpenAPI 多版本文档**：FastAPI 多版本 OpenAPI Schema 分组
- **排除范围**：客户端（YiVad/YiPet）的版本适配逻辑测试，版本化策略对性能的影响基准测试

### 测试策略

| 层级 | 策略 | 工具 |
|------|------|------|
| 单元测试 | 版本路由注册与匹配逻辑、DeprecationManager 声明解析 | pytest

## 二、测试数据 / Fixtures

- `versioned_app` — 测试数据 fixture


## 三、详细测试用例

### TC-01: v1 端点正常响应
- **P0** | 

### TC-02: v2 端点返回新字段
- **P0** | 

### TC-03: v1 和 v2 端点共存
- **P0** | 

### TC-04: 废弃端点返回警告头部
- **P1** | 状态码 200（仍可访问） | 响应头包含 `Deprecation: true`

### TC-05: Sunset 日期已过后端点不可用
- **P1** | 

### TC-06: 版本不匹配时错误提示
- **P1** | 

### TC-07: RPC 信封的版本化
- **P0** | 

### TC-08: 迁移指南自动生成
- **P2** | 返回 Markdown 文档，列出所有变更 | 包含旧端点路径、新端点路径、字段变更对比

### TC-09: 废弃端点在 OpenAPI 中标记
- **P2** | 

### TC-10: 无版本端点的向后兼容
- **P1** | 


## 四、边界与异常测试

### EC-01: 同时注册 v0（无版本）和 v1 端点
- **步骤**：`GET /health`（无版本）和 `GET /v1/health` 同时注册
- **预期**：两者均正常响应，路径不冲突

### EC-02: 大规模版本下路由性能
- **步骤**：注册 5 个版本（v1-v5），每个版本 10 个端点，请求 v5 端点
- **预期**：路由匹配时间 < 5ms，无明显线性增长

### EC-03: 迁移指南中字段名变更冲突
- **步骤**：v1 和 v2 使用同一字段名但类型不同（如 `count: int` → `count: str`）
- **预期**：迁移指南明确标记此字段为"破坏性变更"

### EC-04: 废弃声明中 Sunset 格式错误
- **步骤**：DeprecationManager 收到非法日期格式
- **预期**：抛出 `ValueError`，不静默忽略


## 五、回归测试

### RG-01: 当前无版本前缀的 POST / 端点仍正常工作
- **步骤**：部署版本化路由后，发送标准 RPC 请求到 POST /

### RG-02: 版本化策略不应强制客户端升级
- **步骤**：YiVad 使用 v1 RPC 端点，YiPet 使用 v2 RPC 端点，同时调用


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| TC-10 | 向后兼容 | 一、1.4 改造流程 |
| EC-01~04 | 边界/异常情况 | 七、风险与缓解 |
| RG-01/02 | 现有 API 不受影响 | 八、回滚策略 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 客户端版本协商（Header 方式） | 本期仅实现 URL 路径版本化 | 未来版本补充 `X-API-Version` Header 方式测试 |
| 跨版本数据迁移测试 | 数据 Schema 变更不在本期范围 | 补充数据库迁移测试 |

*测试规格基于 PRD [153-需求-API版本化策略.md](../../prds/2026-09/153-需求-API版本化策略.md) 提取，覆盖 10 个用例 + 4 个边界测试 + 2 个回归测试。*
