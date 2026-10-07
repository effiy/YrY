---

doc_type: test
title: 'YA-09-150: 定时报告生成 — 多类型报告 + Jinja2 双格式渲染 + 多通道投递 + 异步队列 — 测试规格'
status: 待开始
priority: P2
owner: 陈铭
roles:
- engineer
- qa
created: 2026-09-11
updated: '2026-09-23'
project: YiAi
project_id: yiai
prd_month: '202609'
prd_task_id: YA-09-150
source_prds:
- 156-需求-定时报告生成
source_modules: []
source_okr:
- yiai-001

type: test
---

# YA-09-150: 定时报告生成 — 测试规格

> 来源 PRD：[156-需求-定时报告生成.md](../../prds/2026-09/156-需求-定时报告生成.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **报告定义**：`src/domain/reports/definitions.py`（新建）— `ReportDefinition` 数据类，定义报告类型、指标、cron 表达式
- **数据聚合**：`src/domain/reports/aggregators.py`（新建）— `HealthAggregator`, `UsageAggregator`, `RAGQualityAggregator`, `ErrorAggregator`, `StorageAggregator`
- **模板渲染**：`src/domain/reports/renderer.py`（新建）— Jinja2 双格式（HTML + Markdown）渲染器
- **投递通道**：`src/domain/reports/delivery.py`（新建）— 邮件、Webhook、文件存储三种投递方式
- **调度集成**：`src/domain/reports/scheduler.py`（新建）— apscheduler cron 定时触发
- **排除范围**：邮件投递的 SM

## 二、测试数据 / Fixtures

- `seed_metrics_data` — 测试数据 fixture
- `report_definition` — 测试数据 fixture


## 三、详细测试用例

### TC-01: 请求成功率聚合
- **P0** | 返回 `95.0`（百分比） | 聚合使用 MongoDB 管道（`$group` + `$cond`），非全表扫描

### TC-02: 平均响应时间聚合
- **P0** | 返回平均值（精确到 ms） | 同时返回 P95 值

### TC-03: 未解决错误统计
- **P1** | 

### TC-04: Jinja2 HTML 模板渲染
- **P0** | 返回有效 HTML 字符串 | HTML 中包含结构化数据（标题、表格、指标值）

### TC-05: Jinja2 Markdown 模板渲染
- **P0** | 返回有效 Markdown 字符串 | 包含 `#` 标题、Markdown 表格

### TC-06: 双格式输出一致性
- **P1** | 两种格式中的指标数值完全一致 | Markdown 内容可作为纯文本从 HTML 中提取

### TC-07: 报告文件存储投递
- **P0** | `reports/` 目录生成 `health_<date>.html` 和 `health_<date>.md` | 文件内容与渲染输出一致

### TC-08: 报告历史查询
- **P1** | 返回 3 条记录（按日期降序） | 每条包含 `date`, `type`, `file_path`, `size`

### TC-09: Cron 定时触发
- **P1** | 报告生成被执行 1 次 | 日志记录调度触发时间和报告类型

### TC-10: 错误摘要报告——TOP 10 高频错误
- **P2** | 返回列表按频率降序排列 | 第一项为 `{"type": "MongoTimeout", "count": 3}`


## 四、边界与异常测试

### EC-01: 空数据集渲染
- **步骤**：所有指标聚合结果均为空列表或 0
- **预期**：模板正常渲染，显示"暂无数据"或适当占位符

### EC-02: Jinja2 模板缺失
- **步骤**：调用不存在的模板名称
- **预期**：返回 `TemplateNotFound` 错误，列出可用模板名称

### EC-03: 报告数据中包含非 UTF-8 字符
- **步骤**：错误消息中包含二进制字符
- **预期**：渲染时转义或替换为 `?`，不崩溃

### EC-04: 调度中上一个报告尚未完成
- **步骤**：Cron 触发时上一次执行仍在进行中
- **预期**：跳过本次触发（不并发执行同一报告类型），记录 WARNING 日志


## 五、回归测试

### RG-01: 报告生成在后台执行，不应阻塞 RPC 请求
- **步骤**：在报告生成过程中发送标准 RPC 请求

### RG-02: 一次报告生成因 MongoDB 短暂不可达而失败
- **步骤**：Mock MongoDB 在报告执行时抛出异常


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| EC-01~04 | 边界/异常情况 | 七、风险与缓解 |
| RG-01 | 性能不退化 | 七、风险 #5 |
| RG-02 | 调度器容错 | 七、风险 #4 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| SMTP 邮件投递集成测试 | 需要真实 SMTP 服务 | 使用 mailhog 或 aiosmtpd 搭建本地测试 SMTP |
| Webhook 投递测试 | 依赖外部 Webhook 端点可达性 | 使用 httpx mock 或响应录制 |

*测试规格基于 PRD [156-需求-定时报告生成.md](../../prds/2026-09/156-需求-定时报告生成.md) 提取，覆盖 10 个用例 + 4 个边界测试 + 2 个回归测试。*
