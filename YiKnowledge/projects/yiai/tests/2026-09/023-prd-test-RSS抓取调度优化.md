---

doc_type: test
title: "YA-09-19: RSS 抓取调度优化 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-19"
source_prds: ["23-需求-RSS抓取调度优化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-19: RSS 抓取调度优化 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 Feed 健康监控、自适应轮询间隔、内容去重、失败重试策略。

> 来源 PRD：[23-需求-RSS抓取调度优化.md](../../prds/2026-09/23-需求-RSS抓取调度优化.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 去重算法、调度逻辑 | pytest | 内容哈希去重、自适应间隔计算、重试退避 |
| L2 集成测试 | 真实 Feed 抓取 + MongoDB | pytest-asyncio + motor + feedparser | 抓取→解析→存储→去重 全链路 |

### 1.2 自适应轮询策略

| Feed 健康度 | 更新频率 | 轮询间隔 |
|-----------|---------|---------|
| 健康（按时更新） | 日更 | 60 min |
| 活跃（频繁更新） | 时更 | 15 min |
| 不活跃 | 周更 | 360 min |
| 失效 | 连续 3 次失败 | 1440 min (24h) |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import hashlib
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def sample_feed_entries():
    """示例 RSS Feed 条目。"""
    return [
        {"title": "RAG 优化技巧", "link": "https://example.com/rag-tips", "published": "2026-09-22", "summary": "提升 RAG 性能的 10 个技巧"},
        {"title": "Docker Compose 最佳实践", "link": "https://example.com/docker-best", "published": "2026-09-21", "summary": "Docker 编排指南"},
        {"title": "RAG 优化技巧", "link": "https://example.com/rag-tips", "published": "2026-09-22", "summary": "提升 RAG 性能的 10 个技巧"},  # 重复
    ]

@pytest.fixture
def feed_sources():
    """RSS 源配置。"""
    return [
        {"url": "https://example.com/feed1.xml", "name": "技术博客 A", "poll_interval": 60, "category": "tech"},
        {"url": "https://example.com/feed2.xml", "name": "AI 周刊", "poll_interval": 15, "category": "ai"},
        {"url": "https://example.com/feed3.xml", "name": "失效源", "poll_interval": 60, "category": "dead"},
    ]

@pytest.fixture
def feed_error_scenarios():
    """Feed 错误场景。"""
    return {
        "timeout": {"error": "ConnectionTimeout", "retry_after": 60},
        "not_found": {"error": "HTTP 404", "retry_after": 1440},
        "parse_error": {"error": "XML Parse Error", "retry_after": 360},
        "server_error": {"error": "HTTP 500", "retry_after": 300},
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 内容去重

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RS-01 | 相同 title+link → 去重 | sample_feed_entries | 1. 抓取 3 条（含 1 条重复）<br>2. 检查存储结果 | 仅 2 条入库，1 条被去重 | P0 |
| TC-RS-02 | 内容哈希去重 | 相同内容、不同 link | 1. 两条内容相同但 link 不同<br>2. 检查去重 | 基于 content hash 识别为重复 | P1 |
| TC-RS-03 | 更新后的条目不被去重 | 已存条目，新抓取内容有更新 | 1. 旧条目已存在<br>2. 新抓取 title 相同但 summary 更新 | 更新旧条目（不视为重复跳过） | P1 |
| TC-RS-04 | 空内容条目 | summary="" | 1. 抓取到空内容的条目<br>2. 检查处理 | 正常入库，不抛异常 | P2 |

### 3.2 自适应轮询

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RS-05 | 活跃源短间隔 | Feed 每小时更新 | 1. 连续 3 次抓取都有新内容<br>2. 检查间隔调整 | 间隔从 60min 缩短到 15min | P1 |
| TC-RS-06 | 不活跃源长间隔 | Feed 7 天未更新 | 1. 连续 3 次无新内容<br>2. 检查间隔调整 | 间隔从 60min 延长到 360min | P1 |
| TC-RS-07 | 失效源最长间隔 | Feed 连续 3 次抓取失败 | 1. 连续 3 次失败<br>2. 检查间隔 | 间隔设为 1440min (24h) | P1 |
| TC-RS-08 | 恢复后间隔回归 | 失效源恢复后 | 1. 失效源恢复更新<br>2. 检查间隔 | 间隔逐步回归正常 | P2 |

### 3.3 失败重试

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RS-09 | 临时错误退避重试 | 超时 1 次 | 1. 第 1 次超时<br>2. 60s 后重试<br>3. 重试成功 | 重试成功，日志记录恢复 | P1 |
| TC-RS-10 | HTTP 404 快速标记失效 | Feed 返回 404 | 1. 抓取返回 404<br>2. 检查 Feed 状态 | 标记为 "dead"，不继续重试 | P1 |
| TC-RS-11 | 指数退避重试 | 连续失败 | 1. 第 1 次失败→30s<br>2. 第 2 次→60s<br>3. 第 3 次→120s | 退避间隔指数增长 | P2 |

### 3.4 Feed 健康监控

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RS-12 | 健康仪表盘数据 | 多个 Feed 源 | 1. 查询 Feed 健康状态<br>2. 检查指标 | 含活跃/失效/错误计数/最后成功时间 | P2 |
| TC-RS-13 | 失效 Feed 告警 | Feed 状态变 dead | 1. 多个源标记失效<br>2. 检查告警 | WARNING 日志 + 可配置告警通知 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-RS-01 | Feed URL 格式无效 | url="not-a-valid-url" | 拒绝，标记 "invalid" | P1 |
| EG-RS-02 | 巨型 Feed (> 100MB) | 超大 XML 文件 | 限制解析大小，截断或拒绝 | P2 |
| EG-RS-03 | 编码错误 (Latin-1) | XML 声明 UTF-8 但实际 Latin-1 | 自动检测编码并正确解析 | P1 |
| EG-RS-04 | 并发抓取多个源 | 10 个源同时抓取 | 限流控制，不超过 5 并发 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-RS-01 | 现有 RSS 数据不受影响 | 去重/轮询优化 | RSS 条目存储格式不变 | P1 |
| RG-RS-02 | YiVad RSS 列表正常显示 | 优化后 | YiVad RSS 页面数据显示正确 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 内容去重 | TC-RS-01 ~ TC-RS-04 | title+link/哈希/更新/空内容 |
| FR2: 自适应轮询 | TC-RS-05 ~ TC-RS-08 | 活跃/不活跃/失效/恢复 |
| FR3: 失败重试 | TC-RS-09 ~ TC-RS-11 | 退避/404/指数 |
| FR4: 健康监控 | TC-RS-12, TC-RS-13 | 仪表盘/告警 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 真实 Feed 可用性 | mock 数据 vs 真实 RSS 源的差异 | 添加真实 Feed 源的定时集成测试 |
| RSS 2.0/Atom 兼容 | 仅测试 RSS 2.0 | 添加 Atom Feed 解析测试 |
| 抓取频率限流 | 高频抓取可能被源站封禁 | 添加 HTTP 429 响应处理和限速测试 |