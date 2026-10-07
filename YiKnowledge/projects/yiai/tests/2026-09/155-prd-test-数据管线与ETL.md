---

doc_type: test
title: 'YA-09-149: 数据管线与 ETL — 声明式管道 + 多源连接器 + 数据转换与校验 — 测试规格'
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
prd_task_id: YA-09-149
source_prds:
- 155-需求-数据管线与ETL
source_modules: []
source_okr:
- yiai-001

type: test
---

# YA-09-149: 数据管线与 ETL — 测试规格

> 来源 PRD：[155-需求-数据管线与ETL.md](../../prds/2026-09/155-需求-数据管线与ETL.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **管线引擎**：`src/domain/etl/pipeline_engine.py`（新建）— `PipelineEngine` 类，解析 YAML 管线定义并执行
- **连接器**：`src/domain/etl/connectors/`（新建）— CsvConnector, JsonConnector, MongoSourceConnector, MongoSinkConnector, RssConnector
- **数据转换**：`src/domain/etl/transformers.py`（新建）— 字段映射、类型转换、数据清洗
- **数据校验**：`src/domain/etl/validators.py`（新建）— 必填字段、类型检查、唯一性校验
- **调度集成**：`src/domain/etl/scheduler.py`（新建）— 与 apscheduler 集成
- **排除范围**：大规模数据压测（> 10万条），真实 RSS 源抓取（需要网络）

### 测试策略

| 层级 | 策略 | 工具 |
|------|-----

## 二、测试数据 / Fixtures

- `sample_csv_file` — 测试数据 fixture
- `sample_pipeline_yaml` — 测试数据 fixture


## 三、详细测试用例

### TC-01: YAML 管线定义解析
- **P0** | 返回 `PipelineConfig` 对象 | `source.type == "csv"`，`sink.type == "mongodb"`

### TC-02: CSV 源连接器读取
- **P0** | 返回 3 条记录（list of dict） | 每条记录包含 `name`, `email`, `role` 字段

### TC-03: 字段重命名转换
- **P1** | `name` 字段消失，新增 `username` 字段 | `username` 值与原 `name` 一致

### TC-04: 数据校验——必填字段
- **P0** | 返回 `ValidationResult`，包含 1 个错误（`email_required`） | 错误信息指向具体记录行号

### TC-05: 数据校验——正则匹配
- **P1** | 

### TC-06: 完整管线执行（CSV → MongoDB）
- **P0** | MongoDB `users` 集合新增 3 条文档 | 返回 `PipelineResult`，包含 `rows_processed=3`, `rows_inserted=3`, `errors=[]`

### TC-07: 部分校验失败的管线
- **P1** | 2 条成功写入 MongoDB，1 条跳过 | `PipelineResult.errors` 包含 1 条错误详情

### TC-08: 空数据源处理
- **P1** | `rows_processed=0`，不写入任何数据 | 返回空结果，不报错

### TC-09: MongoDB 到 JSON 导出
- **P1** | 输出 JSON 文件，包含 2 条记录 | JSON 格式有效（`json.load` 可解析）

### TC-10: 调度集成——Cron 触发
- **P2** | 管线被触发执行 | 日志记录调度执行时间


## 四、边界与异常测试

### EC-01: CSV 编码异常（非 UTF-8）
- **步骤**：CSV 文件为 GBK 编码
- **预期**：返回编码错误，不崩溃，提示支持的编码列表

### EC-02: 管线中 source.path 不存在
- **步骤**：YAML 中 `source.path` 指向不存在的文件
- **预期**：加载阶段返回 `FileNotFoundError` 或清晰的错误消息

### EC-03: 超大 CSV（内存压力）
- **步骤**：CSV 文件 10MB（约 5 万行）
- **预期**：流式读取，不产生 OOM

### EC-04: MongoDB 连接断开时重试
- **步骤**：管线执行中 MongoDB 连接断开
- **预期**：记录错误日志，`PipelineResult.errors` 包含连接错误


## 五、回归测试

### RG-01: 管线执行中出错，不应部分污染数据库
- **步骤**：管线 mode 设为 `transactional`，插入 2 条后第 3 条校验失败

### RG-02: 新增 ETL 调度后，现有的知识库监视器定时任务正常运行
- **步骤**：添加 ETL 定时任务后，检查知识库监视器轮询日志


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| EC-01~04 | 边界/异常情况 | 七、风险与缓解 |
| RG-01 | 事务性保护 | 七、风险与缓解 |
| RG-02 | 现有调度不冲突 | 八、回滚策略 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 真实 RSS 源抓取测试 | 依赖外部网络，结果不固定 | 使用 vcrpy 录制/回放 HTTP 响应 |
| 大数据量性能测试 | 需要 >10 万条测试数据 | 使用 factory_boy 批量生成 |

*测试规格基于 PRD [155-需求-数据管线与ETL.md](../../prds/2026-09/155-需求-数据管线与ETL.md) 提取，覆盖 10 个用例 + 4 个边界测试 + 2 个回归测试。*
