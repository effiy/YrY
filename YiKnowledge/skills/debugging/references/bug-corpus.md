---
title: YrY 项目 Bug 模式库
updated: 2026-09-23
tags: [skill, reference, debugging, bug-patterns, yry]
type: reference
status: stable
source: YiKnowledge/projects/*/bugs/
---

# YrY 项目 Bug 模式库

> 基于 `YiKnowledge/projects/` 中真实 Bug 记录提取的常见模式。
> 每个 Bug 都是学费——不从中学习等于白交。

## 模式索引

### 1. 静默失败（Silent Failure）

**特征**：操作看似成功（HTTP 200, RPC code:0），但结果与预期不符。

**已发生案例**：

| Bug | 项目 | 表现 |
|-----|------|------|
| [RPC 参数 query-vs-filter 静默忽略](../../YiKnowledge/projects/yiai/bugs/2026-09/接口/01-接口-RPC参数query-vs-filter静默忽略.md) | YiAi | 后端忽略 `query` 参数，返回未过滤的全量数据，HTTP 200 |
| [中间件异常处理器吞没真实错误](../../YiKnowledge/projects/yiai/bugs/2026-09/中间件/01-中间件-异常处理器吞没真实错误.md) | YiAi | 中间件 `try/except` 中 `pass`，500 变成 200 |

**排查策略**：
1. 对比前端期望和后端实际返回的数据
2. 检查后端日志有无 WARNING
3. 在后端参数提取处加日志打印 `parameters.keys()`

**预防**：
- 后端对所有未知参数名记录 WARNING
- RPC 参数白名单校验
- 中间件异常处理器必须记录完整堆栈

### 2. 连接/资源泄漏（Resource Leak）

**特征**：系统运行一段时间后变慢或超时，重启后恢复。

**已发生案例**：

| Bug | 项目 | 表现 |
|-----|------|------|
| [MongoDB 连接池耗尽](../../YiKnowledge/projects/yiai/bugs/2026-09/数据/01-数据-MongoDB连接池耗尽.md) | YiAi | 偶发超时，新请求无法获取数据库连接 |
| [企微 Token 刷新无并发保护](../../YiKnowledge/projects/yiai/bugs/2026-09/企业微信/01-企微-Token刷新无并发保护.md) | YiAi | 多个请求同时刷新 Token，创建大量重复请求 |

**排查策略**：
1. 检查连接/资源是否有对应的释放逻辑
2. 压力测试观察资源使用趋势
3. 检查异步任务的引用是否被保持

**预防**：
- 使用连接池管理器（如 Motor 的 `AsyncIOMotorClient` 单例）
- 资源获取和释放在同一作用域（`async with` / `try-finally`）
- Token 刷新等操作加分布式锁

### 3. 配置错误（Configuration Error）

**特征**：代码逻辑正确，但行为异常——通常是因为配置加载、解析或合并出错。

**已发生案例**：

| Bug | 项目 | 表现 |
|-----|------|------|
| [YAML 配置扁平化键名冲突](../../YiKnowledge/projects/yiai/bugs/2026-09/配置/01-配置-YAML配置扁平化键名冲突.md) | YiAi | 嵌套 YAML 键被扁平化后覆盖 |
| [JWT Secret 硬编码默认值](../../YiKnowledge/projects/yiai/bugs/2026-09/认证/01-认证-JWT-Secret硬编码默认值.md) | YiAi | 生产环境使用了默认密钥 |

**排查策略**：
1. 打印实际加载的配置值（非配置文件中的值）
2. 检查环境变量是否正确设置
3. 检查配置文件的优先级和合并顺序

**预防**：
- 配置加载后打印关键配置值（脱敏后）
- 默认值必须是安全的（或启动时拒绝使用默认值）
- 生产环境强制要求某些配置项必须显式设置

### 4. 边界条件遗漏（Missing Boundary Check）

**特征**：正常情况运行正常，但在空数据、大数据量、并发等边界条件下出错。

**已发生案例**：

| Bug | 项目 | 表现 |
|-----|------|------|
| [空查询未做防护导致全表扫描](../../YiKnowledge/projects/yiai/bugs/2026-09/搜索/01-搜索-空查询未做防护导致全表扫描.md) | YiAi | 空 `filter: {}` 导致 MongoDB 全表扫描 |
| [执行器 allowlist=None 崩溃](../../YiKnowledge/projects/yiai/bugs/2026-09/执行/02-执行-allowlist-none-set崩溃.md) | YiAi | `allowlist` 为 `None` 时遍历崩溃 |
| [模块执行器缺少超时和资源限制](../../YiKnowledge/projects/yiai/bugs/2026-09/执行/01-执行-模块执行器缺少超时和资源限制.md) | YiAi | 长时间运行的任务无超时控制 |

**排查策略**：
1. 列出所有可能为空的输入
2. 测试空数组、空字符串、`None`/`null`、`0`、负数
3. 大列表输入测试

**预防**：
- 函数入口处显式校验输入
- 数据库查询默认加 `limit`
- 异步操作默认加 `timeout`

### 5. 类型/维度不匹配（Type/Dimension Mismatch）

**特征**：值本身没问题，但类型或维度与预期不一致。

**已发生案例**：

| Bug | 项目 | 表现 |
|-----|------|------|
| [live 端点时间戳类型不匹配](../../YiKnowledge/projects/yiai/bugs/2026-09/数据/01-数据-live端点时间戳类型不匹配.md) | YiAi | 前端传 `int`，后端期望 `datetime` |
| [Ollama Embedding 维度不匹配](../../YiKnowledge/projects/yiai/bugs/2026-09/大模型/01-模型-Ollama-Embedding维度不匹配.md) | YiAi | 模型切换后向量维度变化，旧索引不可用 |
| [Watcher bulk-write 部分失败](../../YiKnowledge/projects/yiai/bugs/2026-09/知识库/01-知识-Watcher-bulk-write部分失败.md) | YiAi | 批量操作中部分文档 schema 不匹配，静默跳过 |

**排查策略**：
1. 打印值的 `type` 而不仅仅是 `value`
2. 检查 API 的序列化/反序列化过程
3. 验证批量操作中每个元素的 schema

**预防**：
- 使用类型标注并进行运行时校验（Pydantic、TypeScript）
- API 文档明确标注类型
- 批量操作前逐条 schema 校验

### 6. 状态残留（State Residue）

**特征**：操作完成后，之前的状态没有完全清理，影响后续操作。

**已发生案例**：

| Bug | 项目 | 表现 |
|-----|------|------|
| [状态记录 TTL 未强制执行](../../YiKnowledge/projects/yiai/bugs/2026-09/状态/01-状态-状态记录TTL未强制执行.md) | YiAi | 过期的状态记录未被清理，累积占用存储 |

**排查策略**：
1. 重复执行同一操作 2-3 次，观察每次状态是否独立
2. 检查清理逻辑（`onUnmounted`、`finally`、TTL 索引）
3. 在操作之间检查组件/模块的内部状态

**预防**：
- 组件销毁时清理事件监听、定时器、订阅
- MongoDB 文档设 TTL 索引
- 状态初始化逻辑放在操作开始时而非依赖「上一次清理」

---

## 快速决策树

遇到 Bug 时，按以下顺序排查：

```
Bug 发生
│
├── 有错误消息吗？
│   ├── 有 → 从错误消息定位代码位置 → 进入假设验证
│   └── 没有 → 是静默失败模式
│       ├── 数据不对但无报错 → 检查参数名、参数类型
│       └── 行为异常但无报错 → 检查状态残留、配置加载
│
├── 必现还是偶现？
│   ├── 必现 → 直接断点/日志追踪数据流
│   └── 偶现 → 可能是竞态条件、连接池/资源耗尽
│       ├── 并发场景 → 检查锁、连接池、Token 刷新
│       └── 时间相关 → 检查 TTL、超时、定时任务
│
└── 最近有什么变更？
    ├── 有 → git bisect 定位引入的提交
    └── 没有 → 可能是边界条件、环境配置变化
```