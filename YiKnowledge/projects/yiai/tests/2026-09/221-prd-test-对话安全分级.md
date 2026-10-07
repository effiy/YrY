---

doc_type: test
title: "YA-09-222: 对话安全分级 — 实时内容审核、安全拦截、审计日志与用户安全画像 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-222"
source_prds: ["221-需求-对话安全分级"]
source_modules: ["221-prd-task-对话安全分级"]
source_okr: [yiai-001]

type: test
---

# YA-09-222: 对话安全分级 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 4 级安全分级（safe/sensitive/risky/harmful）、流式生成实时拦截、安全审计日志、用户安全画像、管理员 override。

> 来源 PRD：[221-需求-对话安全分级.md](../../prds/2026-09/221-需求-对话安全分级.md)
> 需求编号：YA-09-222 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | SafetyClassifier 4 级判定、ContentFilter 关键词匹配、UserRiskProfile 评分 | 40% |
| 集成测试 | pytest + httpx | SSE 流式拦截插入、安全审计日志写入、管理员 override API | 40% |
| 数据验证 | pytest + motor | 安全审计日志持久化、用户画像更新 | 20% |

**测试目标**：安全分级准确率 > 90%（safe/sensitive 识别）、harmful 拦截率 > 95%、流式拦截延迟 < 50ms、误拦截率 < 5%。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/safety/` 下 100 条模拟对话（safe 40/sensitive 30/risky 20/harmful 10），含人工标注的安全等级。

**前置条件**：YiAi 内容审核基础（YA-09-142 关键词过滤）已部署，MongoDB `safety_audit_logs` 集合已创建。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | safe 正常对话 | "Python 的 GIL 是什么" | 安全分级 | level=safe，正常生成回复 | P0 |
| 2 | sensitive 敏感话题 | 政治讨论内容 | 安全分级 | level=sensitive，正常生成 + 标记警告 | P0 |
| 3 | risky 风险内容 | 漏洞利用思路 | 安全分级 | level=risky，生成 + 警告标记 + 审计 | P0 |
| 4 | harmful 拦截 | 恶意代码生成请求 | 安全分级 | level=harmful，拦截生成，返回安全提示 | P0 |
| 5 | SSE 流式实时拦截 | 流式生成中途检出 harmful | 拦截插入 | SSE 流中插入 `{"type":"safety_warning", ...}`，停止后续 token | P1 |
| 6 | 安全审计日志 | harmful 对话 | 检查 MongoDB | 日志含 user/timestamp/level/triggered_rules/content_hash | P0 |
| 7 | 用户安全画像-风险累积 | 同一用户 3 次 risky 对话 | 更新画像 | risk_score 递增，触发升级管控（如限流或禁用） | P1 |
| 8 | 管理员 override | 正常对话被误判为 risky | POST /admin/safety/override | level 覆盖为 safe，审计日志记录 override 操作 | P1 |
| 9 | 误拦截申诉 | 用户申诉被误拦截的对话 | POST /safety/appeal | 申诉进入复审队列，管理员可处理 | P2 |
| 10 | 安全分级一致性 | 相同输入 10 次 | 重复判定 | 10 次结果一致（确定性判定，非 LLM 随机） | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | 空消息安全分级 | message="" | level=safe，不抛异常 |
| E2 | 混合语言内容 | 中英日混合消息 | 正确分级，不因语言而误判 |
| E3 | 安全关键词在代码上下文中 | "eval(恶意代码)" 出现在技术问答中 | 区分"讨论安全"和"执行攻击"，避免误拦截 |
| E4 | 安全服务不可用降级 | 关键词过滤服务 down | 默认 safe，记录降级日志 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 新关键词规则不破坏已有安全判定 | 添加新规则后回归测试 100 条基线对话，验证准确率不变 |
| R2 | 用户画像定期衰减 | 30 天无 risky 行为的用户 risk_score 自动衰减 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖模块 |
|----------|----------|
| TC-1, TC-2, TC-3, TC-4 | safety_classifier.py |
| TC-5 | sse_interceptor.py |
| TC-6 | safety_audit.py |
| TC-7 | user_risk_profile.py |
| TC-8 | admin_override.py |
| TC-9 | appeal_service.py |
| TC-10 | 确定性验证 |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 多语言/方言安全分级 | 需特定语料库 | P3 |
| 图像/文件附件安全检测 | 属多模态安全范围 | P3 |
| 安全分级模型对抗攻击测试 | 需安全专家参与 | P3 |