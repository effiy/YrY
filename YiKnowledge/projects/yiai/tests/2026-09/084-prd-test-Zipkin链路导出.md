---

doc_type: test
title: "YA-09-80: 服务端端到端请求链路追踪与性能分析 — OpenTelemetry Zipkin 导出 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-80"
source_prds: ["84-需求-Zipkin链路导出"]
source_modules: ["84-prd-task-Zipkin链路导出"]
source_okr: [yiai-001]

type: test
---
# YA-09-80: Zipkin 链路导出 — 测试规格
> 来源 PRD：[84-需求-Zipkin链路导出.md](../../prds/2026-09/84-需求-Zipkin链路导出.md)

## 一、测试范围与策略
### 1.1 测试分层
| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + moto | 无 | 每次提交 |
| L2 集成 | pytest + Zipkin | Zipkin 运行中 | PR / 发布前 |

### 1.2 覆盖范围
COV-1: Span 创建与嵌套 COV-2: Zipkin JSON 格式导出 COV-3: HTTP header 注入/提取
COV-4: 采样率控制 COV-5: MongoDB/RPC/Ollama span

## 二、测试用例
### 2.1 Span 创建 (L1)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-ZPK-001 | RPC span 正确嵌套 | 1. 请求→data_service→MongoDB | root span 含 2 个子 span | P0 | 待实现 |
| TC-ZPK-002 | Span 含 traceId + spanId + parentSpanId | 1. 检查 span 字段 | 三个 ID 格式为 16 字符 hex | P0 | 待实现 |
| TC-ZPK-003 | Span 含时间戳 + duration | 1. 检查 span | timestamp (微秒) + duration 正确 | P0 | 待实现 |
| TC-ZPK-004 | Span 含 tags（http.method, db.collection） | 1. 检查 span tags | 自动填充 HTTP/DB 相关 tags | P1 | 待实现 |

### 2.2 导出格式 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-ZPK-005 | Zipkin JSON v2 格式正确 | 1. 导出 span；2. 验证 JSON schema | 符合 Zipkin JSON v2 规范 | P0 | 待实现 |
| TC-ZPK-006 | 采样率 100% 全部导出 | 1. sampler=always_on | 所有请求生成 span | P1 | 待实现 |
| TC-ZPK-007 | 采样率 10% 仅部分导出 | 1. sampler=10% | 约 10% 的请求有 span | P1 | 待实现 |

### 2.3 Header 传播 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-ZPK-008 | B3 header 格式注入 | 1. 请求含 X-B3-TraceId | span traceId 与 header 一致 | P0 | 待实现 |
| TC-ZPK-009 | 无 header 时自动生成 traceId | 1. 请求无 trace header | 自动生成新 traceId | P0 | 待实现 |

## 三、边缘场景
| TC-ZPK-EDGE-001 | Zipkin 不可用时降级 | 1. Zipkin 宕机；2. 请求 | 不丢请求，span 丢弃但业务正常 | P0 | 待实现 |
| TC-ZPK-EDGE-002 | 大量 span（1000+）导出性能 | 1000 span 批量导出 | 导出 < 100ms | P2 | 待实现 |

## 四、回归
| TC-ZPK-REG-001 | Tracing 不影响请求延迟 | 对比有无 Tracing 的 P99 | 差异 < 5ms | P0 | 待实现 |

## 五、追溯矩阵
| FR-01 Span 创建 | 嵌套 + 字段 | TC-ZPK-001~004 |
| FR-02 导出 | JSON v2 + 采样 | TC-ZPK-005~007 |
| FR-03 Header | B3 注入/提取 | TC-ZPK-008~009 |

---
*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/84-需求-Zipkin链路导出.md`*

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
