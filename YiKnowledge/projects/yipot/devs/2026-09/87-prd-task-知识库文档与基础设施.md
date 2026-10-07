---

doc_type: module
prd_task_id: "YP-09-53-7"
title: "知识库文档补充 + 基础设施集成 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer, leader]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_docs: 0.3
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# 知识库文档补充 + 基础设施集成 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)

---

## 源码索引

### 知识库文档

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiKnowledge/projects/yipot/prds/2026-09/53-prd-YiAi后端集成.md` | 主 PRD 需求文档 | 450 |
| `YiKnowledge/projects/yipot/devs/2026-09/80-prd-task-YiAi后端集成.md` | 主开发方案（总览） | 400 |
| `YiKnowledge/projects/yipot/devs/2026-09/81-prd-task-翻译Provider适配器.md` | 子模块 1: 翻译 Provider | 200 |
| `YiKnowledge/projects/yipot/devs/2026-09/82-prd-task-OCRProvider适配器.md` | 子模块 2: OCR Provider | 120 |
| `YiKnowledge/projects/yipot/devs/2026-09/83-prd-task-TTS生词本Provider适配器.md` | 子模块 3: TTS + 生词本 | 130 |
| `YiKnowledge/projects/yipot/devs/2026-09/84-prd-task-翻译记忆与RAG上下文.md` | 子模块 4: 记忆 + RAG | 180 |
| `YiKnowledge/projects/yipot/devs/2026-09/85-prd-task-YiPotAPI四层架构.md` | 子模块 5: API 层 | 200 |
| `YiKnowledge/projects/yipot/devs/2026-09/86-prd-task-前端集成YiAi路由降级.md` | 子模块 6: 前端集成 | 160 |
| `YiKnowledge/projects/yipot/tests/2026-09/95-prd-test-YiAi后端集成.md` | 主测试方案 | 300 |
| `YiKnowledge/projects/yipot/workflows/开发规范/11-规范-YiAi集成架构.md` | 架构集成文档 | 200 |

### 项目文件

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiPot/CLAUDE.md` | 项目规范文件（完整重写） | 536 |

### 基础设施

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiAi/src/shared/runtime.py` | 新增 `get_shared_client()` + `close_shared_client()` | +30 |
| `YiAi/src/server/lifespan.py` | Shutdown 时清理共享 HTTP 客户端 | +5 |

---

## 一、知识库文档体系

### 1.1 文档层次

```
YiKnowledge/projects/yipot/
├── prds/2026-09/
│   └── 53-prd-YiAi后端集成.md          ← 需求层（WHAT / WHY）
│       ├── 10 项功能需求（FR-1 ~ FR-10）
│       ├── 领域模型（Provider 注册表 + MongoDB 集合 + RPC 契约）
│       └── 5 项 ADR 设计决策
├── devs/2026-09/
│   ├── 80-prd-task-YiAi后端集成.md      ← 方案总览（HOW）
│   │   ├── 34 文件源码索引
│   │   ├── 架构分层图 + 数据流时序图
│   │   └── 7 子模块进度追踪
│   ├── 81-prd-task-翻译Provider适配器.md ← 子模块 1
│   ├── 82-prd-task-OCRProvider适配器.md  ← 子模块 2
│   ├── 83-prd-task-TTS生词本Provider适配器.md ← 子模块 3
│   ├── 84-prd-task-翻译记忆与RAG上下文.md ← 子模块 4
│   ├── 85-prd-task-YiPotAPI四层架构.md   ← 子模块 5
│   └── 86-prd-task-前端集成YiAi路由降级.md ← 子模块 6
├── tests/2026-09/
│   └── 95-prd-test-YiAi后端集成.md      ← 验证层（VERIFY）
│       ├── 7 大测试域（翻译/OCR/TTS/记忆/RAG/API/降级）
│       └── 25 个测试用例（含步骤/预期/环境要求）
└── architecture/
    └── yiai-integration.md              ← 架构参考（REFERENCE）
        ├── 完整架构图
        ├── RPC 方法契约（5 个方法）
        ├── Provider 支持矩阵（19 个引擎）
        └── 降级策略
```

### 1.2 文档间交叉引用

```
53-prd-YiAi后端集成.md
  ├─ 实现方案 → 80-prd-task-YiAi后端集成.md
  │   ├─ 子模块 1 → 81-...
  │   ├─ 子模块 2 → 82-...
  │   ├─ ... (7 个子模块)
  │   └─ 子模块 7 → 本文档
  ├─ 验证方案 → 95-prd-test-YiAi后端集成.md
  ├─ FR-1 → 01-prd-划词翻译核心.md
  ├─ FR-4 → 04-prd-插件与服务系统.md
  └─ 关联需求 → 11 个现有 PRD 的交叉引用

CLAUDE.md
  └─ 指引 → 全部 YiKnowledge 文档 + YiAi/YiVad/YiPet CLAUDE.md
```

---

## 二、CLAUDE.md 设计

### 2.1 结构对齐

参照 YiVad `CLAUDE.md` 的 11 段结构：

| 段 | YiVad | YiPot |
|----|-------|-------|
| 基础信念 | Vue 3.5 + ProTable + v-auth | Tauri 桌面 + 双层架构 + YiAi 服务层 |
| 铁律 | 简洁/精准/目标驱动/提交前构建 | 简洁/精准/桌面优先/降级保障 |
| 架构方向 | 组件化 + API 分层 | 桌面应用 + 共享后端 |
| 项目概况 | 技术栈表格 | 技术栈表格（17 项） |
| 项目结构 | 80+ 文件目录树 | 80+ 文件目录树（三层：前端/Rust/API） |
| 模块边界 | 3 张表 | 3 张表（Rust/React/YiAi） |
| 数据流 | 3 个完整流程 | 3 个完整流程（翻译/OCR/插件） |
| 跨项目关系 | RPC 协议 + 桥接 | RPC 协议 + YiVad 桥接 + YiPet 共享 |
| 约束 | 8 条 | 10 条（含平台特定约束） |
| 降级策略 | 4 场景 | 8 场景（含离线/权限/备份） |
| 近期变更 | 详细记录 | 详细记录 + 知识库指标 |

### 2.2 关键差异

| 维度 | YiVad CLAUDE.md | YiPot CLAUDE.md |
|------|-----------------|-----------------|
| 平台 | Web 浏览器 | 桌面三平台（Win/Mac/Linux） |
| 后端 | 纯前端（调用 YiAi） | Rust 桌面后端 + YiAi 服务后端 |
| 离线能力 | 无 | 有（系统 OCR/截图/热键） |
| 降级路径 | API 不可用 → 回退静态菜单 | YiAi 不可用 → 降级到直接 API 调用 |
| 插件系统 | 无 | .potext 本地插件 |

---

## 三、基础设施集成

### 3.1 共享 HTTP 客户端

在 `shared/runtime.py` 中新增全局 httpx 客户端：

```python
_shared_http_client: httpx.AsyncClient | None = None

def get_shared_client() -> httpx.AsyncClient:
    global _shared_http_client
    if _shared_http_client is None or _shared_http_client.is_closed:
        _shared_http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            http2=False,
        )
    return _shared_http_client

async def close_shared_client():
    global _shared_http_client
    if _shared_http_client is not None and not _shared_http_client.is_closed:
        await _shared_http_client.aclose()
        _shared_http_client = None
```

**统一现有模式**：
- `services/ai/provider_ollama.py` — 已有 `_shared_client` 私有全局
- `services/ai/model_runtime/ollama.py` — 已有 `_ollama_client` 私有全局
- `domain/rag/llm_stream.py` — 已有 `_http_client` 私有全局

`get_shared_client()` 为所有 29 个翻译 Provider 提供统一的连接池，不替代上述专用客户端。

### 3.2 生命周期管理

在 `server/lifespan.py` shutdown 流程末尾新增：

```python
try:
    from shared.runtime import close_shared_client
    await close_shared_client()
except Exception:
    logger.debug("Shared HTTP client close skipped", exc_info=True)
```

执行顺序（在所有其他清理之后）：
1. 优雅排水（等待 inflight 请求完成）
2. 知识监视器关闭
3. RSS 系统关闭
4. 备份调度器关闭
5. MongoDB 关闭
6. RAG HTTP 客户端关闭
7. LLM Provider HTTP 客户端关闭
8. Ollama 运行时客户端关闭
9. **共享 HTTP 客户端关闭**（新增）← 最后清理

---

## 四、实施进度

| 任务 | 内容 | 状态 |
|------|------|------|
| DOC-01 | 主 PRD (53-prd-YiAi后端集成.md) | ✅ |
| DOC-02 | 主开发方案 (80-prd-task-YiAi后端集成.md) | ✅ |
| DOC-03 | 子模块开发方案 × 6 (81-86) | ✅ |
| DOC-04 | 主测试方案 (95-prd-test-YiAi后端集成.md) | ✅ |
| DOC-05 | 架构集成文档 (yiai-integration.md) | ✅ |
| DOC-06 | CLAUDE.md 重写 (536 行) | ✅ |
| INF-01 | `shared/runtime.py` — get_shared_client | ✅ |
| INF-02 | `server/lifespan.py` — close_shared_client | ✅ |
| INF-03 | `YiKnowledge/INDEX.md` — 4→5 项目更新 | ✅ |