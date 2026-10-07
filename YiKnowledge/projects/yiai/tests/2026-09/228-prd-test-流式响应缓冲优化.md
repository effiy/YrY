---

doc_type: test
title: "YA-09-233: 流式响应缓冲优化 — 自适应缓冲区大小、背压控制、分块策略、内存池复用、零拷贝传输 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-233"
source_prds: ["228-需求-流式响应缓冲优化"]
source_modules: ["228-prd-task-流式响应缓冲优化"]
source_okr: [yiai-002]

type: test
---

# YA-09-233: 流式响应缓冲优化 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖自适应缓冲区大小、背压控制、分块策略（chunking）、内存池复用、零拷贝传输。

> 来源 PRD：[228-需求-流式响应缓冲优化.md](../../prds/2026-09/228-需求-流式响应缓冲优化.md)
> 需求编号：YA-09-233 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | AdaptiveBuffer 大小调整算法、ChunkStrategy 分块逻辑、BackpressureController 阈值判断 | 50% |
| 集成测试 | pytest + httpx | SSE 流式传输缓冲效果、慢客户端背压、内存池复用 | 30% |
| 性能测试 | pytest-benchmark | 缓冲延迟 vs 吞吐对比、内存分配次数 | 20% |

**测试目标**：自适应缓冲减少内存分配 > 50%、背压下不丢数据、首字节延迟不增加、内存池复用率 > 80%。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/streaming/` 下模拟 SSE 流（快/中/慢三种生成速度），以及模拟慢客户端。

**前置条件**：YiAi SSE 流式服务运行中，Ollama 可用（用于真实 LLM 流式生成）。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 自适应缓冲区初始大小 | 系统刚启动 | buffer_size 初始值 | 默认值 4KB，可从配置调整 | P0 |
| 2 | 快生成+慢消费 缓冲扩张 | LLM 100 token/s，客户端 10 token/s | 自适应调整 | buffer_size 自动增长到 32KB-64KB | P0 |
| 3 | 慢生成+快消费 缓冲收缩 | LLM 5 token/s，客户端 50 token/s | 自适应调整 | buffer_size 自动缩小到 1KB-4KB | P1 |
| 4 | 背压控制 | buffer 填充 > 80% | backpressure 信号 | 暂停 Ollama 请求（或降低生成速度），buffer < 50% 时恢复 | P0 |
| 5 | 分块策略-固定大小 | chunk_size=256 bytes | 流式输出 | 每 chunk 256 bytes（最后一块可能不足），无截断丢数据 | P1 |
| 6 | 分块策略-换行分割 | 按 newline 分割 | 流式输出 | 每 chunk 以 \n 结尾，不破坏 token 完整性 | P1 |
| 7 | 内存池复用 | 连续 1000 个 SSE 消息 | 内存分配统计 | buffer 复用率 > 80%，内存分配次数 < 原始 50% | P1 |
| 8 | 零拷贝传输 | 数据从 Ollama 到 HTTP 响应 | sendfile/splice | 不经过用户态拷贝（如 OS 支持），延迟降低 | P2 |
| 9 | 慢客户端断开连接处理 | 客户端中途断开 SSE | 清理资源 | buffer 立即释放，不内存泄漏 | P0 |
| 10 | 缓冲统计 | 运行 1h 后 | GET /streaming/buffer-stats | 返回: 平均 buffer 大小/背压触发次数/内存池命中率 | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 客户端完全不消费（挂死） | recv 永不调用 | 背压触发→ buffer 满→暂停生成，不 OOM |
| E2 | 极短消息（1 token） | LLM 生成仅 1 token | 正常缓冲和发送，不因 buffer 远大于数据而浪费 |
| E3 | buffer_size 配置非法值 | buffer_size=0 或负数 | 回退到默认值 4KB |
| E4 | 内存池耗尽 | 高并发 1000+ 连接 | 降级为新分配（非池化），不阻塞 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 缓冲优化不影响 SSE 消息格式 | 对比优化前后 SSE 输出，每行格式 `data: {...}` 不变 |
| R2 | 高并发下缓冲不丢数据 | 100 并发 SSE 连接，验证总发送字节数 = 总生成字节数 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1, TC-2, TC-3 | adaptive_buffer.py |
| TC-4 | backpressure_controller.py |
| TC-5, TC-6 | chunk_strategy.py |
| TC-7 | memory_pool.py |
| TC-8 | zero_copy.py |
| TC-9 | connection_handler.py |
| TC-10 | buffer_stats.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 不同 OS 零拷贝实现（Linux sendfile/macOS） | 平台相关，本地测试难覆盖 | P2 |
| 10000+ 并发缓冲极限测试 | 需压测环境 | P2 |