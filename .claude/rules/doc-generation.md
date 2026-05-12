---
paths:
  - "docs/故事任务面板/**/*.md"
  - ".claude/skills/rui/templates/**/*"
---

# Document Generation Rules

0. 版本信息: 所有文档必须在开头填充版本行（v版本号 | 日期 | 模型 | 分支），模板占位符（v{version}、{YYYY-MM-DD}、{模型}、{branch}等）不得保留到产出文件
1. 故事目录命名: 目录名必须为 `<project>-<name>` 格式（`<project>` 为项目标识，`<name>` 为 kebab-case 故事名），如 `YiWeb-user-login`。缺失项目前缀时，list.js 和 recommend.js 会告警
2. 产出内聚: 关键产出只允许在对应故事目录下，不得在故事目录外生成文档
3. 证据标准: 写入 docs/ 的陈述必须可验证（Level A/B）或标注未知（Level C），无支撑视为幻觉（Level D 禁止）
4. 增量裁剪:
   - T1 微观（措辞/格式）: 跳过影响分析和架构设计，仅变更章节
   - T2 局部（增删故事/接口变更）: 裁剪影响分析和架构设计，重写目标+下游
   - T3 范围（边界变化/跨故事重构）: 完整重跑影响分析和架构设计，全级联刷新
5. 不编造未验证的模块名/接口/路径
6. 策展阶段必须 git commit
7. --from-code 空输入: req 为空时进入自主探索模式，pm 扫描源码输出推荐列表（模块名 kebab-case、覆盖范围、Level A 路径证据、优先级），等用户选择后按选定范围生成