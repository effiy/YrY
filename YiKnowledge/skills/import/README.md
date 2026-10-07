---
title: 文档同步技能说明
updated: 2026-09-10
---

## 文档同步工具

### 快速开始

```bash
# 全量同步工作区文档到远程 API
node .claude/yry-import/sync.mjs

# 列出待同步文件（不实际上传）
node .claude/yry-import/sync.mjs --mode list

# 从远程拉取文档
node .claude/yry-import/sync.mjs --mode pull
```

### 工作原理

1. **扫描** — 从项目根目录扫描所有文件
2. **过滤** — 排除 `.git`/`node_modules`/`dist` 等目录
3. **解析路径** — 计算远程路径映射
4. **查询会话** — 区分新建和覆盖文件
5. **上传** — 并发 4，超时 30s，单文件失败不阻塞

### 安全约束

- 手动触发，不自动覆盖远程
- `API_X_TOKEN` 不在代码/日志/文档中持久化
- 大文件（>1MB）自动跳过

### 架构

```
import/
├── SKILL.md           # 人机双读的契约文档
├── sync.mjs           # 可执行入口
├── rules/
│   └── sync-rules.md  # 完整操作规范（API 契约/扫描规则/错误模型）
└── lib/               # 核心模块（scan/filter/upload/pull/diagnose）
```