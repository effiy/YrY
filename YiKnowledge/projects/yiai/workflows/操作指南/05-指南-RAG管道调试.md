---
title: RAG 管道调试指南
tags: [yiai, rag, debug, llama-index, retrieval, embedding]
category: projects/yiai/workflows
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, aier]
benefit: "YiAi RAG 检索增强生成管道的调试方法、常见问题排查、检索质量优化实操指南"
---

# RAG 管道调试指南

> **读完你将能够**：YiAi RAG 检索增强生成管道的调试方法、常见问题排查、检索质量优化实操指南

> 如何调试 YiAi 的 RAG 管道：索引状态、检索质量、知识同步、常见故障。

## 一、管道架构速览

```
YiKnowledge/*.md
  → Knowledge Watcher（60s 轮询）
  → MongoDB knowledge_files 集合
  → llama_index VectorStoreIndex + BM25
  → 混合检索（向量 + 关键词）
  → [可选] HyDE 查询增强 → LLM Rerank
  → 返回 top_k 结果
```

## 二、检查管道健康

### 检查知识监视器

```bash
# 查看监视器状态
curl -X POST http://localhost:10086/rag-status \
  -H "Content-Type: application/json" \
  -d '{}'
# → {"watcher_running": true, "last_scan": "2026-09-15T10:00:00", "files_indexed": 142}
```

### 检查索引状态

```bash
curl -X POST http://localhost:10086/rag-status \
  -H "Content-Type: application/json" \
  -d '{}'
# → {"indexed_files": 142, "index_size_mb": 45.2, "last_built": "..."}
```

### 验证知识同步

```bash
# 1. 检查 MongoDB 中的文件数
mongosh --eval "use ruiyi; db.knowledge_files.countDocuments()"

# 2. 检查文件系统文件数
find ../YiKnowledge -name "*.md" | wc -l

# 两者应相等（或 MongoDB >= 文件系统，因为可能包含已删除文件）
```

## 三、调试检索质量

### 单步测试检索

```bash
# 直接测试 RAG 检索，不经过 LLM
curl -X POST http://localhost:10086/rag-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "RPC 协议规范",
    "top_k": 5,
    "scope": "projects/yiai"
  }'
```

### 检查返回结果质量

好的检索结果应有：
- `score > 0.5`（向量相似度）
- 结果与查询语义相关（不是关键词匹配）
- 来源文件路径清晰（`source` 字段）

```json
// 好的结果示例
{
  "results": [{
    "content": "RPC 信封协议是...",
    "score": 0.82,
    "source": "YiKnowledge/projects/yiai/workflows/开发规范/02-规范-API规范.md",
    "title": "API 规范"
  }]
}
```

### 测试子问题分解

```bash
curl -X POST http://localhost:10086/rag-decompose \
  -H "Content-Type: application/json" \
  -d '{"question": "如何给 Agent 添加新工具并确保写操作需要用户确认"}'
# → {"sub_questions": [
#   "如何给 Agent 添加新工具？",
#   "Agent 确认门控机制如何工作？",
#   "写操作工具如何配置 requires_confirmation？"
# ]}
```

## 四、常见问题排查

### 问题 1：检索返回空结果

**症状**：`rag-query` 返回 `{"results": []}`

**排查步骤**：

```bash
# 1. 检查索引是否存在
ls -la data/rag_store/docstore.json
# 文件不存在 → 需要构建索引

# 2. 检查 MongoDB 数据
mongosh --eval "use ruiyi; db.knowledge_files.findOne()"
# 无数据 → Knowledge Watcher 未运行

# 3. 检查 Ollama embedding 模型
curl http://localhost:11434/api/tags | grep nomic-embed-text
# 模型不存在 → ollama pull nomic-embed-text

# 4. 重建索引
curl -X POST http://localhost:10086/rag-build \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### 问题 2：检索结果不相关

**症状**：返回结果与查询内容无关

**排查步骤**：

```bash
# 1. 检查是否启用了混合检索
grep "hybrid_search" config.yaml  # 应为 true

# 2. 调整 top_k（增加候选数）
curl -X POST http://localhost:10086/rag-query \
  -d '{"query": "...", "top_k": 10}'

# 3. 检查 chunk_size 是否合理
grep "chunk_size" config.yaml  # 默认 512，太小会丢失上下文

# 4. 试用 scope 限制检索范围
curl -X POST http://localhost:10086/rag-query \
  -d '{"query": "...", "scope": "projects/yiai/workflows/"}'
```

### 问题 3：知识更新后检索不到

**症状**：新增/修改了 markdown 文件，但 RAG 检索不到新内容

**原因**：Knowledge Watcher 每 60s 轮询一次，且只检测变更不自动重建索引

**修复**：

```bash
# 1. 确认文件已被 Watcher 扫描
# 等待 60s 后检查：
mongosh --eval "use ruiyi; db.knowledge_files.findOne({path: 'your-new-file.md'})"

# 2. 手动触发索引重建
curl -X POST http://localhost:10086/rag-build \
  -H "Content-Type: application/json" \
  -d '{"force": false}'

# 3. 如果仍然检索不到，检查 frontmatter
# RAG 默认跳过 status: draft 的文件
grep "status:" your-new-file.md  # 应为 stable 或 active
```

### 问题 4：索引构建失败

**症状**：`rag-build` 返回错误

```bash
# 常见原因及修复：

# 1. Ollama 未运行
curl http://localhost:11434/api/tags  # 检查连通性

# 2. Embedding 模型未拉取
ollama pull nomic-embed-text

# 3. 磁盘空间不足
df -h data/rag_store/

# 4. 有问题的 markdown 文件
# 查看日志定位具体文件：
grep "Failed to index" logs/yiai.log | tail -20

# 5. 强制重建（清空旧索引）
curl -X POST http://localhost:10086/rag-build \
  -d '{"force": true}'
```

### 问题 5：检索延迟过高

**症状**：检索耗时 > 5s

```bash
# 1. 检查索引大小
du -sh data/rag_store/

# 2. 检查是否启用了耗时的增强策略
grep -E "use_rerank|use_hyde" config.yaml
# use_rerank=true → 每个查询多 2-5s
# use_hyde=true  → 每个查询多 1-3s

# 3. 调整配置（生产环境建议）
# config.yaml:
#   rag:
#     use_rerank: false     # 关闭重排序
#     use_hyde: false       # 关闭查询增强（或仅对复杂查询开启）
#     top_k: 3              # 减少检索数量
#     chunk_size: 512       # 减小分块
```

## 五、检索质量优化

### 优化 frontmatter

RAG 检索质量 70% 取决于知识文件质量：

```yaml
# 好的 frontmatter → LLM 更容易理解内容上下文
---
title: "API 规范"                    # 清晰的标题
tags: [yiai, api, rpc, sse]         # 丰富的标签
benefit: "YiAi 后端的完整 API 设计和 RPC 协议规范"  # 一句话价值说明
---
```

### 优化查询

```bash
# 差的查询：太模糊
curl ... -d '{"query": "那个东西怎么用"}'

# 好的查询：具体明确
curl ... -d '{"query": "YiAi RPC 信封协议的 module_name 和 method_name 参数格式"}'

# 使用 scope 缩小范围
curl ... -d '{"query": "Agent 确认门控", "scope": "projects/yiai/workflows"}'
```

### Scope 过滤策略

| 场景 | scope 值 | 效果 |
|------|---------|------|
| 只看 YiAi 开发规范 | `projects/yiai/workflows/开发规范` | 排除架构设计等其他内容 |
| 只看特定文件 | `projects/yiai/workflows/开发规范/02-规范-API规范.md` | 单文件检索 |
| 全库搜索 | 不传 scope | 最广但可能不精 |

## 六、监控指标

### 关键指标

| 指标 | 获取方式 | 健康值 |
|------|---------|--------|
| 索引文件数 | `rag-status` | ≥ MongoDB knowledge_files 数 |
| 检索延迟 | 应用日志 | < 3s（不含 rerank） |
| 监视器状态 | `rag-status` | `watcher_running: true` |
| Embedding 模型 | `ollama list` | `nomic-embed-text` 已加载 |
| 索引磁盘占用 | `du -sh data/rag_store/` | < 1GB |

### 设置告警

```python
# 在健康检查中加入 RAG 状态
@router.get("/health")
async def health_check():
    rag_ready = os.path.exists("data/rag_store/docstore.json")
    if not rag_ready:
        logger.warning("RAG 索引未构建，检索功能不可用")
    return {"rag_ready": rag_ready}
```

## 七、快速诊断命令集

```bash
# 一键诊断 RAG 管道
echo "=== RAG 管道诊断 ==="
echo "1. Ollama 状态:"
curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; print(json.load(sys.stdin)['models'][0]['name'] if json.load(sys.stdin).get('models') else 'NO MODELS')"

echo "2. MongoDB 文件数:"
mongosh --quiet --eval "use ruiyi; db.knowledge_files.countDocuments()"

echo "3. 索引状态:"
curl -s -X POST http://localhost:10086/rag-status -H "Content-Type: application/json" -d '{}'

echo "4. 测试检索:"
curl -s -X POST http://localhost:10086/rag-query -H "Content-Type: application/json" -d '{"query":"RPC协议","top_k":1}'
```