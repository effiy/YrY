---
title: YrY Knowledge Base — Quick Reference
aliases: [quick-reference, cheat-sheet, quick-ref, lookup]
tags: [index, quick-reference, cheat-sheet, navigation, lookup]
category: root
created: 2026-08-24
updated: 2026-10-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-09-18
roles: [engineer, leader, product, aier, sre, executive, curator]
benefit: "Anyone finds the right file in under 10 seconds — 'I want to X → go to file Y'"
acceptance_criteria:
  - "50+ task → file mappings covering all 7 roles"
  - "each mapping is a verified existing file path"
  - "organized by role and task type"
related:
  - ./INDEX.md
  - ./README.md
  - ./MEMORY.md
---

# YrY Knowledge Base — Quick Reference

> **How to use:** Find your task in the left column, go to the file in the right column. Every path is verified against actual file names.

## Engineer — How to Implement

### BUILD — Design & Construct

| I want to... | Go to |
|---|---|
| Add a cross-project RPC call | [engineer/build/implement-cross-project-rpc-call.md](engineer/build/implement-cross-project-rpc-call.md) |
| Implement SSE streaming | [engineer/build/implement-sse-streaming.md](engineer/build/implement-sse-streaming.md) |
| Design MongoDB schemas | [engineer/build/04-构建-MongoDB模式设计.md](engineer/build/04-构建-MongoDB模式设计.md) |
| Design API patterns | [engineer/build/05-构建-API设计模式.md](engineer/build/05-构建-API设计模式.md) |
| Debug and troubleshoot | [engineer/build/06-构建-调试排错指南.md](engineer/build/06-构建-调试排错指南.md) |
| Optimize performance | [engineer/build/07-构建-性能优化指南.md](engineer/build/07-构建-性能优化指南.md) |
| Configure environment variables | [engineer/build/08-构建-环境变量配置.md](engineer/build/08-构建-环境变量配置.md) |
| Reference cross-project RPC protocol | [engineer/build/cross-project-rpc-protocol.md](engineer/build/cross-project-rpc-protocol.md) |

### SHIP — Quality & Release

| I want to... | Go to |
|---|---|
| Plan capacity | [engineer/ship/01-交付-容量规划.md](engineer/ship/01-交付-容量规划.md) |
| Harden supply chain | [engineer/ship/02-交付-加固供应链.md](engineer/ship/02-交付-加固供应链.md) |
| Migrate data safely | [engineer/ship/03-交付-数据迁移.md](engineer/ship/03-交付-数据迁移.md) |
| Track quarterly tech debt | [engineer/ship/04-交付-季度技术债.md](engineer/ship/04-交付-季度技术债.md) |
| Implement retry with backoff | [engineer/ship/05-交付-退避重试.md](engineer/ship/05-交付-退避重试.md) |
| Set up testing infrastructure | [engineer/ship/06-交付-搭建测试基础设施.md](engineer/ship/06-交付-搭建测试基础设施.md) |
| Set up CI/CD pipeline | [engineer/ship/07-交付-CICD流水线.md](engineer/ship/07-交付-CICD流水线.md) |
| Deploy to production | [engineer/ship/08-交付-部署指南.md](engineer/ship/08-交付-部署指南.md) |

### LEARN — Lessons & Gotchas

| I want to... | Go to |
|---|---|
| Check known gotchas | [engineer/learn/lessons/](engineer/learn/lessons/) |
| Review wins (success patterns) | [engineer/learn/lessons/](engineer/learn/lessons/) |
| Review failures (postmortems) | [engineer/learn/lessons/](engineer/learn/lessons/) |
| Learn YiAi architecture | [engineer/learn/projects/yiai/](engineer/learn/projects/yiai/) |
| Learn YiVad architecture | [engineer/learn/projects/yivad/](engineer/learn/projects/yivad/) |
| Learn YiPet architecture | [engineer/learn/projects/yipet/](engineer/learn/projects/yipet/) |

## Leader — How to Decide

### Architecture & Decisions

| I want to... | Go to |
|---|---|
| Write an ADR | [leader/architecture/01-架构-架构决策设计.md](leader/architecture/01-架构-架构决策设计.md) |
| Review DORA metrics baseline | [leader/architecture/02-架构-DORA指标-2026-Q2基线.md](leader/architecture/02-架构-DORA指标-2026-Q2基线.md) |
| Assess architecture maturity | [leader/architecture/03-架构-架构成熟度模型-2026-08.md](leader/architecture/03-架构-架构成熟度模型-2026-08.md) |
| Evaluate a technology (LLM provider) | [leader/architecture/06-架构-技术选型-LLM提供商.md](leader/architecture/06-架构-技术选型-LLM提供商.md) |
| Plan Q4 tech strategy | [leader/architecture/08-架构-技术战略-2026-Q4方向.md](leader/architecture/08-架构-技术战略-2026-Q4方向.md) |
| See architecture landscape | [leader/architecture/09-架构-架构全景图.md](leader/architecture/09-架构-架构全景图.md) |
| Review code review standards | [leader/architecture/10-架构-代码审查标准.md](leader/architecture/10-架构-代码审查标准.md) |
| Browse ADRs by project | [leader/decisions/](leader/decisions/) |

### Risk & Capacity

| I want to... | Go to |
|---|---|
| Assess launch risks | [leader/risk/01-风险-上线风险评估.md](leader/risk/01-风险-上线风险评估.md) |
| Write a postmortem (methodology) | [leader/risk/02-风险-事后复盘.md](leader/risk/02-风险-事后复盘.md) |
| Maintain risk register | [leader/risk/03-风险-风险登记册模板.md](leader/risk/03-风险-风险登记册模板.md) |
| Manage dependency risks | [leader/risk/04-风险-依赖风险管理.md](leader/risk/04-风险-依赖风险管理.md) |
| Lead incident command | [leader/risk/05-风险-事故指挥指南.md](leader/risk/05-风险-事故指挥指南.md) |
| Run security review | [leader/risk/06-风险-安全审查清单.md](leader/risk/06-风险-安全审查清单.md) |
| Run a FinOps review | [leader/capacity/01-容量-FinOps审查.md](leader/capacity/01-容量-FinOps审查.md) |
| Track monthly costs | [leader/capacity/02-容量-成本追踪模板.md](leader/capacity/02-容量-成本追踪模板.md) |
| Audit dependencies | [leader/capacity/03-容量-依赖审计清单.md](leader/capacity/03-容量-依赖审计清单.md) |

### Roadmap & Planning

| I want to... | Go to |
|---|---|
| View progress dashboard | [leader/roadmap/01-路线图-进度看板.md](leader/roadmap/01-路线图-进度看板.md) |
| Define SLOs | [leader/roadmap/03-路线图-定义SLO.md](leader/roadmap/03-路线图-定义SLO.md) |
| Evaluate a technology | [leader/roadmap/07-路线图-技术选型.md](leader/roadmap/07-路线图-技术选型.md) |
| Manage tech debt | [leader/roadmap/08-路线图-管理技术债.md](leader/roadmap/08-路线图-管理技术债.md) |
| Plan tech roadmap | [leader/roadmap/09-路线图-规划技术路线图.md](leader/roadmap/09-路线图-规划技术路线图.md) |
| Run quarterly review | [leader/roadmap/11-路线图-季度审查流程.md](leader/roadmap/11-路线图-季度审查流程.md) |
| Communicate with stakeholders | [leader/roadmap/12-路线图-利益相关者沟通.md](leader/roadmap/12-路线图-利益相关者沟通.md) |
| Manage operating cadence | [leader/roadmap/13-路线图-运营节奏.md](leader/roadmap/13-路线图-运营节奏.md) |
| Estimate engineering effort | [leader/roadmap/14-路线图-估算指南.md](leader/roadmap/14-路线图-估算指南.md) |

## product — What to Build

| I want to... | Go to |
|---|---|
| Write a PRD | [product/discovery/01-发现-编写PRD.md](product/discovery/01-发现-编写PRD.md) |
| Use PRD template | [product/discovery/01-需求-PRD模板.md](product/discovery/01-需求-PRD模板.md) |
| Do user research | [product/frameworks/01-框架-用户研究方法.md](product/frameworks/01-框架-用户研究方法.md) |
| Prioritize features (RICE/ICE) | [product/frameworks/06-框架-RICE-ICE优先级.md](product/frameworks/06-框架-RICE-ICE优先级.md) |
| Use MoSCoW prioritization | [product/frameworks/04-框架-MoSCoW优先级.md](product/frameworks/04-框架-MoSCoW优先级.md) |
| Understand JTBD framework | [product/frameworks/02-框架-JTBD框架摘要.md](product/frameworks/02-框架-JTBD框架摘要.md) |
| Use Kano model | [product/frameworks/03-框架-Kano模型摘要.md](product/frameworks/03-框架-Kano模型摘要.md) |
| Map user stories | [product/frameworks/07-框架-用户故事地图.md](product/frameworks/07-框架-用户故事地图.md) |
| Run a sprint | [product/delivery/01-交付-运作Sprint.md](product/delivery/01-交付-运作Sprint.md) |
| Define north star metric | [product/discovery/01-指标-北极星指标.md](product/discovery/01-指标-北极星指标.md) |
| Design OKRs | [product/frameworks/05-框架-OKR设计摘要.md](product/frameworks/05-框架-OKR设计摘要.md) |
| Analyze competitors (product) | [product/strategy/02-战略-竞品分析方法.md](product/strategy/02-战略-竞品分析方法.md) |
| Design product roadmap | [product/strategy/03-战略-产品路线图设计.md](product/strategy/03-战略-产品路线图设计.md) |
| Validate product-market fit | [product/strategy/04-战略-产品市场匹配.md](product/strategy/04-战略-产品市场匹配.md) |
| Run beta testing | [product/delivery/04-交付-Beta测试指南.md](product/delivery/04-交付-Beta测试指南.md) |
| Coordinate cross-project delivery | [product/delivery/05-交付-跨项目协作.md](product/delivery/05-交付-跨项目协作.md) |
| Conduct user interviews | [product/discovery/04-发现-用户访谈综合.md](product/discovery/04-发现-用户访谈综合.md) |
| Build user personas | [product/discovery/03-发现-用户画像方法.md](product/discovery/03-发现-用户画像方法.md) |
| Run UX checklist | [product/discovery/01-体验-UX检查清单.md](product/discovery/01-体验-UX检查清单.md) |

## SRE — How to Operate

### Incident Response

| I want to... | Go to |
|---|---|
| Respond to an incident | [sre/incident-response/04-事件-响应事件.md](sre/incident-response/04-事件-响应事件.md) |
| Handle a data breach | [sre/incident-response/01-事件-处理数据泄露.md](sre/incident-response/01-事件-处理数据泄露.md) |
| Run a war room | [sre/incident-response/05-事件-作战室运作.md](sre/incident-response/05-事件-作战室运作.md) |
| Write a postmortem (guide) | [sre/incident-response/07-事件-事后复盘指南.md](sre/incident-response/07-事件-事后复盘指南.md) |
| See postmortem example | [sre/incident-response/14-事件-事后复盘示例.md](sre/incident-response/14-事件-事后复盘示例.md) |
| Facilitate postmortem meeting | [sre/incident-response/13-事件-复盘会议主持.md](sre/incident-response/13-事件-复盘会议主持.md) |
| Write a runbook | [sre/incident-response/09-事件-Runbook模板.md](sre/incident-response/09-事件-Runbook模板.md) |
| Use incident communication template | [sre/incident-response/10-事件-事件沟通模板.md](sre/incident-response/10-事件-事件沟通模板.md) |
| Plan disaster recovery | [sre/incident-response/11-事件-灾难恢复计划.md](sre/incident-response/11-事件-灾难恢复计划.md) |
| Run FMEA analysis | [sre/incident-response/16-事件-FMEA模板.md](sre/incident-response/16-事件-FMEA模板.md) |
| Run a Game Day | [sre/incident-response/08-事件-GameDay演练.md](sre/incident-response/08-事件-GameDay演练.md) |
| Handle on-call shift | [sre/incident-response/02-事件-处理值班轮班.md](sre/incident-response/02-事件-处理值班轮班.md) |
| Set up on-call rotation | [sre/incident-response/06-事件-建立值班轮换.md](sre/incident-response/06-事件-建立值班轮换.md) |
| Do shift handoff | [sre/incident-response/03-事件-值班交接.md](sre/incident-response/03-事件-值班交接.md) |
| Reduce toil | [sre/incident-response/12-事件-减少重复劳动.md](sre/incident-response/12-事件-减少重复劳动.md) |

### Observability

| I want to... | Go to |
|---|---|
| Set up observability | [sre/observability/07-可观测-搭建可观测性.md](sre/observability/07-可观测-搭建可观测性.md) |
| Understand observability triad | [sre/observability/05-可观测-可观测性三支柱.md](sre/observability/05-可观测-可观测性三支柱.md) |
| Define SLOs/SLIs | [sre/observability/08-可观测-SLO与SLI定义.md](sre/observability/08-可观测-SLO与SLI定义.md) |
| Manage error budgets | [sre/observability/12-可观测-错误预算策略.md](sre/observability/12-可观测-错误预算策略.md) |
| Configure alerting rules | [sre/observability/10-可观测-告警规则配置.md](sre/observability/10-可观测-告警规则配置.md) |
| Design health checks | [sre/observability/14-可观测-健康检查设计.md](sre/observability/14-可观测-健康检查设计.md) |
| Set up SRE metrics | [sre/observability/15-可观测-SRE指标体系.md](sre/observability/15-可观测-SRE指标体系.md) |
| Manage SLA | [sre/observability/16-可观测-SLA管理.md](sre/observability/16-可观测-SLA管理.md) |
| Run performance tests | [sre/observability/13-可观测-性能测试指南.md](sre/observability/13-可观测-性能测试指南.md) |
| Monitor capacity and cost | [sre/observability/01-可观测-容量与成本.md](sre/observability/01-可观测-容量与成本.md) |
| Backup and restore database | [sre/observability/11-可观测-数据库备份恢复.md](sre/observability/11-可观测-数据库备份恢复.md) |
| Operate knowledge base and RAG | [sre/observability/17-可观测-知识库与RAG运维.md](sre/observability/17-可观测-知识库与RAG运维.md) |
| Manage Ollama models | [sre/observability/18-可观测-Ollama模型管理.md](sre/observability/18-可观测-Ollama模型管理.md) |
| Track tech debt (ops view) | [sre/observability/09-可观测-技术债清单.md](sre/observability/09-可观测-技术债清单.md) |
| Set up CI/CD | [sre/observability/02-可观测-CICD.md](sre/observability/02-可观测-CICD.md) |

### Release Management

| I want to... | Go to |
|---|---|
| Ship a release | [sre/release/04-发布-发布流程.md](sre/release/04-发布-发布流程.md) |
| Do a canary release | [sre/release/01-发布-金丝雀发布.md](sre/release/01-发布-金丝雀发布.md) |
| Ship a hotfix | [sre/release/02-发布-热修复发布.md](sre/release/02-发布-热修复发布.md) |
| Manage release freeze | [sre/release/03-发布-发布冻结.md](sre/release/03-发布-发布冻结.md) |
| Do a rollback drill | [sre/release/05-发布-回滚演练.md](sre/release/05-发布-回滚演练.md) |
| Manage change process | [sre/release/06-发布-变更管理流程.md](sre/release/06-发布-变更管理流程.md) |
| Run production readiness review | [sre/release/07-发布-生产就绪审查.md](sre/release/07-发布-生产就绪审查.md) |

## AI Engineer — How to Use AI

| I want to... | Go to |
|---|---|
| Understand LLM fundamentals | [aier/foundations/01-基础-LLM基础.md](aier/foundations/01-基础-LLM基础.md) |
| Understand RAG design patterns | [aier/foundations/02-基础-RAG设计模式.md](aier/foundations/02-基础-RAG设计模式.md) |
| Learn AI security | [aier/foundations/03-基础-AI安全与防护.md](aier/foundations/03-基础-AI安全与防护.md) |
| Design agent architecture | [aier/methods/01-方法-Agent架构模式.md](aier/methods/01-方法-Agent架构模式.md) |
| Evaluate agent quality | [aier/methods/02-方法-Agent评估.md](aier/methods/02-方法-Agent评估.md) |
| Evaluate LLM quality | [aier/methods/04-方法-LLM评估.md](aier/methods/04-方法-LLM评估.md) |
| Master prompt engineering | [aier/methods/05-方法-提示词工程.md](aier/methods/05-方法-提示词工程.md) |
| Understand agent harness plugin | [aier/methods/03-方法-Agent-Harness插件架构.md](aier/methods/03-方法-Agent-Harness插件架构.md) |
| Use agent tool calling prompt | [aier/prompts/01-提示词-Agent工具使用.md](aier/prompts/01-提示词-Agent工具使用.md) |
| Apply chain-of-thought | [aier/prompts/02-提示词-思维链.md](aier/prompts/02-提示词-思维链.md) |
| Review code with AI | [aier/prompts/03-提示词-代码审查.md](aier/prompts/03-提示词-代码审查.md) |
| Translate with AI | [aier/prompts/04-提示词-多语言翻译.md](aier/prompts/04-提示词-多语言翻译.md) |
| Use RAG system prompt | [aier/prompts/05-提示词-RAG系统.md](aier/prompts/05-提示词-RAG系统.md) |
| Generate SQL with AI | [aier/prompts/06-提示词-SQL生成.md](aier/prompts/06-提示词-SQL生成.md) |
| Generate weekly reports | [aier/prompts/07-提示词-周报生成.md](aier/prompts/07-提示词-周报生成.md) |
| Compare LLM models | [aier/platform/02-平台-LLM对比.md](aier/platform/02-平台-LLM对比.md) |
| Choose embedding model | [aier/platform/01-平台-Embedding模型选型.md](aier/platform/01-平台-Embedding模型选型.md) |
| Choose vector database | [aier/platform/03-平台-向量数据库选型.md](aier/platform/03-平台-向量数据库选型.md) |
| Apply traditional ML | [aier/machine-learning/01-机器学习-传统机器学习模式.md](aier/machine-learning/01-机器学习-传统机器学习模式.md) |

## Executive — Business Strategy

| I want to... | Go to |
|---|---|
| Analyze competitors | [executive/industry/03-行业-竞品分析模板.md](executive/industry/03-行业-竞品分析模板.md) |
| Analyze AI dev tools landscape | [executive/industry/06-行业-AI开发工具竞品格局-2026H1.md](executive/industry/06-行业-AI开发工具竞品格局-2026H1.md) |
| Deep-dive Cursor competitor | [executive/industry/08-行业-竞品分析-Cursor.md](executive/industry/08-行业-竞品分析-Cursor.md) |
| Deep-dive Copilot competitor | [executive/industry/09-行业-竞品分析-Copilot.md](executive/industry/09-行业-竞品分析-Copilot.md) |
| Read AI industry trends 2026 | [executive/industry/04-行业-2026-AI行业关键趋势.md](executive/industry/04-行业-2026-AI行业关键趋势.md) |
| Analyze AI market H1 2026 | [executive/industry/05-行业-2026H1-AI市场趋势分析.md](executive/industry/05-行业-2026H1-AI市场趋势分析.md) |
| Run Porter's Five Forces | [executive/strategy/07-战略-波特五力模型.md](executive/strategy/07-战略-波特五力模型.md) |
| Run SWOT analysis | [executive/strategy/10-战略-SWOT分析.md](executive/strategy/10-战略-SWOT分析.md) |
| Apply Blue Ocean Strategy | [executive/strategy/01-战略-蓝海战略.md](executive/strategy/01-战略-蓝海战略.md) |
| Design business model | [executive/strategy/02-战略-商业模式画布.md](executive/strategy/02-战略-商业模式画布.md) |
| Make executive decisions | [executive/strategy/18-战略-高管决策框架.md](executive/strategy/18-战略-高管决策框架.md) |
| Plan annual strategy | [executive/roadmap/01-路线图-年度战略规划.md](executive/roadmap/01-路线图-年度战略规划.md) |
| Plan quarterly review | [executive/roadmap/04-路线图-季度业务回顾.md](executive/roadmap/04-路线图-季度业务回顾.md) |
| Track organizational OKRs | [executive/roadmap/03-路线图-组织OKR追踪.md](executive/roadmap/03-路线图-组织OKR追踪.md) |
| Plan headcount and budget | [executive/roadmap/02-路线图-人员预算规划.md](executive/roadmap/02-路线图-人员预算规划.md) |
| Read executive book notes | [executive/reading-list/](executive/reading-list/) |
| Use executive checklist | [executive/CHECKLIST.md](executive/CHECKLIST.md) |

## Curator — Knowledge Governance

| I want to... | Go to |
|---|---|
| Create a new knowledge file | [curator/governance/04-治理-就绪检查清单.md](curator/governance/04-治理-就绪检查清单.md) |
| Use a document template | [curator/templates/00-INDEX.md](curator/templates/00-INDEX.md) |
| Check knowledge base health | [curator/governance/01-治理-知识健康看板.md](curator/governance/01-治理-知识健康看板.md) |
| Understand governance model | [curator/governance/02-治理-治理规范.md](curator/governance/02-治理-治理规范.md) |
| Process inbox items | [curator/governance/03-治理-收件箱.md](curator/governance/03-治理-收件箱.md) |
| Review triage queue | [curator/governance/07-治理-分类处理.md](curator/governance/07-治理-分类处理.md) |
| See daily ops quick reference | [curator/governance/08-治理-操作速查卡.md](curator/governance/08-治理-操作速查卡.md) |
| See the directory blueprint | [curator/diagrams/02-图表-目录蓝图.md](curator/diagrams/02-图表-目录蓝图.md) |
| See the knowledge map | [curator/diagrams/03-图表-知识地图.md](curator/diagrams/03-图表-知识地图.md) |
| See the user journey | [curator/diagrams/04-图表-用户旅程.md](curator/diagrams/04-图表-用户旅程.md) |
| Capture tacit knowledge | [curator/governance/06-治理-隐性知识待办.md](curator/governance/06-治理-隐性知识待办.md) |
| View review audit log | [curator/governance/05-治理-审查日志.md](curator/governance/05-治理-审查日志.md) |
| Archive a file | [curator/archive/](curator/archive/) |

## Cross-Cutting — Domain Indexes

| I want to... | Go to |
|---|---|
| Find all security content | [engineer/SECURITY.md](engineer/SECURITY.md) |
| Find all collaboration content | [curator/COLLABORATION.md](curator/COLLABORATION.md) |
| Find all engineering content | [engineer/ENGINEERING.md](engineer/ENGINEERING.md) |
| Browse project-specific knowledge | [projects/INDEX.md](projects/INDEX.md) |

## Search Patterns

```bash
# Find by tag
rg "^tags:.*keyword" YiKnowledge -l

# Find by role visibility
rg "^roles:.*engineer" YiKnowledge -l

# Find active content only
rg "^lifecycle: active" YiKnowledge -l

# Scan frontmatter before reading
head -15 YiKnowledge/path/to/file.md

# Show document structure
grep "^## " YiKnowledge/path/to/file.md
```