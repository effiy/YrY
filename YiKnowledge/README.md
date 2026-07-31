# YiKnowledge — 个人知识库

按业务域与知识类型分类的可检索知识库。规则手册见 [MEMORY.md](./MEMORY.md)，全库导航见 [INDEX.md](./INDEX.md)。

## 一级分类

| 分类 | 收录范围 |
|---|---|
| [projects/](./projects/) | 各项目业务（stories/）与工程文档（engineering/）镜像 |
| [industry/](./industry/) | 竞品、市场趋势、行业报告、落地案例 |
| [lessons/](./lessons/) | 成功案例、失败复盘、工程陷阱 |
| [methodology/](./methodology/) | AI 专项、PM 框架、思维模型 |
| [people/](./people/) | 团队、利益相关者、专家 |
| [product/](./product/) | 战略、PRD、UX、指标 |
| [resources/](./resources/) | Prompt、模板、阅读清单、测试账号 |
| [tech/](./tech/) | AI 基础、AI 平台、数据、基础设施 |
| [work/](./work/) | 流程、协作、会议、工具 |

## 设计原则

1. **双份归档**：原文 + 摘要两份（详见 MEMORY.md）
2. **YAML Frontmatter** 必填：`title` / `tags` / `category` / `created` / `source` / `type`
3. **英文 kebab-case 命名**：所有文件名采用 ASCII kebab-case，中文语义保留在 frontmatter `title`
4. **渐进式读取**：先读前 15 行 frontmatter，确认相关后再读全文
5. **projects/ 合并结构**：stories/ 存业务内容、engineering/ 存项目工程文档镜像
6. **时效性标注**：外部内容须含 `updated` 与 `last_verified`，半年未核实的标 `status: deprecated`
