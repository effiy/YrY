---
paths:
  - "docs/故事任务面板/**/*.md"
  - ".claude/**"
---

# Import-Docs Rules

1. **三检查点同步**: 文档生成后 / 验证后 / 交付时，每个检查点独立调用 `Skill(import-docs, --workspace)`
2. **`no-token` 降级**: API_X_TOKEN 缺失是唯一合法跳过条件。网络超时记录告警不阻断，下次覆盖重试
3. **同步范围**: 全部 .md + .claude/ 目录，排除 .git 和 node_modules
4. **禁止 Token 落盘**: API_X_TOKEN 仅从环境变量读取，禁止写入任何文件
