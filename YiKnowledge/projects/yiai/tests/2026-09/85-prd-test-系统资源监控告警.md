---

doc_type: test
title: "YA-09-81: 服务端系统资源监控 — CPU/内存/磁盘/网络利用率趋势与自动告警 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-81"
source_prds: ["85-需求-系统资源监控告警"]
source_modules: ["85-prd-task-系统资源监控告警"]
source_okr: [yiai-001]

type: test
---
# YA-09-81: 系统资源监控告警 — 测试规格
> 来源 PRD：[85-需求-系统资源监控告警.md](../../prds/2026-09/85-需求-系统资源监控告警.md)

## 一、测试范围与策略
### 1.1 测试分层
| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + psutil | 无 | 每次提交 |
| L2 集成 | pytest | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围
COV-1: CPU 使用率监控 COV-2: 内存使用率监控 COV-3: 磁盘使用率监控 COV-4: 网络 I/O 监控
COV-5: 告警阈值触发 COV-6: 趋势记录与历史查询

## 二、测试用例
### 2.1 指标采集 (L1)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RSM-001 | CPU 使用率采集正确 | 1. 读取 psutil.cpu_percent() | 0-100 范围值 | P0 | 待实现 |
| TC-RSM-002 | 内存使用率采集正确 | 1. psutil.virtual_memory() | total/used/percent 正确 | P0 | 待实现 |
| TC-RSM-003 | 磁盘使用率采集正确 | 1. psutil.disk_usage("/") | used/percent 正确，> 90% 时触发告警 | P0 | 待实现 |
| TC-RSM-004 | 网络 I/O 采集正确 | 1. psutil.net_io_counters() | bytes_sent/bytes_recv 非空 | P2 | 待实现 |

### 2.2 告警触发 (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RSM-005 | CPU > 90% 持续 5 分钟触发 CRITICAL | 1. 持续高 CPU 5min | CRITICAL 告警 | P0 | 待实现 |
| TC-RSM-006 | 内存 > 85% 触发 WARNING | 1. 内存使用 > 85% | WARNING 告警 | P0 | 待实现 |
| TC-RSM-007 | 磁盘 < 10% 剩余触发 CRITICAL | 1. 磁盘 95% 已用 | CRITICAL 告警 | P0 | 待实现 |
| TC-RSM-008 | 恢复正常后告警消除 | 1. CPU 降到 50% | 发送 recovery 通知 | P1 | 待实现 |

### 2.3 API (L2)
| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RSM-009 | GET /health/resources 返回当前指标 | 1. 查询资源端点 | {cpu, memory, disk, network, timestamp} | P0 | 待实现 |
| TC-RSM-010 | GET /health/resources/history?hours=24 返回历史 | 1. 查询 24h 历史 | 数组含 24 个数据点 | P1 | 待实现 |

## 三、边缘场景
| TC-RSM-EDGE-001 | psutil 调用失败 | mock psutil 异常 | 返回上次缓存值 + 标记 "stale" | P1 | 待实现 |

## 四、回归
| TC-RSM-REG-001 | 监控不影响服务性能 | 对比有无监控的 QPS | 差异 < 0.5% | P0 | 待实现 |

## 五、追溯矩阵
| FR-01 指标采集 | CPU/内存/磁盘/网络 | TC-RSM-001~004 |
| FR-02 告警触发 | 阈值 + 恢复 | TC-RSM-005~008 |
| FR-03 API | /health/resources | TC-RSM-009~010 |

---
*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/85-需求-系统资源监控告警.md`*

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
