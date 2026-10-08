---

doc_type: test
title: "知识库文档 + 基础设施集成 — 测试方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer, leader]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["87-prd-task-知识库文档与基础设施"]

type: test
---

# 知识库文档 + 基础设施集成 — 测试方案

> 来源模块：[87-prd-task-知识库文档与基础设施](../../devs/2026-09/87-prd-task-知识库文档与基础设施.md)

---

## TC-DO-001: PRD 文档完整性

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 打开 `53-prd-YiAi后端集成.md` | frontmatter 完整（20 字段） |
| 2 | 检查目录 | 11 个章节（sec-0 ~ sec-11） |
| 3 | 检查功能需求 | 10 项 FR-1 ~ FR-10，每项有验收标准 |
| 4 | 检查交叉引用 | 实现方案 → 80-xxx.md, 验证方案 → 95-xxx.md |

## TC-DO-002: 开发方案完整性

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 主方案 `80-prd-task-YiAi后端集成.md` | 34 文件源码索引表 |
| 2 | 子模块 81-87 全部存在 | 7 个文件 |
| 3 | 每个子模块含源码索引 | 文件路径 + 说明 + 行数 |
| 4 | 每个子模块含实施进度 | 子任务清单 + 状态 |

## TC-DO-003: 测试方案完整性

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 主测试 `0095-prd-test-YiAi后端集成.md` | 7 大测试域，25 个测试用例 |
| 2 | 子模块测试 100-106 全部存在 | 7 个文件 |
| 3 | 每个测试用例含步骤/操作/预期 | 表格格式 |
| 4 | 测试环境要求 | 依赖列表完整 |

## TC-DO-004: CLAUDE.md 质量

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 检查文件行数 | 536 行（与 YiVad 同级） |
| 2 | 检查目录完整性 | 11 个大段（基础信念 ~ 指引） |
| 3 | 检查模块边界 | 3 张表（Rust/React/YiAi） |
| 4 | 检查数据流 | 3 个完整流程（翻译/OCR/插件） |
| 5 | 检查降级策略 | 8 场景 |
| 6 | 检查参考指引 | 30+ 条链接 |

## TC-DO-005: 文档交叉引用

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | PRD → 开发方案链接 | `../../devs/2026-09/80-...` 可访问 |
| 2 | PRD → 测试方案链接 | `../../tests/2026-09/95-...` 可访问 |
| 3 | 开发方案 → PRD 链接 | `../../prds/2026-09/53-...` 可访问 |
| 4 | CLAUDE.md → YiKnowledge 链接 | 30+ 条路径有效 |

---

## TC-IN-001: 共享客户端单例

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `get_shared_client()` | 返回 `httpx.AsyncClient` |
| 2 | 再次调用 `get_shared_client()` | 返回同一个实例（`is` 判断） |
| 3 | 检查连接池配置 | `max_connections=50, max_keepalive_connections=20` |

## TC-IN-002: 共享客户端生命周期

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 正常使用客户端 | 连接池正常 |
| 2 | 停止 YiAi 服务（触发 shutdown） | — |
| 3 | 检查 `_shared_http_client` | `None`（已关闭） |
| 4 | 检查日志 | "Shared HTTP client close" 或 skip |

## TC-IN-003: 现有模块回归

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `python -m pytest tests/ -q` | 406+ passed |
| 2 | 检查 `shared/runtime.py` 测试 | `test_config.py` 通过 |
| 3 | 检查 `server/lifespan.py` 测试 | 无新增失败 |

## TC-IN-004: YiKnowledge INDEX 更新

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 检查 `YiKnowledge/INDEX.md` | 项目数量从 4 更新为 5 |
| 2 | 检查 `YiKnowledge/projects/INDEX.md` | 包含 YiPot 条目 |