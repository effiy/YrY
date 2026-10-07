---

doc_type: test
title: "YA-09-93: 服务端数据压缩传输优化 — 大响应体的 Zstd/Brotli 自适应压缩策略 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-93"
source_prds: ["97-需求-自适应压缩传输"]
source_modules: ["97-prd-task-自适应压缩传输"]
source_okr: [yiai-001]

type: test
---

# YA-09-93: 自适应压缩传输 — 测试规格

> 来源 PRD：[97-需求-自适应压缩传输.md](../../prds/2026-09/97-需求-自适应压缩传输.md)
> 需求编号：YA-09-93 · 优先级：P2 · 人天：0.5d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 一、测试范围与策略

### 1.1 测试范围

| 模块 | 测试重点 | 层级 |
|------|---------|------|
| 自适应压缩中间件 | 根据响应大小和 Accept-Encoding 选择算法 | 单元 |
| Zstd 压缩器 | Zstd 压缩/解压正确性、压缩比 | 单元 |
| Brotli 压缩器 | Brotli 压缩/解压正确性、压缩比 | 单元 |
| 压缩级别策略 | 响应大小分级（< 500B 不压/500B-10KB Gzip/> 10KB Zstd） | 单元 |
| SSE 排除 | 流式响应禁用压缩 | 集成 |
| 已压缩类型排除 | image/video/application/zip 跳过压缩 | 集成 |

### 1.2 测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | 压缩器正确性、压缩比、算法选择逻辑 | 70% |
| 集成测试 | pytest + httpx | 中间件行为、Content-Encoding 头、SSE 排除 | 30% |

---

## 二、测试数据与前置条件

| 组件 | 要求 |
|------|------|
| zstd 依赖 | `pip install zstandard` |
| brotli 依赖 | `pip install brotli` |
| 测试响应体大小 | 100B / 1KB / 10KB / 50KB / 100KB JSON 响应 |
| Accept-Encoding 变体 | `gzip` / `br` / `zstd` / `gzip, br` / `br, zstd` |
| SSE 响应样本 | `text/event-stream` 流式响应 |

---

## 三、测试用例

### 3.1 压缩算法正确性（4 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-ZS-01 | Zstd 压缩-解压往返 | 10KB JSON -> Zstd 压缩 -> Zstd 解压 | 解压后与原数据完全一致 | P0 |
| UT-BR-01 | Brotli 压缩-解压往返 | 10KB JSON -> Brotli 压缩 -> Brotli 解压 | 解压后与原数据完全一致 | P0 |
| UT-ZS-02 | Zstd 压缩比 > Gzip | 同一 50KB JSON 分别 Zstd 和 Gzip 压缩 | Zstd 压缩后大小 < Gzip 压缩后大小（节省 >= 20%） | P1 |
| UT-BR-02 | Brotli 压缩比 > Gzip | 同一 50KB JSON 分别 Brotli 和 Gzip 压缩 | Brotli 压缩后大小 < Gzip 压缩后大小（节省 >= 15%） | P1 |

### 3.2 自适应算法选择（5 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-AS-01 | 小响应不压缩 | 响应 body 200B | `Content-Encoding` 头不出现，body 原样返回 | P0 |
| UT-AS-02 | 中等响应 Gzip | 响应 body 5KB，`Accept-Encoding: gzip` | `Content-Encoding: gzip`，body 被压缩 | P0 |
| UT-AS-03 | 大响应 Zstd 优先 | 响应 body 50KB，`Accept-Encoding: zstd, gzip` | `Content-Encoding: zstd`（zstd 优先级高于 gzip） | P0 |
| UT-AS-04 | 大响应 Brotli 优先 | 响应 body 50KB，`Accept-Encoding: br, zstd` | `Content-Encoding: br`（br 优先级高于 zstd） | P1 |
| UT-AS-05 | 客户端仅支持 Gzip | 大响应 body 50KB，`Accept-Encoding: gzip` | 降级为 Gzip，不返回不支持的编码 | P1 |

### 3.3 排除场景（3 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-EX-01 | SSE 响应不压缩 | `Content-Type: text/event-stream` | 不压缩，`Content-Encoding` 头不出现 | P0 |
| UT-EX-02 | 图片响应不压缩 | `Content-Type: image/png` | 不压缩（已压缩格式） | P1 |
| UT-EX-03 | 视频/zip 不压缩 | `Content-Type: video/mp4 / application/zip` | 不压缩 | P1 |

---

## 四、边界与异常测试

### 4.1 边界场景（4 条）

| 编号 | 场景 | 输入 | 预期 |
|------|------|------|------|
| BE-01 | 正好 500B 边界 | 响应 body 500B | 不压缩（阈值 < 500B 不压） |
| BE-02 | 正好 10KB 边界 | 响应 body 10240B | Zstd/Brotli 压缩（>= 10KB 高级压缩） |
| BE-03 | 空 Accept-Encoding | 客户端不发送 Accept-Encoding 头 | 默认 Gzip（最低通用） |
| BE-04 | 超长 Accept-Encoding | `Accept-Encoding: gzip, deflate, br, zstd, identity` | 按优先级选择：br > zstd > gzip |

### 4.2 异常场景（3 条）

| 编号 | 场景 | 触发条件 | 预期 |
|------|------|---------|------|
| EX-01 | Zstd 压缩失败 | zstd 库异常 | 降级为 Gzip，记录 WARNING |
| EX-02 | 压缩后比原始大 | 已压缩内容（如 base64 图片）再压缩 | 不压缩，返回原始内容 |
| EX-03 | 流式响应 Content-Length 未知 | SSE 长连接 | 跳过压缩，不等待完整响应 |

---

## 五、回归测试（2 条）

| 编号 | 回归场景 | 验证方法 |
|------|---------|---------|
| RG-01 | Gzip 原有功能不受影响 | YA-09-43 已有 Gzip 压缩仍正常工作 |
| RG-02 | 压缩不增加 P99 延迟 | 50KB 响应压缩后 P99 < 原始 P99 + 50ms |

---

## 六、可追溯性矩阵

| 需求点 | 测试用例 | 覆盖状态 |
|--------|---------|---------|
| 响应大小分级选算法 | UT-AS-01 至 UT-AS-03 | 已覆盖 |
| Accept-Encoding 协商 | UT-AS-04, UT-AS-05, BE-03 | 已覆盖 |
| Zstd/Brotli 压缩正确性 | UT-ZS-01, UT-ZS-02, UT-BR-01, UT-BR-02 | 已覆盖 |
| SSE 排除 | UT-EX-01 | 已覆盖 |
| 已压缩类型排除 | UT-EX-02, UT-EX-03 | 已覆盖 |
| 压缩级别可配置 | RG-02 | 已覆盖 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 真实网络传输压缩效果 | 带宽限制场景（慢速网络） | 使用流量控制模拟（tc 命令） |
| Zstd 字典压缩模式 | 需要预训练字典 | 后续迭代补充 |
| CPU 消耗基准 | 需要性能基准测试 | 补充 pytest-benchmark 压缩延迟基准 |
| 多 Content-Type 混合响应 | multipart 响应压缩策略 | 根据实际使用场景补充 |