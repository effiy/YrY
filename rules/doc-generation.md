---
paths:
  - "docs/故事任务面板/**/*.md"
  - ".claude/templates/**/*"
---

# Document Generation Rules

0. 版本信息: 所有文档必须在开头填充版本行（v版本号 | 日期 | 模型 | 分支），模板占位符（v{version}、{YYYY-MM-DD}、{模型}、{branch}等）不得保留到产出文件
1. **项目名前缀强制**: 所有 rui 生成的目录必须按项目独立子目录组织。缺失项目级目录视为命名违规，PM 不得创建、管线不得接受:
   - 故事目录: `docs/故事任务面板/<project>/<name>/`（`<project>` 为大驼峰，`<name>` 为 kebab-case），如 `YiWeb/user-login/`
   - 组件文档: `docs/组件文档/<project>/<component-name>/`（`<component-name>` 为 kebab-case），如 `YiWeb/user-table/`
   - 接口文档: `docs/接口文档/<project>/<resource-name>/`（`<resource-name>` 为 kebab-case），如 `YiWeb/user-api/`
   - 页面文档: `docs/页面文档/<project>/<page-name>/`（`<page-name>` 为 kebab-case），如 `YiWeb/login/`
   - 领域模型: `docs/领域模型/<project>/<domain-name>/`（`<domain-name>` 为 kebab-case），如 `YiWeb/user-domain/`
   缺失项目级目录时，`list.js` 和 `recommend.js` 告警，且管线阻断（`no-project-prefix`）
2. 产出内聚: 关键产出只允许在对应故事目录下，不得在故事目录外生成文档
3. 证据标准: 写入 docs/ 的陈述必须可验证（Level A/B）或标注未知（Level C），无支撑视为幻觉（Level D 禁止）
4. 增量裁剪:
   - T1 微观（措辞/格式）: 跳过影响分析和架构设计，仅变更章节
   - T2 局部（增删故事/接口变更）: 裁剪影响分析和架构设计，重写目标+下游
   - T3 范围（边界变化/跨故事重构）: 完整重跑影响分析和架构设计，全级联刷新
5. 不编造未验证的模块名/接口/路径
6. 策展阶段必须 git commit
7. --from-code 空输入: req 为空时进入自主探索模式，pm 扫描源码输出推荐列表（模块名 kebab-case、覆盖范围、Level A 路径证据、优先级），等用户选择后按选定范围生成