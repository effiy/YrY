---
title: "知识库与 RAG 运维 — YiKnowledge 监视器与索引管理"
aliases: [knowledge-ops, rag-ops, knowledge-watcher, yiKnowledge-ops]
tags: [sre, observability, yiknowledge, rag, knowledge-watcher, indexing]
category: srer/observability
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "SRE 掌握 YiKnowledge 知识监视器和 RAG 索引的日常运维——同步故障排查、索引重建、文件异常处理"
acceptance_criteria:
  - "覆盖知识监视器的 4 种常见故障模式及修复"
  - "包含 RAG 索引的手动操作命令"
  - "YiKnowledge 文件的 frontmatter 校验方法"
related:
  - ./07-可观测-搭建可观测性.md
  - ../incident-response/09-事件-Runbook模板.md
  - ../../YiAi/CLAUDE.md
---

# 知识库与 RAG 运维 — YiKnowledge 监视器与索引管理

> **适用场景**：RAG 检索返回空结果、知识监视器同步异常、YiKnowledge 文件变更后索引未更新。这些是 YrY 特有的运维场景，通用 SRE 指南无法覆盖。

## 架构速览

```
YiKnowledge/ (Markdown 文件)
    │
    │  apscheduler 轮询 (config.yaml: knowledge.watcher_poll_seconds, 默认 60s)
    ▼
知识监视器 (domain/knowledge/watcher.py)
    │  扫描文件树 → 解析 frontmatter → upsert MongoDB knowledge_files
    ▼
RAG 索引器 (domain/rag/indexer.py)
    │  llama_index → 向量索引 (data/rag_store/)
    ▼
RAG 检索 → YiVad/YiPet 查询
```

**关键路径**：文件变更 → 60s 内监视器发现 → MongoDB 更新 → RAG 索引重建 → 用户可检索。

## 健康检查命令

```bash
# RAG 索引状态
curl -s localhost:10086/rag-status | python3 -m json.tool
# 正常返回: {"built": true, "num_docs": N, "last_built_at": "2026-09-15T10:00:00"}

# 知识库扫描状态
curl -s localhost:10086/knowledge-scan | python3 -m json.tool
# 正常返回: {"files": N, "categories": [...]}

# 监视器日志
grep -i "\[Knowledge\]" /var/log/yiai/stdout.log | tail -20
```

## 常见故障模式

### 故障 1：RAG 索引为空（num_docs = 0）

**症状**：`/rag-status` 返回 `{"built": true, "num_docs": 0}`；用户检索无结果。

**排查步骤**：

```bash
# 1. 确认 YiKnowledge 目录存在且有文件
ls /path/to/YiKnowledge/*/ | wc -l

# 2. 检查 MongoDB 中 knowledge_files 集合
mongosh --eval "use yry; print('knowledge_files 文档数: ' + db.knowledge_files.countDocuments())"

# 3. 检查监视器最近一次同步时间
mongosh --eval "use yry; db.knowledge_files.find().sort({updated: -1}).limit(1).toArray()"
```

**根因与修复**：

| 根因 | 判断方法 | 修复 |
|---|---|---|
| 监视器未运行 | `grep "Knowledge.*sync"` 日志无输出 | 检查 apscheduler 配置，重启 YiAi |
| YiKnowledge 路径配置错误 | `config.yaml` 中 `knowledge.root_dir` 指向不存在的路径 | 修正路径并重启 |
| 所有文件 frontmatter 格式错误 | `mongosh` 中文档数为 0 但文件存在 | 检查 YiKnowledge 文件的 frontmatter |
| RAG 索引器未运行 | `rag-status` 显示 `built: false` | 手动触发索引重建 |

### 故障 2：监视器偶发跳过同步周期

**症状**：日志显示 `[Knowledge] 0 files synced`，但文件确实有变更。

**根因**：文件系统 inotify 事件丢失（常见于网络文件系统或大量小文件变更）。

**修复**：
```bash
# 手动触发全量同步（绕过增量检测）
curl -X POST localhost:10086/knowledge-sync

# 如果问题频繁发生，在 config.yaml 中缩短轮询间隔
# knowledge.watcher_poll_seconds: 30  # 从 60 改为 30
```

### 故障 3：RAG 检索结果过时

**症状**：YiKnowledge 文件已更新但 RAG 检索返回旧内容。

**排查**：
```bash
# 检查文件的 frontmatter updated 时间
head -10 /path/to/YiKnowledge/srer/README.md | grep "updated:"

# 检查 MongoDB 中的记录时间
mongosh --eval "use yry; db.knowledge_files.findOne({path: /srer/}).updated"

# 如果 MongoDB 时间是新的但 RAG 返回旧的 → 索引未重建
```

**修复**：
```bash
# 手动触发 RAG 索引重建（注意：可能需要几分钟）
curl -X POST localhost:10086/rag-rebuild
# 监控重建进度
curl -s localhost:10086/rag-status
```

### 故障 4：特定文件不被 RAG 索引

**症状**：某个 YiKnowledge 文件存在但在 RAG 检索中找不到。

**排查步骤**：
1. 检查文件 frontmatter 中 `status` 字段——`draft` 状态默认不被索引
2. 检查文件名是否符合约定——不含下划线、纯数字
3. 检查目录深度是否超过 3 级

```bash
# 验证文件 frontmatter
head -15 /path/to/problem-file.md

# 检查 frontmatter 必需字段: title, tags, category, created, updated, source, type, status
# status: draft → 不被索引（config.yaml 可配置）
```

## 手动操作命令参考

```bash
# 手动触发知识库同步
curl -X POST localhost:10086/knowledge-sync

# 手动重建 RAG 索引（耗时取决于文件数量，通常 1-5 分钟）
curl -X POST localhost:10086/rag-rebuild

# 查看监视器配置
grep -A5 "knowledge:" /path/to/YiAi/config.yaml

# 清理并重建全部索引（极端情况）
# 1. 删除旧索引
rm -rf /path/to/YiAi/data/rag_store/*
# 2. 强制全量同步
curl -X POST localhost:10086/knowledge-sync
# 3. 重建索引
curl -X POST localhost:10086/rag-rebuild
```

## Frontmatter 校验

知识监视器依赖 frontmatter 正确性。新增 YiKnowledge 文件后，建议验证：

```bash
# 快速校验：检查文件的 frontmatter 是否包含所有必需字段
python3 -c "
import yaml, sys
required = ['title', 'tags', 'category', 'created', 'updated', 'source', 'type', 'status']
with open('$FILE') as f:
    content = f.read()
    if content.startswith('---'):
        fm = yaml.safe_load(content.split('---')[1])
        missing = [f for f in required if f not in fm]
        if missing:
            print(f'缺少字段: {missing}')
        else:
            print('frontmatter 完整')
    else:
        print('缺少 frontmatter')
"
```

## 监视器性能基线

| 指标 | 正常范围 | 需关注 | 行动 |
|---|---|---|---|
| 同步周期耗时 | < 5 秒 | 5-15 秒 | > 15 秒 → 检查文件数量是否过多 |
| 文件扫描数 | 等于 YiKnowledge 文件总数 | 少于实际数 | 检查 inotify 或路径配置 |
| RAG 索引文档数 | ≈ knowledge_files 文档数 | 偏差 > 10% | 检查 frontmatter 是否导致部分文件被跳过 |

## 常见反模式

| 反模式 | 后果 | 正确做法 |
|---|---|---|
| RAG 返回空就直接重建索引 | 未排查根因，同样问题很快复现 | 先查 `/rag-status` 和 MongoDB knowledge_files 文档数，定位是监视器问题还是索引器问题 |
| 不验证 frontmatter 就提交新文件 | 文件被知识监视器静默忽略 | 提交前运行 frontmatter 校验脚本 |
| 直接修改 `rss/` 目录 | 自动生成的内容被覆盖 | `rss/` 目录由 RSS 聚合自动生成，不得手动修改 |
| 删除 YiKnowledge 文件但不检查 RAG | 索引中存在已删除文件的向量残留 | 修改文件后手动触发 `knowledge-sync` |