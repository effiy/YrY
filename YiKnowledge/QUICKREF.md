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
| Add a cross-project RPC call | [engineer/build/0007-构建-实现跨项目RPC调用.md](engineer/build/007-构建-实现跨项目RPC调用.md) |
| Implement SSE streaming | [engineer/build/0008-构建-实现SSE流式推送.md](engineer/build/008-构建-实现SSE流式推送.md) |
| Design MongoDB schemas | [engineer/build/0001-构建-MongoDB模式设计.md](engineer/build/001-构建-MongoDB模式设计.md) |
| Design API patterns | [engineer/build/0002-构建-API设计模式.md](engineer/build/002-构建-API设计模式.md) |
| Debug and troubleshoot | [engineer/build/0003-构建-调试排错指南.md](engineer/build/003-构建-调试排错指南.md) |
| Optimize performance | [engineer/build/0004-构建-性能优化指南.md](engineer/build/004-构建-性能优化指南.md) |
| Configure environment variables | [engineer/build/0005-构建-环境变量配置.md](engineer/build/005-构建-环境变量配置.md) |
| Reference cross-project RPC protocol | [engineer/build/0006-构建-跨项目RPC协议设计.md](engineer/build/006-构建-跨项目RPC协议设计.md) |

### SHIP — Quality & Release

| I want to... | Go to |
|---|---|
| Plan capacity | [engineer/ship/0001-交付-容量规划.md](engineer/ship/001-交付-容量规划.md) |
| Harden supply chain | [engineer/ship/0002-交付-加固供应链.md](engineer/ship/002-交付-加固供应链.md) |
| Migrate data safely | [engineer/ship/0003-交付-数据迁移.md](engineer/ship/003-交付-数据迁移.md) |
| Track quarterly tech debt | [engineer/ship/0004-交付-季度技术债.md](engineer/ship/004-交付-季度技术债.md) |
| Implement retry with backoff | [engineer/ship/0005-交付-退避重试.md](engineer/ship/005-交付-退避重试.md) |
| Set up testing infrastructure | [engineer/ship/0006-交付-搭建测试基础设施.md](engineer/ship/006-交付-搭建测试基础设施.md) |
| Set up CI/CD pipeline | [engineer/ship/0007-交付-CICD流水线.md](engineer/ship/007-交付-CICD流水线.md) |
| Deploy to production | [engineer/ship/0008-交付-部署指南.md](engineer/ship/008-交付-部署指南.md) |

### LEARN — Lessons & Gotchas

| I want to... | Go to |
|---|---|
| Check known gotchas | [engineer/learn/lessons/](engineer/learn/lessons/) |
| Review wins (success patterns) | [engineer/learn/lessons/](engineer/learn/lessons/) |
| Review failures (postmortems) | [engineer/learn/lessons/](engineer/learn/lessons/) |
| Learn YiAi architecture | [engineer/projects/yiai/](engineer/projects/yiai/) |
| Learn YiVad architecture | [engineer/projects/yivad/](engineer/projects/yivad/) |
| Learn YiPet architecture | [engineer/projects/yipet/](engineer/projects/yipet/) |

## Leader — How to Decide

### Architecture & Decisions

| I want to... | Go to |
|---|---|
| Write an ADR | [leader/architecture/0001-架构-架构决策设计.md](leader/architecture/001-架构-架构决策设计.md) |
| Review DORA metrics baseline | [leader/architecture/0002-架构-DORA指标-2026-Q2基线.md](leader/architecture/002-架构-DORA指标-2026-Q2基线.md) |
| Assess architecture maturity | [leader/architecture/0003-架构-架构成熟度模型-2026-08.md](leader/architecture/003-架构-架构成熟度模型-2026-08.md) |
| Evaluate a technology (LLM provider) | [leader/architecture/0006-架构-技术选型-LLM提供商.md](leader/architecture/006-架构-技术选型-LLM提供商.md) |
| Plan Q4 tech strategy | [leader/architecture/0008-架构-技术战略-2026-Q4方向.md](leader/architecture/008-架构-技术战略-2026-Q4方向.md) |
| See architecture landscape | [leader/architecture/0009-架构-架构全景图.md](leader/architecture/009-架构-架构全景图.md) |
| Review code review standards | [leader/architecture/0010-架构-代码审查标准.md](leader/architecture/010-架构-代码审查标准.md) |
| Browse ADRs by project | [leader/decisions/](leader/decisions/) |

### Risk & Capacity

| I want to... | Go to |
|---|---|
| Assess launch risks | [leader/risk/0001-风险-上线风险评估.md](leader/risk/001-风险-上线风险评估.md) |
| Write a postmortem (methodology) | [leader/risk/0002-风险-事后复盘.md](leader/risk/002-风险-事后复盘.md) |
| Maintain risk register | [leader/risk/0003-风险-风险登记册模板.md](leader/risk/003-风险-风险登记册模板.md) |
| Manage dependency risks | [leader/risk/0004-风险-依赖风险管理.md](leader/risk/004-风险-依赖风险管理.md) |
| Lead incident command | [leader/risk/0005-风险-事故指挥指南.md](leader/risk/005-风险-事故指挥指南.md) |
| Run security review | [leader/risk/0006-风险-安全审查清单.md](leader/risk/006-风险-安全审查清单.md) |
| Run a FinOps review | [leader/capacity/0001-容量-FinOps审查.md](leader/capacity/001-容量-FinOps审查.md) |
| Track monthly costs | [leader/capacity/0002-容量-成本追踪模板.md](leader/capacity/002-容量-成本追踪模板.md) |
| Audit dependencies | [leader/capacity/0003-容量-依赖审计清单.md](leader/capacity/003-容量-依赖审计清单.md) |

### Roadmap & Planning

| I want to... | Go to |
|---|---|
| View progress dashboard | [leader/roadmap/0001-路线图-进度看板.md](leader/roadmap/001-路线图-进度看板.md) |
| Define SLOs | [leader/roadmap/0003-路线图-定义SLO.md](leader/roadmap/003-路线图-定义SLO.md) |
| Evaluate a technology | [leader/roadmap/0007-路线图-技术选型.md](leader/roadmap/007-路线图-技术选型.md) |
| Manage tech debt | [leader/roadmap/0008-路线图-管理技术债.md](leader/roadmap/008-路线图-管理技术债.md) |
| Plan tech roadmap | [leader/roadmap/0009-路线图-规划技术路线图.md](leader/roadmap/009-路线图-规划技术路线图.md) |
| Run quarterly review | [leader/roadmap/0011-路线图-季度审查流程.md](leader/roadmap/011-路线图-季度审查流程.md) |
| Communicate with stakeholders | [leader/roadmap/0012-路线图-利益相关者沟通.md](leader/roadmap/012-路线图-利益相关者沟通.md) |
| Manage operating cadence | [leader/roadmap/0013-路线图-运营节奏.md](leader/roadmap/013-路线图-运营节奏.md) |
| Estimate engineering effort | [leader/roadmap/0014-路线图-估算指南.md](leader/roadmap/014-路线图-估算指南.md) |

## product — What to Build

| I want to... | Go to |
|---|---|
| Write a PRD | [product/discovery/0001-发现-编写PRD.md](product/discovery/001-发现-编写PRD.md) |
| Use PRD template | [product/discovery/01-需求-PRD模板.md](product/discovery/01-需求-PRD模板.md) |
| Do user research | [product/frameworks/0001-框架-用户研究方法.md](product/frameworks/001-框架-用户研究方法.md) |
| Prioritize features (RICE/ICE) | [product/frameworks/0006-框架-RICE-ICE优先级.md](product/frameworks/006-框架-RICE-ICE优先级.md) |
| Use MoSCoW prioritization | [product/frameworks/0004-框架-MoSCoW优先级.md](product/frameworks/004-框架-MoSCoW优先级.md) |
| Understand JTBD framework | [product/frameworks/0002-框架-JTBD框架摘要.md](product/frameworks/002-框架-JTBD框架摘要.md) |
| Use Kano model | [product/frameworks/0003-框架-Kano模型摘要.md](product/frameworks/003-框架-Kano模型摘要.md) |
| Map user stories | [product/frameworks/0007-框架-用户故事地图.md](product/frameworks/007-框架-用户故事地图.md) |
| Run a sprint | [product/delivery/0001-交付-运作Sprint.md](product/delivery/001-交付-运作Sprint.md) |
| Define north star metric | [product/discovery/01-指标-北极星指标.md](product/discovery/01-指标-北极星指标.md) |
| Design OKRs | [product/frameworks/0005-框架-OKR设计摘要.md](product/frameworks/005-框架-OKR设计摘要.md) |
| Analyze competitors (product) | [product/strategy/0002-战略-竞品分析方法.md](product/strategy/002-战略-竞品分析方法.md) |
| Design product roadmap | [product/strategy/0003-战略-产品路线图设计.md](product/strategy/003-战略-产品路线图设计.md) |
| Validate product-market fit | [product/strategy/0004-战略-产品市场匹配.md](product/strategy/004-战略-产品市场匹配.md) |
| Run beta testing | [product/delivery/0004-交付-Beta测试指南.md](product/delivery/004-交付-Beta测试指南.md) |
| Coordinate cross-project delivery | [product/delivery/0005-交付-跨项目协作.md](product/delivery/005-交付-跨项目协作.md) |
| Conduct user interviews | [product/discovery/0004-发现-用户访谈综合.md](product/discovery/004-发现-用户访谈综合.md) |
| Build user personas | [product/discovery/0003-发现-用户画像方法.md](product/discovery/003-发现-用户画像方法.md) |
| Run UX checklist | [product/discovery/01-体验-UX检查清单.md](product/discovery/01-体验-UX检查清单.md) |

## SRE — How to Operate

### Incident Response

| I want to... | Go to |
|---|---|
| Respond to an incident | [sre/incident-response/0004-事件-响应事件.md](sre/incident-response/004-事件-响应事件.md) |
| Handle a data breach | [sre/incident-response/0001-事件-处理数据泄露.md](sre/incident-response/001-事件-处理数据泄露.md) |
| Run a war room | [sre/incident-response/0005-事件-作战室运作.md](sre/incident-response/005-事件-作战室运作.md) |
| Write a postmortem (guide) | [sre/incident-response/0007-事件-事后复盘指南.md](sre/incident-response/007-事件-事后复盘指南.md) |
| See postmortem example | [sre/incident-response/0014-事件-事后复盘示例.md](sre/incident-response/014-事件-事后复盘示例.md) |
| Facilitate postmortem meeting | [sre/incident-response/0013-事件-复盘会议主持.md](sre/incident-response/013-事件-复盘会议主持.md) |
| Write a runbook | [sre/incident-response/0009-事件-Runbook模板.md](sre/incident-response/009-事件-Runbook模板.md) |
| Use incident communication template | [sre/incident-response/0010-事件-事件沟通模板.md](sre/incident-response/010-事件-事件沟通模板.md) |
| Plan disaster recovery | [sre/incident-response/0011-事件-灾难恢复计划.md](sre/incident-response/011-事件-灾难恢复计划.md) |
| Run FMEA analysis | [sre/incident-response/0016-事件-FMEA模板.md](sre/incident-response/016-事件-FMEA模板.md) |
| Run a Game Day | [sre/incident-response/0008-事件-GameDay演练.md](sre/incident-response/008-事件-GameDay演练.md) |
| Handle on-call shift | [sre/incident-response/0002-事件-处理值班轮班.md](sre/incident-response/002-事件-处理值班轮班.md) |
| Set up on-call rotation | [sre/incident-response/0006-事件-建立值班轮换.md](sre/incident-response/006-事件-建立值班轮换.md) |
| Do shift handoff | [sre/incident-response/0003-事件-值班交接.md](sre/incident-response/003-事件-值班交接.md) |
| Reduce toil | [sre/incident-response/0012-事件-减少重复劳动.md](sre/incident-response/012-事件-减少重复劳动.md) |

### Observability

| I want to... | Go to |
|---|---|
| Set up observability | [sre/observability/0007-可观测-搭建可观测性.md](sre/observability/007-可观测-搭建可观测性.md) |
| Understand observability triad | [sre/observability/0005-可观测-可观测性三支柱.md](sre/observability/005-可观测-可观测性三支柱.md) |
| Define SLOs/SLIs | [sre/observability/0008-可观测-SLO与SLI定义.md](sre/observability/008-可观测-SLO与SLI定义.md) |
| Manage error budgets | [sre/observability/0012-可观测-错误预算策略.md](sre/observability/012-可观测-错误预算策略.md) |
| Configure alerting rules | [sre/observability/0010-可观测-告警规则配置.md](sre/observability/010-可观测-告警规则配置.md) |
| Design health checks | [sre/observability/0014-可观测-健康检查设计.md](sre/observability/014-可观测-健康检查设计.md) |
| Set up SRE metrics | [sre/observability/0015-可观测-SRE指标体系.md](sre/observability/015-可观测-SRE指标体系.md) |
| Manage SLA | [sre/observability/0016-可观测-SLA管理.md](sre/observability/016-可观测-SLA管理.md) |
| Run performance tests | [sre/observability/0013-可观测-性能测试指南.md](sre/observability/013-可观测-性能测试指南.md) |
| Monitor capacity and cost | [sre/observability/0001-可观测-容量与成本.md](sre/observability/001-可观测-容量与成本.md) |
| Backup and restore database | [sre/observability/0011-可观测-数据库备份恢复.md](sre/observability/011-可观测-数据库备份恢复.md) |
| Operate knowledge base and RAG | [sre/observability/0017-可观测-知识库与RAG运维.md](sre/observability/017-可观测-知识库与RAG运维.md) |
| Manage Ollama models | [sre/observability/0018-可观测-Ollama模型管理.md](sre/observability/018-可观测-Ollama模型管理.md) |
| Track tech debt (ops view) | [sre/observability/0009-可观测-技术债清单.md](sre/observability/009-可观测-技术债清单.md) |
| Set up CI/CD | [sre/observability/0002-可观测-CICD.md](sre/observability/002-可观测-CICD.md) |

### Release Management

| I want to... | Go to |
|---|---|
| Ship a release | [sre/release/0004-发布-发布流程.md](sre/release/004-发布-发布流程.md) |
| Do a canary release | [sre/release/0001-发布-金丝雀发布.md](sre/release/001-发布-金丝雀发布.md) |
| Ship a hotfix | [sre/release/0002-发布-热修复发布.md](sre/release/002-发布-热修复发布.md) |
| Manage release freeze | [sre/release/0003-发布-发布冻结.md](sre/release/003-发布-发布冻结.md) |
| Do a rollback drill | [sre/release/0005-发布-回滚演练.md](sre/release/005-发布-回滚演练.md) |
| Manage change process | [sre/release/0006-发布-变更管理流程.md](sre/release/006-发布-变更管理流程.md) |
| Run production readiness review | [sre/release/0007-发布-生产就绪审查.md](sre/release/007-发布-生产就绪审查.md) |

## AI Engineer — How to Use AI

| I want to... | Go to |
|---|---|
| Understand LLM fundamentals | [aier/foundations/0001-基础-LLM基础.md](aier/foundations/001-基础-LLM基础.md) |
| Understand RAG design patterns | [aier/foundations/0002-基础-RAG设计模式.md](aier/foundations/002-基础-RAG设计模式.md) |
| Learn AI security | [aier/foundations/0003-基础-AI安全与防护.md](aier/foundations/003-基础-AI安全与防护.md) |
| Design agent architecture | [aier/methods/0001-方法-Agent架构模式.md](aier/methods/001-方法-Agent架构模式.md) |
| Evaluate agent quality | [aier/methods/0002-方法-Agent评估.md](aier/methods/002-方法-Agent评估.md) |
| Evaluate LLM quality | [aier/methods/0004-方法-LLM评估.md](aier/methods/004-方法-LLM评估.md) |
| Master prompt engineering | [aier/methods/0005-方法-提示词工程.md](aier/methods/005-方法-提示词工程.md) |
| Understand agent harness plugin | [aier/methods/0003-方法-Agent-Harness插件架构.md](aier/methods/003-方法-Agent-Harness插件架构.md) |
| Use agent tool calling prompt | [aier/prompts/0001-提示词-Agent工具使用.md](aier/prompts/001-提示词-Agent工具使用.md) |
| Apply chain-of-thought | [aier/prompts/0002-提示词-思维链.md](aier/prompts/002-提示词-思维链.md) |
| Review code with AI | [aier/prompts/0003-提示词-代码审查.md](aier/prompts/003-提示词-代码审查.md) |
| Translate with AI | [aier/prompts/0004-提示词-多语言翻译.md](aier/prompts/004-提示词-多语言翻译.md) |
| Use RAG system prompt | [aier/prompts/0005-提示词-RAG系统.md](aier/prompts/005-提示词-RAG系统.md) |
| Generate SQL with AI | [aier/prompts/0006-提示词-SQL生成.md](aier/prompts/006-提示词-SQL生成.md) |
| Generate weekly reports | [aier/prompts/0007-提示词-周报生成.md](aier/prompts/007-提示词-周报生成.md) |
| Compare LLM models | [aier/platform/0002-平台-LLM对比.md](aier/platform/002-平台-LLM对比.md) |
| Choose embedding model | [aier/platform/0001-平台-Embedding模型选型.md](aier/platform/001-平台-Embedding模型选型.md) |
| Choose vector database | [aier/platform/0003-平台-向量数据库选型.md](aier/platform/003-平台-向量数据库选型.md) |
| Apply traditional ML | [aier/machine-learning/0001-机器学习-传统机器学习模式.md](aier/machine-learning/001-机器学习-传统机器学习模式.md) |

## Executive — Business Strategy

| I want to... | Go to |
|---|---|
| Analyze competitors | [executive/industry/0003-行业-竞品分析模板.md](executive/industry/003-行业-竞品分析模板.md) |
| Analyze AI dev tools landscape | [executive/industry/0006-行业-AI开发工具竞品格局-2026H1.md](executive/industry/006-行业-AI开发工具竞品格局-2026H1.md) |
| Deep-dive Cursor competitor | [executive/industry/0008-行业-竞品分析-Cursor.md](executive/industry/008-行业-竞品分析-Cursor.md) |
| Deep-dive Copilot competitor | [executive/industry/0009-行业-竞品分析-Copilot.md](executive/industry/009-行业-竞品分析-Copilot.md) |
| Read AI industry trends 2026 | [executive/industry/0004-行业-2026-AI行业关键趋势.md](executive/industry/004-行业-2026-AI行业关键趋势.md) |
| Analyze AI market H1 2026 | [executive/industry/0005-行业-2026H1-AI市场趋势分析.md](executive/industry/005-行业-2026H1-AI市场趋势分析.md) |
| Run Porter's Five Forces | [executive/strategy/0007-战略-波特五力模型.md](executive/strategy/007-战略-波特五力模型.md) |
| Run SWOT analysis | [executive/strategy/0010-战略-SWOT分析.md](executive/strategy/010-战略-SWOT分析.md) |
| Apply Blue Ocean Strategy | [executive/strategy/0001-战略-蓝海战略.md](executive/strategy/001-战略-蓝海战略.md) |
| Design business model | [executive/strategy/0002-战略-商业模式画布.md](executive/strategy/002-战略-商业模式画布.md) |
| Make executive decisions | [executive/strategy/0018-战略-高管决策框架.md](executive/strategy/018-战略-高管决策框架.md) |
| Plan annual strategy | [executive/roadmap/0001-路线图-年度战略规划.md](executive/roadmap/001-路线图-年度战略规划.md) |
| Plan quarterly review | [executive/roadmap/0004-路线图-季度业务回顾.md](executive/roadmap/004-路线图-季度业务回顾.md) |
| Track organizational OKRs | [executive/roadmap/0003-路线图-组织OKR追踪.md](executive/roadmap/003-路线图-组织OKR追踪.md) |
| Plan headcount and budget | [executive/roadmap/0002-路线图-人员预算规划.md](executive/roadmap/002-路线图-人员预算规划.md) |
| Read executive book notes | [executive/reading-list/](executive/reading-list/) |
| Use executive checklist | [executive/CHECKLIST.md](executive/CHECKLIST.md) |

## Curator — Knowledge Governance

| I want to... | Go to |
|---|---|
| Create a new knowledge file | [curator/governance/0004-治理-就绪检查清单.md](curator/governance/004-治理-就绪检查清单.md) |
| Use a document template | [curator/templates/000-INDEX.md](curator/templates/000-INDEX.md) |
| Check knowledge base health | [curator/governance/0001-治理-知识健康看板.md](curator/governance/001-治理-知识健康看板.md) |
| Understand governance model | [curator/governance/0002-治理-治理规范.md](curator/governance/002-治理-治理规范.md) |
| Process inbox items | [curator/governance/0003-治理-收件箱.md](curator/governance/003-治理-收件箱.md) |
| Review triage queue | [curator/governance/0007-治理-分类处理.md](curator/governance/007-治理-分类处理.md) |
| See daily ops quick reference | [curator/governance/0008-治理-操作速查卡.md](curator/governance/008-治理-操作速查卡.md) |
| See the directory blueprint | [curator/diagrams/0002-图表-目录蓝图.md](curator/diagrams/002-图表-目录蓝图.md) |
| See the knowledge map | [curator/diagrams/0003-图表-知识地图.md](curator/diagrams/003-图表-知识地图.md) |
| See the user journey | [curator/diagrams/0004-图表-用户旅程.md](curator/diagrams/004-图表-用户旅程.md) |
| Capture tacit knowledge | [curator/governance/0006-治理-隐性知识待办.md](curator/governance/006-治理-隐性知识待办.md) |
| View review audit log | [curator/governance/0005-治理-审查日志.md](curator/governance/005-治理-审查日志.md) |
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