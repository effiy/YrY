---

doc_type: test
title: "YA-09-74: 服务端 Event Loop 阻塞检测 — asyncio 任务队列积压监控与告警 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-74"
source_prds: ["78-需求-EventLoop阻塞检测"]
source_modules: ["78-prd-task-EventLoop阻塞检测"]
source_okr: [yiai-001]

type: test
---
# YA-09-74: Event Loop 阻塞检测 — 测试规格
> 来源 PRD：[78-需求-EventLoop阻塞检测.md](../../prds/2026-09/78-需求-EventLoop阻塞检测.md)

## 一、测试范围与策略
### 1.1 测试分层
| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + asyncio | 无 | 每次提交 |
| L2 集成 | pytest | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围
COV-1: event loop 延迟监控（monitor task）COV-2: 慢回调检测（> 100ms）COV-3: 积压任务队列检测 COV-4: 告警触发 COV-5: GC 暂停检测

## 二、测试用例
### 2.1 延迟监控 (L1)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-ELP-001 | 正常时 event loop 延迟 < 10ms | 1. 启动 monitor task | 持续记录延迟 < 10ms | P0 | 待实现 |
| TC-ELP-002 | 同步阻塞代码检测（> 100ms） | 1. 执行 `time.sleep(0.5)` | 检测到阻塞，日志 "EventLoop blocked for 500ms" | P0 | 待实现 |
| TC-ELP-003 | 延迟 > 200ms 触发 WARNING 告警 | 1. 模拟 300ms 阻塞 | 触发 WARNING，通知运维 | P0 | 待实现 |
| TC-ELP-004 | 延迟 > 1000ms 触发 CRITICAL 告警 | 1. 模拟 2s 阻塞 | CRITICAL 告警，可能触发健康检查降级 | P0 | 待实现 |
| TC-ELP-005 | monitor task 自身不阻塞 event loop | 1. 长期运行监控；2. 检查 CPU | monitor 开销 < 1% CPU | P1 | 待实现 |

### 2.2 任务队列 (L1)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-ELP-006 | 积压任务 > 阈值触发告警 | 1. `len(asyncio.all_tasks()) > 1000` | WARNING，含任务示例 | P0 | 待实现 |
| TC-ELP-007 | GC 暂停检测（gc.callback） | 1. 触发 GC；2. 检测暂停时间 | 记录 GC 暂停时间（如 > 50ms） | P1 | 待实现 |

### 2.3 API 端点 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-ELP-008 | GET /health/debug/eventloop 返回状态 | 1. 请求调试端点 | 返回 {avg_latency_ms, max_latency_ms, pending_tasks, blocked_count} | P0 | 待实现 |

## 三、边缘场景
| TC-ELP-EDGE-001 | 高频率监控间隔（10ms） | monitor_interval=10ms | 不显著增加 CPU 负载 | P2 | 待实现 |

## 四、回归
| TC-ELP-REG-001 | 监控不影响服务吞吐量 | 对比有无监控的 QPS | 差异 < 1% | P0 | 待实现 |

## 五、追溯矩阵
| FR-01 延迟监控 | monitor task | TC-ELP-001~004 |
| FR-02 任务积压 | all_tasks 检测 | TC-ELP-006 |
| FR-03 API 端点 | /health/debug/eventloop | TC-ELP-008 |
| FR-04 GC 检测 | gc.callback | TC-ELP-007 |

---
*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/78-需求-EventLoop阻塞检测.md`*

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
