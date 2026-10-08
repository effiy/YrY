---

doc_type: test
title: "YA-08-06: RSS 聚合服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-06"
source_prds: ["06-需求-RSS聚合服务"]
source_modules: ["06-prd-task-RSS聚合服务"]
source_okr: [yiai-001]

type: test
---

# YA-08-06: RSS 聚合服务 — 测试规格

> 来源 PRD：[06-需求-RSS聚合服务.md](../../prds/2026-08/06-需求-RSS聚合服务.md)
> 开发方案：[06-prd-task-RSS聚合服务.md](../../devs/2026-08/06-prd-task-RSS聚合服务.md)
> 需求编号：YA-08-06 -- 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 RSS/Atom 解析、定时调度、去重、Dashboard API。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock feedparser） | 每次提交 |
| L2 集成 | pytest + httpx | MongoDB + mock HTTP | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | RSS 2.0 解析（feedparser） | L1 |
| COV-2 | Atom 解析 | L1 |
| COV-3 | GUID 去重 | L1 |
| COV-4 | Feed 源不可达容错 | L1 |
| COV-5 | XML 格式错误容错 | L1 |
| COV-6 | apscheduler 定时触发 | L1 |
| COV-7 | HTTP 条件请求（ETag/If-Modified-Since） | L1 |
| COV-8 | 自适应间隔（高频 5min / 中频 30min / 低频 6h） | L1 |
| COV-9 | 条目 MongoDB 存储 + 全文检索 | L2 |
| COV-10 | RPC 接口（Feed CRUD + 条目查询） | L2 |
| COV-11 | SSRF 防护（拒绝内网 IP） | L1 |
| COV-12 | 日期解析（RFC 822/ISO 8601/Atom 多种格式） | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `rss2_xml` | 标准 RSS 2.0 XML（3 条 entry） | RSS 解析测试 |
| `atom_xml` | 标准 Atom XML（3 条 entry） | Atom 解析测试 |
| `malformed_xml` | 缺少 `<link>` 等字段的不规范 XML | 容错解析 |
| `duplicate_feed` | 与上次抓取相同 GUID 的 Feed | 去重测试 |
| `feed_with_etag` | 带 ETag 的 Feed HTTP 响应 | 条件请求测试 |
| `rss_feed_mock` | Mock `FeedSource` 对象 | 调度器测试 |

---

## 二、单元测试

### 2.1 Feed 解析（COV-1 + COV-2 + COV-5 + COV-12 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-RS-01 | RSS 2.0 解析 | 1. 解析标准 RSS 2.0 XML | 提取 title/link/description/pubDate，条目数正确 | P0 | 已完成 |
| UT-RS-02 | Atom 解析 | 1. 解析标准 Atom XML | 提取 entry 列表，title/link/updated 正确 | P0 | 已完成 |
| UT-RS-03 | 相同 GUID 去重 | 1. 第 2 次入库相同 GUID | 第 2 次被跳过（upsert 不产生新文档） | P0 | 已完成 |
| UT-RS-04 | Feed 源不可达 | 1. Mock httpx 返回 `ConnectError` | WARN 日志 + 不中断其他源的抓取 | P0 | 已完成 |
| UT-RS-05 | XML 格式错误（bozo=True） | 1. feedparser 返回 `bozo_exception` | 仍能提取部分字段，WARNING 日志记录 | P0 | 已完成 |
| UT-RS-06 | 缺少 `<link>` 的条目 → 使用 id/uuid | 1. entry 无 link 字段 | 使用 `entry.id` 或生成 UUID 作为 GUID | P0 | 待实现 |
| UT-RS-07 | 多格式日期解析 | 1. RFC 822 / ISO 8601 / Atom 三种格式 | 全部正确解析为 datetime | P0 | 待实现 |
| UT-RS-08 | relative URL 转 absolute URL | 1. RSS 中含相对路径 `/article/1` | 转换为 `https://source.url/article/1` | P1 | 待实现 |
| UT-RS-09 | HTML 标签剥离 | 1. summary 含 `<p>`、`<a>` 等标签 | 剥离后为纯文本 | P1 | 待实现 |

### 2.2 调度器（COV-6 + COV-7 + COV-8 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-RS-10 | apscheduler 定时触发 | 1. 注册 Feed 的定时任务；2. 等待触发 | 按配置间隔自动执行抓取 | P0 | 已完成 |
| UT-RS-11 | HTTP 304 → 返回空（ETag 匹配） | 1. 请求带 `If-None-Match`；2. 返回 304 | 返回空列表，不解析 | P0 | 待实现 |
| UT-RS-12 | HTTP 304 → 返回空（If-Modified-Since） | 1. 请求带 `If-Modified-Since`；2. 返回 304 | 返回空列表 | P0 | 待实现 |
| UT-RS-13 | 自适应间隔：高频 Feed → 5min | 1. 日均更新 10 篇 | `adaptive_interval()` 返回 300s | P0 | 待实现 |
| UT-RS-14 | 自适应间隔：中频 Feed → 30min | 1. 日均更新 3 篇 | 返回 1800s | P0 | 待实现 |
| UT-RS-15 | 自适应间隔：低频 Feed → 6h | 1. 日均更新 0.3 篇 | 返回 21600s | P0 | 待实现 |
| UT-RS-16 | 新 Feed（无历史）→ 默认 30min | 1. `last_fetched = None` | 返回 1800s | P0 | 待实现 |
| UT-RS-17 | 3 天无更新的 Feed → low_activity | 1. 新 Feed 3 天内无新条目 | 标记为 `low_activity`，间隔延长至 24h | P1 | 待实现 |

### 2.3 安全防护（COV-11 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-RS-18 | 拒绝 `file://` 协议 | 1. 添加 `file:///etc/passwd` Feed | 拒绝添加 | P0 | 待实现 |
| UT-RS-19 | 拒绝内网 IP（127.0.0.1） | 1. 添加 `http://127.0.0.1:8080/admin` Feed | 拒绝（SSRF 防护） | P0 | 待实现 |
| UT-RS-20 | 仅允许 http/https 协议 | 1. 添加 `gopher://evil.com` Feed | 拒绝 | P1 | 待实现 |
| UT-RS-21 | Feed XML > 5MB → 拒绝解析 | 1. 返回 6MB XML | 标记 `size_exceeded`，不解析 | P0 | 待实现 |
| UT-RS-22 | XXE 防护 | 1. 输入含 XXE payload 的 Feed | XXE 不被解析（feedparser + defusedxml 防护） | P1 | 待实现 |

---

## 三、集成测试

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| IT-RS-01 | 抓取 → 存储 → Dashboard API | 1. 抓取真实 RSS；2. 存入 MongoDB；3. Dashboard 查询 | Dashboard 返回抓取到的条目 | P0 | 已完成 |
| IT-RS-02 | 并发抓取多源 | 1. asyncio.gather 并行抓取 3 个 Feed | 单源串行（同一域名），多源并行，总计时间 < sum | P0 | 已完成 |
| IT-RS-03 | Feed CRUD → MongoDB 持久化 | 1. 添加 Feed → MongoDB `rss_feeds`；2. 查询；3. 删除 | CRUD 操作正确，状态同步 | P0 | 待实现 |
| IT-RS-04 | 全文搜索（`$text` 索引） | 1. 存入含关键词的条目；2. `$text` 搜索 | 返回匹配条目 | P1 | 待实现 |
| IT-RS-05 | 条目限制（每个 Feed <= 1000 条） | 1. 插入 1100 条条目；2. 触发清理 | 保留最近 1000 条，最旧 100 条被清理 | P1 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RS-EDGE-001 | 所有 Feed 源同时不可达 | 1. 3 个 Feed 全部返回错误 | 不崩溃，所有 Feed 标记 error，下次轮询重试 | P1 | 待实现 |
| TC-RS-EDGE-002 | 调度器 MongoDB 断开后恢复 | 1. MongoDB 重启 30s；2. 调度器恢复 | `try/except` 重试（3 次指数退避）+ 自动恢复 | P1 | 待实现 |
| TC-RS-EDGE-003 | 中文 RSS 编码问题 | 1. 抓取中文 RSS（未声明 charset） | 正确解码，不产生乱码 | P1 | 待实现 |
| TC-RS-EDGE-004 | Feed URL 302 重定向 | 1. Feed URL 返回 302 | 跟随重定向，更新 source.url | P2 | 待实现 |
| TC-RS-EDGE-005 | 同一天同名文章去重（追加 GUID 短哈希） | 1. 同一作者同天发布两篇 "Weekly Update" | 两篇都入库（不同 GUID hash），不覆盖 | P1 | 待实现 |
| TC-RS-EDGE-006 | 中文标题 slug 字节截断（> 80 字节） | 1. 中文标题 30 字 | 文件名 <= 80 字节（UTF-8 编码） | P1 | 待实现 |

---

## 五、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-RS-REG-001 | 缺陷 1：大体积 Feed 内存溢出 | 50MB+ XML 解析 | 限制 RSS_MAX_XML_SIZE 5MB 或流式解析 | P0 | 待实现 |
| TC-RS-REG-002 | 缺陷 2：新 Feed 误判为活跃 | 20 个已停更 Feed 每 30min 轮询 | 3 天无更新 → low_activity (24h) | P1 | 待实现 |
| TC-RS-REG-003 | 缺陷 4：中文 slug 超长 | 30 字中文标题 | 文件名 <= 80 字节 | P1 | 待实现 |
| TC-RS-REG-004 | 缺陷 7：调度器 MongoDB 断连后停止 | scheduler 静默停止 | try/except 重试 + 自动恢复 | P1 | 待实现 |

---

## 六、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 RSS 2.0 + Atom 解析 | 提取字段完整 | UT-RS-01 ~ 02 |
| FR-02 GUID 去重 | 重复条目不重复入库 | UT-RS-03 |
| FR-03 容错处理 | 不可达/格式错/缺失字段 | UT-RS-04 ~ 06 |
| FR-04 日期解析 | RFC 822/ISO/Atom | UT-RS-07 |
| FR-05 自适应调度 | 高频/中频/低频/新 Feed | UT-RS-10 ~ 17 |
| FR-06 HTTP 条件请求 | ETag/304 | UT-RS-11 ~ 12 |
| FR-07 条目存储 | MongoDB + $text 索引 | IT-RS-03 ~ 04 |
| FR-08 Feed CRUD RPC 接口 | 添加/删除/查询 | IT-RS-03 |
| FR-09 SSRF 防护 | 拒绝内网 + file:// | UT-RS-18 ~ 22 |

---

## 七、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 网页全文提取（readability）未测试 | 手动触发全文提取路径未验证 | 补充 content.py 覆盖率 |
| G-2 | RSS 条目纳入 RAG 检索未测试 | `feed:` 前缀限定搜索 | 实现后补充 |
| G-3 | OPML 导入/导出未实现 | 批量管理 Feed 订阅 | 实现后补充 |
| G-4 | Feed 健康度评分未实现 | 自动降权低质量 Feed | 实现后补充 |