---
doc_type: index
title: 2026-09 产品需求索引
category: 项目/管理后台/产品需求
created: 2026-09-02
updated: 2026-09-14
project: YiVad
---

# 2026-09 产品需求索引

> 产品需求文档（PRD）——描述 WHAT 和 WHY（系统必须提供什么能力、边界在哪里、如何验收）。实现方案见 [devs/](../devs/2026-09/)，测试用例见 [tests/](../tests/2026-09/)。

<a id="sec-1"></a>
## 一、可追溯矩阵

```
OKR 目标 ──source_okr──→ PRD 需求 ──prd_task_id──→ Dev 模块 ──source_modules──→ Test 用例
```

| PRD ID | 标题 | 状态 | 优先级 | 关联 OKR | 关联 Dev | 关联 Test |
|--------|------|------|--------|----------|----------|----------|
| YV-09-01 | [九月迭代总览](./00-prd-需求总览.md) | 已完成 | P0 | yivad-001, yivad-002, yivad-003 | YV-09-01-1~21 | YV-09-22 |

<a id="sec-2"></a>
## 二、PRD 文档结构

每个 PRD 文件遵循标准 11 节结构：

```
1. 背景 — 业务背景、核心挑战
2. 现状与目标 — 改造前/后对比、能力全景、边界
3. 需求范围 — 范围内/外
4. 功能需求 — FR-01 到 FR-0N
5. 领域模型 — 数据模型、状态机、枚举
6. 非功能需求 — 安全、性能、可用性、可观测性
7. 设计决策 — 选项对比、选择理由
8. 验收标准 — 逐条可验证的 AC
9. 风险与缓解 — 风险矩阵、回滚策略
10. 后续演进 — 技术债登记
11. 关联需求 — 依赖/上游/开发方案/测试用例
```

<a id="sec-3"></a>
## 三、Frontmatter 规范

```yaml
---
title: "{序号}: {需求标题} — {一句话描述}"
tags: [需求文档, {标签}]
category: 项目/管理后台/需求
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
source: 内部
type: 需求
status: {待开始|进行中|已完成|已取消}
priority: {P0|P1|P2|P3}
project: YiVad
project_id: yivad
owner: {负责人}
prd_month: "{YYYYMM}"
prd_task_id: "YV-{月}-{序号}"
estimate_frontend: {N.N}
review_status: {待评审|已评审|需修改}
issue_type: {功能实现|架构设计|基础设施|缺陷修复|体验优化|稳定性|合规}
roles: [engineer]
source_okr: [{OKR ID}]
related_modules: [{Dev 模块 ID}]
related_tests: [{Test ID}]
---
```

<a id="sec-4"></a>
## 四、目录规范

```
prds/{month}/
├── README.md                  # 本文件：可追溯矩阵 + 规范说明
├── 00-prd-{迭代总览}.md       # 迭代总览 PRD
└── NN-prd-{描述}.md           # 子需求 PRD
```

<a id="sec-5"></a>
## 五、追溯规则

| 字段 | 指向 | 说明 |
|------|------|------|
| `source_okr` | OKR 目录 | 每个 PRD 必须关联至少一个 OKR 目标 |
| `related_modules` | Dev 目录 | PRD 拆分为哪些开发模块 |
| `related_tests` | Test 目录 | PRD 对应的测试文档 |
| `prd_task_id` | 唯一标识 | Dev/Test 通过此 ID 反向追溯 |

**完整链路：** `OKR goal → PRD (source_okr) → Dev Module (prd_task_id) → Test (source_modules)`

<a id="sec-6"></a>
## 六、PRD 编写指南

### 何时需要 PRD

| 变更类型 | 需要 PRD | 说明 |
|---------|---------|------|
| 新功能 | 是 | 完整 11 节 |
| 架构重构 | 是 | 侧重设计决策和风险 |
| Bug 修复 | 否 | 直接登记到 bugs/ |
| 样式调整 | 否 | 直接开发 |
| 依赖升级 | 否 | 记录在 commit message |

### PRD 评审标准

- [ ] 业务背景清晰，核心挑战已识别
- [ ] 功能需求可测试（每个 FR 对应至少一个 AC）
- [ ] 设计决策有选项对比和选择理由
- [ ] 风险矩阵完整，有缓解和应急预案
- [ ] 范围外明确列出（防止范围蔓延）
- [ ] 关联关系可追溯（OKR/Dev/Test）