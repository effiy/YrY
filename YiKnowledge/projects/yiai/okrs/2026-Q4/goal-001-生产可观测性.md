---
type: okr-goal
id: yiai-q4-001
title: "生产级可观测性与智能运维"
status: planned
period: "2026 Q4"
owner: ""
project: YiAi
project_id: yiai
progress: 10
updated: 2026-09-14
kr1: "全链路 TraceID 透传 — 从 RPC 入口 → Service → MongoDB/Ollama 的端到端追踪"
kr1_completion: 5
kr2: "智能告警路由 — 基于错误码/服务/严重级别的分级告警 + 通知偏好中心"
kr2_completion: 10
kr3: "健康度仪表盘 — Dashboard 健康聚合 API 覆盖所有 18 个路由模块"
kr3_completion: 15
kr4: "性能剖析火焰图 — 每个端点的 P50/P95/P99 延迟 + 慢查询分析"
kr4_completion: 0
kr5: "自愈恢复机制 — 连接池耗尽/Cursor 泄漏/EventLoop 阻塞的自动检测与恢复"
kr5_completion: 10
metric1_id: "yiai-q4-m01"
metric1_desc: "TraceID 透传覆盖率"
metric1_current: "30%"
metric1_target: "100%"
metric2_id: "yiai-q4-m02"
metric2_desc: "告警延迟 (P95)"
metric2_current: "5min"
metric2_target: "<30s"
metric3_id: "yiai-q4-m03"
metric3_desc: "服务可用性 SLA"
metric3_current: "99.5%"
metric3_target: "99.9%"
related_prds:
  - projects/yiai/prds/2026-09/35-需求-结构化日志.md
  - projects/yiai/prds/2026-09/36-需求-告警路由.md
  - projects/yiai/prds/2026-09/37-需求-性能剖析火焰图.md
  - projects/yiai/prds/2026-09/51-需求-健康度评分卡.md
  - projects/yiai/prds/2026-09/84-需求-Zipkin链路导出.md
  - projects/yiai/prds/2026-09/85-需求-系统资源监控告警.md
  - projects/yiai/prds/2026-09/93-需求-自愈恢复机制.md
  - projects/yiai/prds/2026-09/106-需求-监控与告警体系.md
  - projects/yiai/prds/2026-09/113-需求-全链路TraceID透传.md
---

# 生产级可观测性与智能运维

> Q4 核心运维目标。在 Q3 稳定性修复的基础上，建立完整的可观测性体系——从日志、指标、追踪三个维度覆盖所有服务模块，实现智能告警与自愈恢复，将服务可用性从 99.5% 提升至 99.9%。

## 背景

Q3 完成了稳定性修复（连接池优化、Cursor 泄漏清零、超时保护），但可观测性仍处于初级阶段：日志缺乏结构化、告警依赖人工巡检、性能瓶颈不可见。Q4 需要将运维从"被动响应"升级到"主动发现 + 自动恢复"。

## 关键结果

1. **全链路 TraceID 透传** — 从 RPC 入口 → Service → MongoDB/Ollama 的端到端追踪，支持 Zipkin 导出。当前仅部分端点有 TraceID，目标 100% 覆盖 18 个路由模块。
2. **智能告警路由** — 基于错误码（1001~9999）/服务/严重级别的分级告警，集成通知偏好中心（邮件 + 企微 + Webhook），告警延迟从 5min 降至 <30s。
3. **健康度仪表盘** — Dashboard 健康聚合 API（`src/server/routes/dashboard/`）覆盖所有路由模块，含连接池利用率、RAG 索引延迟、Agent 任务成功率等核心指标。
4. **性能剖析** — 每个关键端点的 P50/P95/P99 延迟火焰图，慢查询（>100ms）自动采样与分析。
5. **自愈恢复** — 连接池耗尽自动扩容、Cursor 泄漏自动回收、EventLoop 阻塞检测与重启。

## 影响

- 服务可用性 99.5% → 99.9%（季度宕机时间 < 2h）
- 故障发现时间 5min → <30s
- 运维人效提升 3x（自动化巡检替代人工）
- 为 YiVad/YiPet 提供实时健康状态 API