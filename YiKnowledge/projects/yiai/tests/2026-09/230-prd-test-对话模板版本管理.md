---

doc_type: test
title: "YA-09-235: 对话模板版本管理 — 模板版本化、语义版本控制、向后兼容检查、模板迁移、版本差异对比 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-235"
source_prds: ["230-需求-对话模板版本管理"]
source_modules: ["230-prd-task-对话模板版本管理"]
source_okr: [yiai-001]

type: test
---

# YA-09-235: 对话模板版本管理 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖模板语义版本控制（major.minor.patch）、向后兼容检查、模板迁移、版本差异对比、版本回退。

> 来源 PRD：[230-需求-对话模板版本管理.md](../../prds/2026-09/230-需求-对话模板版本管理.md)
> 需求编号：YA-09-235 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | SemVer 解析与比较、TemplateDiffer 差异计算、CompatibilityChecker 兼容判断 | 45% |
| 集成测试 | pytest + httpx | 模板 CRUD API（含版本）、版本回退、模板迁移执行 | 35% |
| 数据验证 | pytest + motor | 模板版本历史存储 | 20% |

**测试目标**：SemVer major/minor/patch 递增正确、向后兼容检查准确率 > 90%、版本差异可视化数据正确。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/templates/` 下 10 个对话模板（含 v1.0.0 至 v2.1.3 多个版本），含已知兼容/不兼容变更。

**前置条件**：MongoDB `prompt_templates` 含 version 字段，模板存储支持多版本并存。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | SemVer 版本比较 | v1.2.3 vs v1.2.4 | semver_compare | 返回 patch 升级（向后兼容） | P0 |
| 2 | Major 版本破坏性变更检测 | 模板参数减少/重命名 | compatibility_check | 标记为不兼容（major bump），建议迁移 | P0 |
| 3 | Minor 版本新增参数 | 新增可选参数 | compatibility_check | 标记为兼容（minor bump），旧调用仍有效 | P1 |
| 4 | 模板版本差异对比 | v1.0.0 vs v2.0.0 | template_diff | 返回 diff: added/removed/modified 参数列表 | P0 |
| 5 | 模板回退 | 从 v2.0.0 回到 v1.5.0 | POST /templates/rollback | 活跃版本切换到 v1.5.0，不影响历史记录 | P1 |
| 6 | 模板迁移执行 | 从 v1 模板参数迁移到 v2 | run_migration | 旧参数映射到新参数，无数据丢失 | P1 |
| 7 | 版本列表查询 | 模板有 5 个历史版本 | GET /templates/{id}/versions | 返回 5 个版本（含版本号/发布时间/变更说明） | P1 |
| 8 | 创建模板默认 v1.0.0 | 新模板创建 | POST /templates | version=v1.0.0 | P0 |
| 9 | 锁定版本引用 | 某会话使用 template v1.2.0 | 模板升级到 v2.0.0 | 会话仍引用 v1.2.0（锁定不自动升级） | P0 |
| 10 | 多模板间依赖版本检查 | Template B 依赖 Template A >= 1.3.0 | 更新 A 到 0.9.0 | 阻止更新或警告不兼容 | P2 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 非法 SemVer | version="abc" | 解析失败，返回错误提示 |
| E2 | 回退到不存在的版本 | rollback to v99.0.0 | 返回错误"版本不存在" |
| E3 | 超长版本历史 | 100 个版本 | 默认返回最近 20 个，支持分页 |
| E4 | concurrent 版本更新 | 2 个管理员同时更新同一模板 | 乐观锁冲突检测，后者提示"模板已被修改" |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 版本升级后已有会话不受影响 | 升级模板版本后查询使用旧版本的会话，验证响应格式不变 |
| R2 | 模板删除不影响版本历史 | 删除模板后，版本历史仍可查询（软删除） |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1 | semver.py |
| TC-2, TC-3 | compatibility_checker.py |
| TC-4 | template_differ.py |
| TC-5 | template_rollback.py |
| TC-6 | migration_runner.py |
| TC-7 | version_history.py |
| TC-8 | template_service.py |
| TC-9 | version_pinning.py |
| TC-10 | dependency_checker.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 大规模模板迁移自动测试 | 需真实复杂模板数据 | P2 |
| 前后端版本兼容联调（YiVad） | 跨项目联调 | P3 |