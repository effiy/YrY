---

doc_type: test
title: "YA-08-03: 测试覆盖率扩展 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-03"
source_prds: ["03-需求-测试覆盖率扩展"]
source_modules: ["03-prd-task-测试覆盖率扩展"]
source_okr: [yiai-003]

type: test
---

# YA-08-03: 测试覆盖率扩展 — 测试规格

> 来源 PRD：[03-需求-测试覆盖率扩展.md](../../prds/2026-08/03-需求-测试覆盖率扩展.md)
> 开发方案：[03-prd-task-测试覆盖率扩展.md](../../devs/2026-08/03-prd-task-测试覆盖率扩展.md)
> 需求编号：YA-08-03 -- 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。验证 pytest 基础设施、540 测试、分层结构、覆盖率门禁。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无外部依赖 | 每次提交 |
| L2 集成 | pytest + mongomock/httpx | MongoDB test 实例 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `shared/` 模块覆盖率 100% | L1 |
| COV-2 | `data/` 模块覆盖率 >= 85% | L1 + L2 |
| COV-3 | `domain/ai/` 覆盖率 >= 80% | L1 + L2 |
| COV-4 | `domain/rag/` 覆盖率 >= 75% | L1 + L2 |
| COV-5 | `domain/files/` 覆盖率 >= 70% | L2 |
| COV-6 | `services/` 覆盖率 >= 50% | L1 + L2 |
| COV-7 | 测试目录 4 层结构（unit/integration/api/agent） | 结构检查 |
| COV-8 | conftest.py fixtures 可用 | L1 |
| COV-9 | CI 覆盖率门禁（--cov-fail-under=70） | CI 配置 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `test_db` | mongomock 或 test MongoDB 实例 | 所有集成测试 |
| `mock_mongo` | `unittest.mock` 替换 Motor | 单元测试 |
| `mock_ollama_runtime` | Mock OllamaRuntime | Agent 单元测试 |

---

## 二、覆盖率验证

### 2.1 shared/ 模块（COV-1 . L1）

| 编号 | 模块 | 目标覆盖率 | 验证方法 | 状态 |
|------|------|----------|---------|------|
| CV-01 | `shared/error_codes.py` | 100% | `pytest --cov=src/shared/error_codes --cov-report=term` | 已完成 |
| CV-02 | `shared/exceptions.py` | 100% | 同上 | 已完成 |
| CV-03 | `shared/response.py` | 100% | 同上 | 已完成 |
| CV-04 | `shared/utils.py` | 100% | 同上 | 已完成 |
| CV-05 | `shared/config.py` | >= 90% | 同上 | 已完成 |
| CV-06 | `shared/sse_utils.py` | 100% | 同上 | 已完成 |
| CV-07 | `shared/logging.py` | >= 80% | 同上 | 待实现 |

### 2.2 data/ 模块（COV-2 . L1 + L2）

| 编号 | 模块 | 目标覆盖率 | 验证方法 | 状态 |
|------|------|----------|---------|------|
| CV-08 | `data/database.py` | >= 85% | 集成测试 + MongoDB | 待实现 |
| CV-09 | `data/repository.py` | >= 85% | _build_filter 全路径覆盖 | 部分完成（33%） |
| CV-10 | `data/sessions.py` | >= 70% | 集成测试 | 待实现 |
| CV-11 | `data/agent_sessions.py` | >= 70% | 集成测试 | 待实现 |
| CV-12 | `data/chat_records.py` | >= 70% | 集成测试 | 待实现 |

### 2.3 domain/ 模块（COV-3 + COV-4 + COV-5 . L1 + L2）

| 编号 | 模块 | 目标覆盖率 | 验证方法 | 状态 |
|------|------|----------|---------|------|
| CV-13 | `domain/ai/tools.py` | >= 80% | 单元测试 | 部分完成（27%） |
| CV-14 | `domain/ai/agent.py` | >= 70% | stub 测试 | 部分完成 |
| CV-15 | `domain/ai/chat.py` | >= 70% | 单元测试 | 待实现 |
| CV-16 | `domain/rag/engine.py` | >= 75% | 集成测试 | 待实现 |
| CV-17 | `domain/rag/indexer.py` | >= 75% | 集成测试 | 待实现 |
| CV-18 | `domain/files/storage.py` | >= 70% | 集成测试 | 待实现 |
| CV-19 | `domain/files/local.py` | >= 70% | 单元测试 | 待实现 |

---

## 三、pytest 基础设施验证（COV-7 + COV-8 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-PT-01 | `python -m pytest` 可执行 | 1. 运行 `cd YiAi && python -m pytest tests/ -v` | >= 540 个测试通过（当前 540），0 失败 | P0 | 已完成 |
| UT-PT-02 | `--cov` 覆盖率报告生成 | 1. 运行 `pytest --cov=src --cov-report=html` | html 报告生成到 `htmlcov/` | P0 | 已完成 |
| UT-PT-03 | CI 门禁 lines >= 70% | 1. 运行 `pytest --cov=src --cov-fail-under=70` | 低于 70% → CI 失败 | P0 | 待实现 |
| UT-PT-04 | `YiAi_ENV=test` 隔离 | 1. 设置测试环境变量；2. 运行测试 | 测试不写入生产 MongoDB | P0 | 已完成 |
| UT-PT-05 | 单元测试不依赖外部服务 | 1. 关闭 MongoDB + Ollama；2. 运行 `pytest tests/unit/ -v` | 全部通过，无连接错误 | P0 | 待实现 |
| UT-PT-06 | `pytest -m "not slow and not integration"` 快速运行 | 1. 运行仅单元测试 | <= 30s 完成 | P1 | 待实现 |
| UT-PT-07 | conftest.py fixtures 可重用 | 1. 检查 `mock_mongo`、`mock_ollama_runtime`、`test_db` 等 fixtures | 多个测试文件可复用，无冲突 | P1 | 待实现 |
| UT-PT-08 | 测试目录 4 层结构正确 | 1. 检查 `tests/unit/`、`tests/integration/`、`tests/api/`、`tests/agent/` | 目录结构存在，文件分布合理 | P0 | 待实现 |
| UT-PT-09 | pytest-cov 不统计 `@dataclass` 的 `__init__` | 1. 检查 shared/error_codes.py 覆盖率 | 不低于 90%（排除数据类装饰器误导） | P1 | 待实现 |
| UT-PT-10 | 集成测试数据隔离 | 1. 两个集成测试先后运行；2. 检查数据 | 第二个测试看不到第一个的数据（fixture teardown 清理） | P0 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-COV-EDGE-001 | 所有测试文件可被 pytest 收集 | 1. `pytest --collect-only` | 无 collection error | P0 | 待实现 |
| TC-COV-EDGE-002 | 测试文件不含语法错误 | 1. `python -m py_compile tests/**/*.py` | 全部编译通过 | P1 | 待实现 |
| TC-COV-EDGE-003 | 测试标记（markers）可正确过滤 | 1. `pytest -m "integration"`；2. `pytest -m "not integration"` | 前者仅运行集成测试，后者跳过集成测试 | P1 | 待实现 |
| TC-COV-EDGE-004 | pytest-asyncio event_loop 隔离 | 1. 多个测试文件使用 async fixtures | 无 `Event loop is closed` 错误 | P1 | 待实现 |
| TC-COV-EDGE-005 | mongomock 与 Motor 行为一致性 | 1. 对比 `insert_one` 返回的 `inserted_id` 类型 | mongomock 返回 str，Motor 返回 ObjectId；测试应兼容 | P1 | 待实现 |
| TC-COV-EDGE-006 | 覆盖率统计排除 `__init__.py` 和 `conftest.py` | 1. 运行 `--cov=src`；2. 检查实际覆盖率 | 不因 init 文件拉低覆盖率 | P2 | 待实现 |

---

## 五、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-COV-REG-001 | 缺陷 1：pytest-asyncio event_loop 泄漏 | CI 中运行全部 540 测试 | data/ 模块最后 3 个测试不报 `Event loop is closed` | P1 | 待实现 |
| TC-COV-REG-002 | 缺陷 4：parametrize + asyncio 参数互换 | 参数化异步测试的 test_name/expected | 值正确，不互换 | P1 | 待实现 |
| TC-COV-REG-003 | 缺陷 5：mocker.patch 在 async 函数中返回 coroutine | 使用 `mocker.patch.object` 替代 | `await` 正常获得 mock 返回值 | P1 | 待实现 |
| TC-COV-REG-004 | 缺陷 7：CI 覆盖率 69.8% 因 init 文件 | 排除 __init__.py 后的覆盖率 | >= 70% | P1 | 待实现 |

---

## 六、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 shared/ 覆盖率 100% | error_codes/exceptions/response/utils/sse | CV-01 ~ 07 |
| FR-02 data/ 覆盖率 >= 85% | database/repository/sessions | CV-08 ~ 12 |
| FR-03 domain/ 覆盖率分层达标 | ai/rag/files 各模块 | CV-13 ~ 19 |
| FR-04 pytest 基础设施 | 运行/覆盖率报告/CI/隔离 | UT-PT-01 ~ 10 |
| FR-05 测试目录 4 层结构 | unit/integration/api/agent | UT-PT-08 |
| FR-06 CI 覆盖率门禁 | --cov-fail-under=70 | UT-PT-03 |

---

## 七、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | `server/routes/` 覆盖率 < 30% | 路由层无测试保护 | 补充 API 测试层（`tests/api/`） |
| G-2 | `services/` 覆盖率 < 50% | 服务编排层无测试 | 补充 mock 集成测试 |
| G-3 | `.github/workflows/ci.yml` 未创建 | 无 CI 自动化 | 创建 CI 流水线 |
| G-4 | 覆盖率报告可视化缺失 | 覆盖率趋势不可见 | 集成 Codecov 或 HTML 报告 |
| G-5 | 无性能基准测试 | 无法量化覆盖率增长对测试速度的影响 | 建立 pytest-benchmark 基准 |