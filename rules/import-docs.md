---
paths:
  - "docs/故事任务面板/**/*.md"
  - ".claude/**"
---

# Import-Docs Rules

1. **多检查点强制同步**: import-docs 在管线中至少三个检查点独立执行，每个检查点完成后必须调用 `delivery-gate.js mark --step docs_synced`：
   - 文档生成后：全文档基线产出即同步
   - 验证后：实施与测试报告产出即同步
   - 交付时：全项目全量最终同步
   每个检查点独立调用 `Skill(import-docs, --workspace)`，不等待管线末端。三步交付管线全部完成后 `delivery_pipeline.docs_synced` 为 true。

2. **`no-token` 降级仅限 Token 缺失**: API_X_TOKEN 环境变量缺失是唯一合法的跳过条件。
   网络超时、远端不可达等临时故障记录告警但不阻断管线，下次 rui 运行时覆盖重试。

3. **同步范围**: 当前项目全部 .md 文件 + .claude/ 目录下所有文件（不限扩展名）。
   排除 .git 和 node_modules。
   `docs/故事任务面板/` 下文件以 `故事任务面板` 为一级目录标签，不嵌套在项目目录下。

4. **禁止 Token 落盘**: API_X_TOKEN 仅从环境变量读取，禁止写入配置文件、日志、文档或代码。
