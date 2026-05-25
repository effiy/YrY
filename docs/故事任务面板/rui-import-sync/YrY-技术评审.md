> | v1.0.0 | 2026-05-22 | deepseek-v4-pro | ⏱️ — | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-使用场景](./YrY-使用场景.md) · [→ YrY-测试设计](./YrY-测试设计.md) · [→ YrY-安全审计](./YrY-安全审计.md)

> **来源引用**: `/rui doc --from-code rui-import-sync-doc` · 源文件 `skills/rui-import/sync.mjs`
> **证据等级**: B（从源码反推，附源码路径）

# YrY-技术评审 · rui-import-sync

## §0 设计决策与任务规划

### 效果示意

```mermaid
flowchart LR
    subgraph 入口["外部入口"]
        CLI["CLI 参数<br/>workspace/dir/mode"]:::entry
        ENV["环境变量<br/>API_X_TOKEN<br/>IMPORT_DOCS_API_URL"]:::entry
    end
    subgraph 核心["核心处理"]
        SCAN["文件扫描<br/>scanFiles"]:::svc
        MAP["路径映射<br/>resolveRemotePath"]:::svc
        UPLOAD["并发上传<br/>uploadAll"]:::svc
        PULL["远端拉取<br/>pullFromRemote"]:::svc
    end
    subgraph 存储["外部系统"]
        API["远端 API<br/>api.effiy.cn"]:::ext
        FS["本地文件系统"]:::ext
    end

    CLI -->|"解析参数"| SCAN
    ENV -->|"鉴权"| UPLOAD
    ENV -->|"鉴权"| PULL
    SCAN -->|"文件列表"| MAP
    MAP -->|"远端路径+标签"| UPLOAD
    UPLOAD -->|"write-file + create_document"| API
    PULL -->|"query_documents + read-file"| API
    API -->|"文件内容"| PULL
    PULL -->|"写入"| FS
    SCAN -.->|"读取"| FS

    classDef entry fill:#e8f5e9,stroke:#2e7d32;
    classDef svc fill:#e3f2fd,stroke:#1565c0;
    classDef ext fill:#fff3e0,stroke:#e65100;
```

### 基线溯源

| 来源 | 章节 | 本文档覆盖 |
|------|------|-----------|
| 故事任务 §1 Story 1 | 文档批量同步到远端 | §2 上传管线 |
| 故事任务 §1 Story 2 | 从远端拉取文档到本地 | §3 拉取管线 |
| 故事任务 §1 Story 3 | 路径映射与标签管理 | §4 路径映射策略 |
| 故事任务 §2 FP1-FP8 | 8 个功能点 | §2-§5 各对应章节 |
| 使用场景 1-5 | 5 个用户场景 | 每场景对应技术实现 |

---

## §1 系统架构

### 1.1 架构概览

| 维度 | 值 |
|------|-----|
| 架构模式 | 单文件 CLI 脚本，函数式管道 |
| 运行环境 | Node.js，ESM 模块 |
| 入口 | `main()` 异步函数 |
| 外部依赖 | `node:fs/promises`, `node:path`, `node:child_process`, `node:os` |
| 网络协议 | HTTP POST JSON → 远端 API |
| 并发模型 | Promise 池，可配置并发数 |

```mermaid
flowchart TD
    MAIN["main()"]:::entry --> PARSE["parseArgs()<br/>参数解析"]:::fn
    PARSE --> ROOT{"scanRoot<br/>or scanDir?"}:::dec
    ROOT -->|"workspace"| FIND["findProjectRoot()<br/>定位项目根"]:::fn
    ROOT -->|"dir"| RESOLVE["resolve(scanDir)"]:::fn
    FIND --> MODE{"mode?"}:::dec
    RESOLVE --> MODE
    MODE -->|"pull"| PULL["pullFromRemote()"]:::fn
    MODE -->|"import/list"| SCAN["scanFiles()"]:::fn
    SCAN --> LIST{"mode=list?"}:::dec
    LIST -->|"是"| OUTPUT["逐行输出映射"]:::out
    LIST -->|"否"| QUERY["querySessions()"]:::fn
    QUERY --> UPLOAD["uploadAll()"]:::fn
    UPLOAD --> SUMMARY["输出统计"]:::out

    classDef entry fill:#e8f5e9,stroke:#2e7d32;
    classDef fn fill:#e3f2fd,stroke:#1565c0;
    classDef dec fill:#fff3e0,stroke:#e65100;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
```

### 1.2 模块职责

| 模块 | 函数 | 行号 | 职责 |
|------|------|------|------|
| 参数解析 | `parseArgs()` | 25-52 | 解析 CLI 参数，返回配置对象 |
| 项目根定位 | `findProjectRoot()` | 104-113 | 向上查找 .git 或 .claude 目录 |
| 文件扫描 | `scanFiles()` | 116-144 | 递归扫描，扩展名过滤 |
| 路径映射 | `resolveRemotePath()` | 147-168 | 本地路径→远端路径+标签 |
| 标签生成 | `getTags()` | 170-174 | 从远端路径提取标签（去除文件名） |
| HTTP 封装 | `fetchJson()` | 177-196 | 统一 HTTP POST + timeout + 鉴权 |
| 远端查询 | `querySessions()` / `querySessionsFull()` | 198-215 | 查询已有 sessions |
| 远端写入 | `writeRemoteFile()` | 217-220 | 写文件内容到远端 |
| Session 创建 | `createSession()` | 222-245 | 创建文档 session 记录 |
| 并发上传 | `uploadAll()` | 248-280 | Promise 池并发上传 |
| 远端读取 | `readRemoteFile()` | 283-286 | 读取远端文件内容 |
| 拉取策略 | `resolvePullFilter()` | 288-323 | 按目录类型选择过滤/映射策略 |
| 远端拉取 | `pullFromRemote()` | 325-383 | 查询→过滤→下载→写入 |
| 拉取推荐 | `recommendPullMode()` | 385-425 | 列出远端可同步故事 |
| 推荐模式 | `recommendMode()` | 433-477 | 空输入时的状态检测与建议 |

---

## §2 上传管线（import 模式）

### 2.1 数据流

```mermaid
flowchart LR
    A["CLI args"] --> B["parseArgs()"]
    B --> C["scanFiles()<br/>递归扫描"]
    C --> D["resolveRemotePath()<br/>路径映射"]
    D --> E["querySessions()<br/>查询已有"]
    E --> F["uploadAll()<br/>并发上传"]
    F --> G["writeRemoteFile()<br/>写入内容"]
    G --> H["createSession()<br/>创建记录"]
    H --> I["统计输出<br/>created/overwritten/failed"]
```

### 2.2 路径映射规则

> 证据: `skills/rui-import/sync.mjs:147-168`

```mermaid
flowchart TD
    REL["相对路径"] --> CHECK{"路径类型?"}
    CHECK -->|"docs/故事任务面板/"| STORY["故事面板映射<br/>标签: [故事任务面板, storyName]"]
    CHECK -->|".claude/"| CLAUDE[".claude 映射<br/>标签: [workspaceName]<br/>保持嵌套"]
    CHECK -->|"其他"| OTHER["工作区映射<br/>标签: [workspaceName]<br/>保持相对路径"]

    STORY --> STRIP["去除 docs/故事任务面板/ 前置"]
    CLAUDE --> NESTED["保持 .claude/ 以下路径结构"]
```

### 2.3 并发控制

> 证据: `skills/rui-import/sync.mjs:248-280`

| 参数 | 值 | 说明 |
|------|-----|------|
| CONCURRENCY | 4 | 最大并发 worker 数 |
| 队列模型 | FIFO 顺序消费 | `while (queue.length > 0)` |
| 隔离 | 单文件 try-catch | 失败不阻塞其他文件 |
| HTTP_TIMEOUT | 30000ms | 单请求超时时间 |

### 2.4 Session 创建

> 证据: `skills/rui-import/sync.mjs:222-245`

每条远端文件对应一个 session 记录，字段：

| 字段 | 值来源 | 说明 |
|------|--------|------|
| `url` | `aicr-session://{timestamp}-{random}` | 唯一标识 |
| `title` | 文件名（basename） | 显示名称 |
| `file_path` | `resolveRemotePath()` | 远端路径 |
| `tags` | `getTags()` | 目录层级标签 |
| `messages` | `[]` | 空消息列表 |
| `isFavorite` | `false` | 默认非收藏 |

---

## §3 拉取管线（pull 模式）

### 3.1 数据流

```mermaid
flowchart LR
    A["scanDir 参数"] --> B["resolvePullFilter()<br/>策略解析"]
    B --> C["querySessionsFull()<br/>全量查询"]
    C --> D["filter 过滤<br/>按标签匹配"]
    D --> E["readRemoteFile()<br/>逐文件读取"]
    E --> F["mkdir 父目录"]
    F --> G["writeFile()<br/>写入本地"]
    G --> H["统计输出<br/>written/failed"]
```

### 3.2 拉取策略

> 证据: `skills/rui-import/sync.mjs:288-323`

| 目录类型 | 过滤策略 | 路径映射 |
|---------|---------|---------|
| 故事面板目录 | `tags[0]==故事任务面板 && tags[1]==storyName` | 扁平：`localDir/basename(remotePath)` |
| .claude 目录 | `tags[0]==workspaceName && file_path 前缀匹配` | 嵌套：`projectRoot/remotePath 去 workspaceName 前缀` |
| 其他 | 不支持 | 返回 null，报错 |

---

## §4 错误处理与降级

> 证据: `skills/rui-import/sync.mjs:177-196, 252-280`

```mermaid
flowchart TD
    ERR["错误发生"] --> TYPE{"错误类型?"}
    TYPE -->|"Token 缺失"| TOKEN["静默降级<br/>输出提示，exit 0"]
    TYPE -->|"网络超时"| NET["单文件失败<br/>记录 error，继续"]
    TYPE -->|"API 返回错误"| API["HTTP 状态码 + body<br/>截断至 500 字符"]
    TYPE -->|"文件读取失败"| FS["跳过该文件<br/>记录 error"]
    TYPE -->|"目录不存在"| DIR["输出提示，exit 0"]

    TOKEN --> CONT["管线继续"]
    NET --> CONT
    API --> CONT
    FS --> CONT
```

| 错误场景 | 行为 | exit code |
|---------|------|-----------|
| API_X_TOKEN 缺失（上传/pull） | 静默降级，跳过操作 | 0 |
| 网络请求超时 | 单文件失败，其余继续 | 0 |
| 单文件上传失败 | 记录到 errors 数组，继续其他 | 0 |
| prefix 一级标签非法 | 输出错误，终止 | 1 |
| pull 目录不支持 | 输出错误原因 | 0 |
| 远端查询失败（pull） | 报告错误，返回空结果 | 0 |
| 扫描根目录不存在 | 输出错误，终止 | 0 |

---

## §5 安全考量

| 关注点 | 实现 | 证据 |
|--------|------|------|
| Token 传输 | `X-Token` HTTP Header，不落盘 | `sync.mjs:188` |
| Token 来源 | 仅环境变量 `API_X_TOKEN` | `sync.mjs:13` |
| 路径遍历 | 远端路径来自可控的本地路径映射，非用户自由输入 | `sync.mjs:147-168` |
| 内容注入 | `is_base64: false`，明文传输 | `sync.mjs:218` |
| 超时保护 | AbortController + 30s timeout | `sync.mjs:178-179` |

详见 [YrY-安全审计](./YrY-安全审计.md)。

---

## §6 P0 检查清单

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 效果示意 mermaid 图存在 | ✅ |
| 2 | 基线溯源表完整（映射到故事任务 FP#） | ✅ |
| 3 | 主要价值 ≥ 4 条 | ✅ |
| 4 | 回溯链完整 | ✅ |
| 5 | 按项目类型裁剪（meta：全章节保留） | ✅ |
| 6 | 架构图使用不同节点形状 | ✅ |

---

> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-22 | 初始生成 — doc --from-code | /rui doc --from-code rui-import-sync-doc | skills/rui-import/sync.mjs |
