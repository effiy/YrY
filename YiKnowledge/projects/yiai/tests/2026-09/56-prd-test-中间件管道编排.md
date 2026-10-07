---

doc_type: test
title: "YA-09-52: 服务端中间件执行顺序编排 — 声明式管道与优先级配置 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-52"
source_prds: ["56-需求-中间件管道编排"]
source_modules: ["56-prd-task-中间件管道编排"]
source_okr: [yiai-001]

type: test
---

# YA-09-52: 中间件管道编排 — 测试规格

> 来源 PRD：[56-需求-中间件管道编排.md](../../prds/2026-09/56-需求-中间件管道编排.md)
> 提取日期：2026-09-23

本文档定义中间件声明式管道编排的**验证方式**——覆盖优先级执行顺序、同优先级二级排序、条件启用、管道可视化、执行顺序验证规则。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 中间件按优先级排序 | L1 |
| COV-2 | 同优先级中间件按声明顺序执行 | L1 |
| COV-3 | CORS 最先执行（OPTIONS 不消耗限流配额） | L2 |
| COV-4 | 认证在限流之前（未认证请求不消耗配额） | L2 |
| COV-5 | 限流在 ETag 之前（304 不消耗配额） | L2 |
| COV-6 | ETag 在 Logging 之前（304 不打印完整日志） | L2 |
| COV-7 | 条件启用——中间件按路径匹配启用 | L1 |
| COV-8 | 管道可视化输出 | L1 |
| COV-9 | 声明式配置验证（YAML 格式） | L1 |
| COV-10 | 中间件执行顺序不变更 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `pipeline_config` | 声明式中间件配置（YAML） | 管道解析测试 |
| `middleware_registry` | 9 个中间件元数据（name, priority, depends_on, enabled） | 排序验证 |
| `order_tracker` | Mock 中间件记录执行顺序的列表 | 执行顺序断言 |
| `conditional_config` | 含 `path_patterns` 的条件中间件配置 | 条件启用测试 |

---

## 二、测试用例

### 2.1 优先级排序（COV-1~2 . L1）

> 自动化落点：`tests/unit/test_middleware_pipeline.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MWP-001 | CORS 优先级最高（最先执行） | 1. 解析 pipeline_config；2. 排序 | CORS 在排序列表第一位 | P0 | 待实现 |
| TC-MWP-002 | AdminAuth 在 RateLimit 之前 | 1. 检查排序结果中两者的位置 | AdminAuth index < RateLimit index | P0 | 待实现 |
| TC-MWP-003 | RateLimit 在 BodySize 之前 | 1. 检查排序结果 | RateLimit index < BodySize index | P0 | 待实现 |
| TC-MWP-004 | ETag 在 Logging 之前 | 1. 检查排序结果 | ETag index < Logging index | P0 | 待实现 |
| TC-MWP-005 | Logging 最后执行 | 1. 检查排序结果最后一位 | Logging 在列表末尾 | P0 | 待实现 |
| TC-MWP-006 | 同优先级按声明顺序 | 1. 两个 priority=50 中间件，先声明 A 后 B | A 在 B 之前执行 | P1 | 待实现 |
| TC-MWP-007 | 依赖检测——depends_on 缺失抛异常 | 1. B.depends_on = ["A_missing"]；2. 排序 | 抛出 MiddlewareDependencyError | P0 | 待实现 |
| TC-MWP-008 | 循环依赖检测 | 1. A.depends_on=B, B.depends_on=A | 抛出 CircularDependencyError | P0 | 待实现 |
| TC-MWP-009 | 声明式配置语法错误时启动失败 | 1. pipeline YAML 格式错误；2. 启动 | 抛出错误并终止启动，日志含行号 | P1 | 待实现 |

### 2.2 集成验证（COV-3~6 . L2）

> 自动化落点：`tests/integration/test_middleware_pipeline.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MWP-010 | OPTIONS 预检不消耗限流配额 | 1. 发送 10 个 OPTIONS 请求；2. 再发送 POST | POST 请求未被限流 | P0 | 待实现 |
| TC-MWP-011 | 无 Admin Token 时不消耗限流配额 | 1. 无 Token 访问 /admin/*；2. 检查限流计数 | 限流计数未增加（认证中间件先拦截） | P0 | 待实现 |
| TC-MWP-012 | 304 响应不打印完整日志 | 1. 带有效 ETag 请求；2. 检查日志 | 日志仅含 304 状态行，不含响应体日志 | P0 | 待实现 |
| TC-MWP-013 | 管道可视化输出 | 1. 设置 pipeline.visualize=true；2. 启动服务 | 日志输出 ASCII 管道图 | P1 | 待实现 |

### 2.3 条件启用（COV-7 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MWP-014 | AdminAuth 仅对 /admin/* 启用 | 1. 访问 /api/data（无Token）；2. 访问 /admin/reload（无Token） | /api/data 正常，/admin/reload 返回 401 | P0 | 待实现 |
| TC-MWP-015 | BodySizeLimit 对 SSE 端点跳过 | 1. 请求 SSE 端点 | 无 BodySizeLimit 检查，流式响应正常 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MWP-EDGE-001 | 空管道——无中间件注册 | 1. 空配置启动 | 服务正常运行，无中间件执行 | P1 | 待实现 |
| TC-MWP-EDGE-002 | 单个中间件注册 | 1. 仅 CORS 中间件 | 管道仅含 CORS，其余请求正常 | P2 | 待实现 |
| TC-MWP-EDGE-003 | 中间件内部异常不中断管道 | 1. Logging 中间件抛异常；2. 后续请求 | 日志记录异常但后续中间件正常执行 | P1 | 待实现 |
| TC-MWP-EDGE-004 | 相同中间件重复注册 | 1. 注册两次 CORS | 跳过或抛异常，不创建重复执行链 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-MWP-REG-001 | 缺陷 1：OPTIONS 不消耗限流配额 | 新管道与旧手动注册行为一致 | OPTIONS 正常通过 | P0 | 待实现 |
| TC-MWP-REG-002 | 缺陷 2：新增中间件自动插入正确位置 | 注册新中间件 priority=45 | 插入到 Auth(40) 和 RateLimit(50) 之间 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 优先级排序 | CORS > Auth > RateLimit > ... | TC-MWP-001 ~ 006 |
| FR-02 依赖检测 | depends_on 缺失 + 循环依赖 | TC-MWP-007 ~ 008 |
| FR-03 声明式配置 | YAML 解析 + 错误处理 | TC-MWP-009 |
| FR-04 执行顺序验证 | OPTIONS/304/无Auth 场景 | TC-MWP-010 ~ 012 |
| FR-05 可视化 | 管道图输出 | TC-MWP-013 |
| FR-06 条件启用 | 按路径/端点跳过 | TC-MWP-014 ~ 015 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 运行时动态添加/移除中间件未测试 | 热更新场景可能异常 | 添加动态注册测试 |
| G-2 | 中间件执行耗时监控未测试 | 无法发现性能瓶颈 | 集成到 Tracing 测试中 |
| G-3 | 多 worker 进程间中间件一致性 | 多进程可能顺序不一致 | 在多进程测试中验证 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/56-需求-中间件管道编排.md`*
