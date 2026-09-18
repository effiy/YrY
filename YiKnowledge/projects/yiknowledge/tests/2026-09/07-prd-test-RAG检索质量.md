---
doc_type: test
title: "YK-09-04: RAG 检索质量监控 — 测试用例"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-04"
source_prds: ["07-监控-RAG检索质量"]
source_modules: ["07-prd-task-RAG检索质量"]
source_okr: [yiknowledge-001]
---

# YK-09-04: RAG 检索质量监控 — 测试用例

> 来源 PRD：[07-监控-RAG检索质量.md](../../prds/2026-09/07-监控-RAG检索质量.md)
> 开发方案：[07-prd-task-RAG检索质量.md](../../devs/2026-09/07-prd-task-RAG检索质量.md)
> 需求编号：YK-09-04 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖维度校验、空结果根因分类、滑动窗口告警、企微通知。

---

## 一、测试范围

| 组件 | 测试重点 |
|------|---------|
| 维度校验 | 构建时检测、运行时检测、自动重建索引 |
| 根因分类 | 5 种根因标签准确性 |
| 滑动窗口 | 5 分钟窗口统计、阈值 20%、过期清理 |
| 告警推送 | 企微 Markdown 格式、10 分钟冷却 |

---

## 二、单元测试 — 根因分类

| 编号 | 用例 | 条件 | 预期标签 |
|------|------|------|---------|
| UT-RC-01 | 知识库无相关内容 | result=0, dim=768=768, docs>0, no_filter, no_error | `no_content` |
| UT-RC-02 | 维度不匹配 | query_dim=1024, index_dim=768 | `dimension_mismatch` |
| UT-RC-03 | 索引损坏 | result=0, total_docs=0 | `index_corrupt` |
| UT-RC-04 | 标签过滤过度 | result=0 with filter, result>0 without filter | `filter_too_strict` |
| UT-RC-05 | 系统错误 | result=0, error=Exception("timeout") | `system_error` |

---

## 三、单元测试 — 滑动窗口与告警

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-SW-01 | 窗口内空结果率 < 20% | 100 次查询，10 次空结果（10%） | 不触发告警 |
| UT-SW-02 | 窗口内空结果率 > 20% | 100 次查询，25 次空结果（25%） | 触发告警 |
| UT-SW-03 | 过期数据被清理 | 插入 6 分钟前的记录 | `should_alert()` 不统计过期数据 |
| UT-SW-04 | 告警冷却 10 分钟 | 同一标签 5 分钟内 2 次触发 | 仅发送 1 次告警 |
| UT-SW-05 | ring_buffer 容量限制 | 插入 > 10000 条 | 最早的记录被淘汰（无内存泄漏） |
| UT-DM-01 | 维度一致 → 不告警 | query_dim=768, index_dim=768 | 无 `dimension_mismatch` 告警 |
| UT-DM-02 | 维度不一致 → 重建索引 | query_dim=1024, index_dim=768 | 清空旧索引 + WARNING |

---

## 四、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-MN-01 | 模拟维度不匹配 → 全链路告警 | 修改 config → 切换 embed_model → 触发检索 → 企微收到告警 |
| IT-MN-02 | 模拟索引损坏 → 根因分类 | 删除索引文件 → 检索 → `classify_empty_result` 返回 `index_corrupt` |
| IT-MN-03 | 模拟空结果率超阈值 | 连续 30 次空结果查询 → 告警触发 |
| IT-MN-04 | `record_query` 非阻塞 | 100 并发检索 → 检索延迟不受 `record_query` 影响 |
| IT-MN-05 | 定期巡检任务 | 等待 apscheduler 触发 → 巡检日志输出 |

---

## 五、性能测试

| 编号 | 场景 | 目标 |
|------|------|------|
| PT-01 | `record_query` 耗时 | < 1ms |
| PT-02 | `classify_empty_result` 耗时 | < 1ms |
| PT-03 | 滑动窗口 `should_alert` 耗时（1000 条窗口数据） | < 5ms |

---

## 六、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 监控器导致检索崩溃 | `record_query` 抛异常未捕获 → `rag_query` 500 |
| S1 — 严重 | 根因分类错误 | 维度不匹配被误判为 `no_content` → 告警不触发 |
| S2 — 一般 | 告警格式问题 | 企微消息缺少建议操作步骤 |
| S3 — 轻微 | 冷却时间偏差 | 告警实际冷却 12 分钟（预期 10） |

---

## 七、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| 根因分类 | 待实施 | 5 种标签纯函数 |
| 滑动窗口 | 待实施 | 纯数据结构 |
| 维度校验 | 待实施 | mock embed_model |
| 企微告警 | 待实施 | mock 企微 Webhook |
| 集成测试 | 待实施 | httpx + 真实 MDB + mock Ollama |

---