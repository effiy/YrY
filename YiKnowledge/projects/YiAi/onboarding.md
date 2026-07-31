---
title: YiAi 新人引导
tags: [新人, 引导, 后端, FastAPI, Python, YiAi]
category: projects/YiAi
created: 2026-07-31
updated: 2026-07-31
source: internal
type: onboarding
status: stable
---

# YiAi 新人引导

> FastAPI 后端，Yi 家族的服务端。AI 聊天、文件双写、RSS、企业微信、RAG、状态存储都在这里。

## 1. 项目定位

YiAi 是 Yi 家族（YiAi / YiVad / YiPet）的后端服务，端口 `10086`。给前端（YiVad 管理后台、YiPet 浏览器插件）提供 AI 聊天、文件存储、RSS 聚合、企业微信推送、RAG 检索增强生成、通用 RPC 执行引擎等能力。技术栈：Python 3.10+ / FastAPI / Motor(MongoDB async) / Ollama。

## 2. 首日 setup（30 分钟跑通）

### 前置依赖

- Python 3.10+
- MongoDB 5+ 本地或远程（默认 `mongodb://localhost:27017`）
- Ollama 本地运行（默认 `http://localhost:11434`），下载 `qwen3.5` + `nomic-embed-text` 两个模型
- （可选）阿里云 OSS bucket + 凭证，用于对象存储

### 步骤

```bash
# 1. 克隆（如已在 YrY 仓库内可跳过）
cd /path/to/YrY/YiAi

# 2. 装依赖（推荐 venv）
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3. 起 MongoDB（任选其一）
brew services start mongodb-community   # macOS
# 或 docker run -d -p 27017:27017 mongo:5

# 4. 起 Ollama + 拉模型
ollama serve &
ollama pull qwen3.5
ollama pull nomic-embed-text

# 5. 起后端
python main.py          # dev 模式，uvicorn --reload
# 或生产：uvicorn src.app:app --host 0.0.0.0 --port 10086
```

### 验证清单

- [ ] `curl http://localhost:10086/health/observer` 返回 `{"code":0,...}`
- [ ] 浏览器打开 `http://localhost:10086/docs` 看到 Swagger
- [ ] 日志出现 `Knowledge watcher started (poll every 5s)`
- [ ] 日志出现 `RAG index ... loaded` 或首次访问 `/rag-status` 触发自动构建

## 3. 三个高频 workflow

### Workflow A：加一个 RPC 端点（给前端调）

例：新增 `services/todo/list_todos` 方法。

1. 在 `src/domain/` 下找/建对应域目录（如 `domain/todo/`），写 `list_todos.py` 业务逻辑
2. 在 `src/services/todo/todo_service.py` 暴露 `list_todos(params)` RPC 入口
3. 前端调：
   ```json
   POST /
   { "module_name": "services.todo.todo_service",
     "method_name": "list_todos",
     "parameters": { "filter": {"done": false}, "pageNum": 1, "pageSize": 20 } }
   ```
4. 路由层不用改 —— 通用 execution engine 自动分发

### Workflow B：加一个独立 REST 路由

如 `/myroute`。在 `src/server/routes/myroute.py` 新建 `APIRouter`，在 `src/app.py` 的 `create_app()` 里 `app.include_router(myroute.router, tags=["MyRoute"])`。参考 `routes/rag.py` 的扁平 POST 风格。

### Workflow C：触发 RAG 重建

知识库有变更，但等不及 watcher 自动跑：
```bash
curl -X POST http://localhost:10086/rag-build
# 看 /rag-status 直到 built=true
```
或在 YiVad 的 `/rag` 页面点 Rebuild 按钮。

## 4. 新人坑速查

| 现象 | 原因 | 解决 |
|---|---|---|
| `query_documents` 返回空 / 全部 | 参数名用了 `query` 而非 `filter` | 后端 `_build_filter` 只读 `filter`；改前端调用 |
| `/read-file` / `/write-file` 返回 422 | 字段名用了 `path` 而非 `target_file` | Pydantic schema 强制；改成 `target_file` |
| `AttributeError: 'MongoDB' has no attribute 'find_many'` | 老代码调用了未定义的 wrapper | 已修，确认 `data/database.py` 有 `find_many` / `delete_one` |
| RAG 查询超时 / 空结果 | Ollama 未起 / 模型未拉 / 索引未构建 | 看 `/rag-status`；起 Ollama + 拉 `nomic-embed-text` |
| `data/rag_store` 改了文件不生效 | watcher debounce 30s + 旧索引 doc_id 不稳定 | 改完后等 30s；或调 `/rag-build` 全量重建一次（迁移到稳定 id_） |

## 5. 接下来读什么

| 文档 | 看什么 |
|---|---|
| `YiAi/CLAUDE.md`（仓库根） | 模块边界、跨项目 RPC 协议、铁律 |
| `YiKnowledge/projects/YiAi/engineering/readme.md` | 架构图、数据流、API 设计 |
| `YiAi/config.yaml` | 所有配置项单一来源 |
| `YiAi/src/app.py` | FastAPI 工厂 + lifespan（启动钩子） |
| `YiAi/src/server/routes/` | 路由全在此 |
| `YiAi/src/domain/rag/` | RAG 域（indexer / engine / settings / paths） |

## 6. Day-1 任务清单

- [ ] 跑通 `python main.py`，`/health/observer` 200
- [ ] 起 MongoDB + Ollama，跑通 `/rag-build` + `/rag-query`
- [ ] 读完 `YiAi/CLAUDE.md` 模块边界章节
- [ ] 用 `curl` 调一次 `services.database.data_service.query_documents`（注意 `filter` 非 `query`）
- [ ] 在 `src/server/routes/` 下加一个 `/ping` 端点，返回 `{"pong": true}`，提交 PR
- [ ] 找同事做一次 30 分钟走读，问清未懂的部分

## 7. 负责人 / 联系人

| 角色 | 名字 | 联系方式 |
|---|---|---|
| 项目主负责人 | TBD | TBD |
| 后端架构 | TBD | TBD |
| RAG / llama_index | TBD | TBD |
| MongoDB / 运维 | TBD | TBD |
| Code review | TBD | TBD |

> 占位字段，请项目主负责人填入后删除本行。

## 8. 常见报错速查表

| 报错信息 | 原因 | 解决 |
|---|---|---|
| `ModuleNotFoundError: No module named 'llama_index'` | venv 未激活 / 依赖未装 | `source .venv/bin/activate && pip install -r requirements.txt` |
| `ErrorCode.AI_UNAVAILABLE` | Ollama 不可达 | `curl http://localhost:11434/api/tags` 应返回模型列表 |
| `pymongo.errors.ServerSelectionTimeoutError` | MongoDB 不可达 | `mongosh` 测试连接；检查 `config.yaml: mongodb.url` |
| `AttributeError: 'MongoDB' object has no attribute 'XXX'` | 用了未定义的 wrapper | 看 `data/database.py`，只调已定义的；缺则加 |
| `422 Unprocessable Entity` on `/read-file` | 字段名 `path` | 改成 `target_file` |
| `/rag-query` 返回空 sources | 索引未构建 / scope 太严 | `/rag-status` 检查 built；放宽 scope |
| `yaml.YAMLError` in watcher | 某 md frontmatter 不合法 | 看日志找文件；修 frontmatter |
| `RuntimeError: asyncio.run() cannot be called from a running event loop` | 在 async 函数里调 sync | 用 `asyncio.to_thread` 包裹 |

---

有疑问先看 §4 和 §8；找不到答案再问 §7 里的对应负责人。
