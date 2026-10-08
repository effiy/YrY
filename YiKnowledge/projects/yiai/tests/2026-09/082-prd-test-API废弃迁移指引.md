---

doc_type: test
title: "YA-09-78: 服务端 API 接口废弃声明与迁移指引 — 客户端平滑升级的自动化兼容层 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-78"
source_prds: ["82-需求-API废弃迁移指引"]
source_modules: ["82-prd-task-API废弃迁移指引"]
source_okr: [yiai-001]

type: test
---
# YA-09-78: API 废弃迁移指引 — 测试规格
> 来源 PRD：[82-需求-API废弃迁移指引.md](../../prds/2026-09/82-需求-API废弃迁移指引.md)

## 一、测试范围与策略
### 1.1 测试分层
| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无 | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围
COV-1: Deprecation Warning 响应头 COV-2: 废弃参数自动映射 COV-3: Sunset 日期后拒绝
COV-4: 迁移指引端点 COV-5: 版本路由（v1/v2）

## 二、测试用例
### 2.1 废弃声明 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DPR-001 | 废弃端点返回 Deprecation header | 1. 请求废弃的 RPC method | 响应含 `Deprecation: true` 和 `Sunset: Sat, 31 Dec 2026` | P0 | 待实现 |
| TC-DPR-002 | 废弃参数 `query` → 自动映射 `filter` | 1. 使用 `query` 参数 | WARNING 日志 + 自动映射为 `filter` + Deprecation 头 | P0 | 待实现 |
| TC-DPR-003 | 非废弃请求不含 Deprecation 头 | 1. 正常 RPC 请求 | 无 Deprecation 相关 header | P0 | 待实现 |
| TC-DPR-004 | Sunset 日期过后拒绝请求 | 1. 模拟当前日期 > Sunset | 410 Gone: "API endpoint deprecated" | P0 | 待实现 |

### 2.2 迁移指引 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DPR-005 | GET /api/deprecations 返回废弃列表 | 1. 查询废弃 API 列表 | 含 `{old_method, new_method, sunset_date, migration_guide}` | P1 | 待实现 |
| TC-DPR-006 | 废弃端点 Link header 含迁移指引 | 1. 请求废弃端点 | Link: `</docs/migration>; rel="deprecation"` | P1 | 待实现 |

### 2.3 版本路由 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DPR-007 | v1 路由映射到旧实现 | 1. 请求 `/api/v1/...` | 使用 v1 Service | P0 | 待实现 |
| TC-DPR-008 | v2 路由映射到新实现 | 1. 请求 `/api/v2/...` | 使用 v2 Service | P0 | 待实现 |
| TC-DPR-009 | 默认路由使用最新版本 | 1. 不指定版本 | 使用最新 stable 版本 | P1 | 待实现 |

## 三、边缘场景
| TC-DPR-EDGE-001 | 循环废弃映射检测 | A 废弃→ B, B 废弃→ A | 检测循环依赖并报错 | P1 | 待实现 |

## 四、回归
| TC-DPR-REG-001 | 现有客户端不受 Deprecation 影响 | 所有 76 个测试 | 非废弃方法 100% 通过 | P0 | 待实现 |

## 五、追溯矩阵
| FR-01 Deprecation 头 | Deprecation + Sunset | TC-DPR-001~004 |
| FR-02 参数映射 | query→filter | TC-DPR-002 |
| FR-03 迁移指引 | /api/deprecations | TC-DPR-005~006 |
| FR-04 版本路由 | v1/v2 | TC-DPR-007~009 |

---
*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/82-需求-API废弃迁移指引.md`*

### 扩展用例
| TC-EXT-001 | 配置热重载生效 | 1. 修改配置；2. 不重启 | 新配置在下个周期生效 | P1 | 待实现 |
| TC-EXT-002 | 并发场景下状态一致 | 1. 10 并发操作 | 无竞态，结果一致 | P1 | 待实现 |
| TC-EXT-003 | 长时间运行稳定性（1h） | 1. 运行 1 小时；2. 检查资源 | 无内存泄漏，功能正常 | P1 | 待实现 |

### 扩展边缘用例
| TC-EDGE-EXT-01 | 极限值输入 | 边界值/零值/负值 | 优雅降级或拒绝 | P2 | 待实现 |
| TC-EDGE-EXT-02 | 高负载下行为 | 1000 并发请求 | 功能正常，延迟在可接受范围 | P2 | 待实现 |

### 扩展回归
| TC-REG-EXT-01 | 引入后现有功能不受影响 | 运行全部现有测试 | 100% 通过 | P0 | 待实现 |

## 覆盖缺口
| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 生产级压测未覆盖 | 实际负载差异 | 在压力测试环境中补充 |
| G-2 | 跨平台兼容性 | Linux/macOS 差异 | 在 CI 多平台矩阵中验证 |
