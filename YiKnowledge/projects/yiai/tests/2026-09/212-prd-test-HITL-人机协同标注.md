---

doc_type: test
title: "YA-09-212: HITL-人机协同标注 — 标注流水线、任务创建分配、标注界面、标注者间一致性、质量控制、主动学习采样 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-212"
source_prds: ["212-需求-HITL-人机协同标注"]
source_modules: ["212-prd-task-HITL-人机协同标注"]
source_okr: [yiai-001]

type: test
---

# YA-09-212: HITL-人机协同标注 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖标注任务管理、样本分配、质量控制（Gold Set + Cohen's Kappa）、主动学习采样、数据导出。

> 来源 PRD：[212-需求-HITL-人机协同标注.md](../../prds/2026-09/212-需求-HITL-人机协同标注.md)
> 需求编号：YA-09-212 · 优先级：P2 · 人天：0.3d

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | AnnotationTask/AnnotationSample 数据模型、QualityService 一致性计算、ActiveSampler 采样 | 45% |
| 集成测试 | pytest + httpx | RPC 任务 CRUD、样本分配、标注提交、Gold Set 实时校验 | 35% |
| 数据验证 | pytest + motor | MongoDB 集合 CRUD、批量插入、复合索引验证 | 20% |

**测试目标**：四类标注类型覆盖（classification/ranking/rating/text_label）、Cohen's Kappa 计算正确、Gold Set 准确率实时校验、主动学习 Margin Sampling 排序正确。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试数据**：`tests/fixtures/annotation/` 下 200 条模拟样本（含 10 条 Gold Set 标准答案），2 个标注者账户（annotator_a/annotator_b），1 个管理员账户。

**前置条件**：MongoDB 包含 `annotation_tasks`、`annotation_samples`、`annotation_gold_set` 集合，已建 `task_id + status + assigned_to` 复合索引。

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | 创建分类标注任务 | type=classification, 200 samples, 2 annotators, 10% overlap, 5% gold | POST 任务创建 | 任务状态=ACTIVE, 20 个样本分配 2 个标注者, 10 个 Gold Set 混入 | P0 |
| 2 | 标注者提交标注 | sample_id=5, label="relevant", annotator_id="alice" | PUT 标注提交 | annotations.alice 记录更新, status=COMPLETED, task.annotated_count +1 | P0 |
| 3 | Gold Set 实时质控 | gold_sample label="relevant", 标注者 Bob 标为 "not_relevant" | Bob 提交标注 | Gold Set 校验失败, Bob 的 gold_set_accuracy 下降 | P0 |
| 4 | Gold Set 准确率低于 80% 暂停 | Bob 连续 3 个 Gold Set 错误 | 检测 Bob 的滑动窗口准确率 | Bob 标注分配暂停, 管理员收到通知 | P1 |
| 5 | Cohen's Kappa 计算 | Alice 和 Bob 标注 20 个重叠样本, 16/20 一致 | 调用 calculate_cohens_kappa() | Kappa > 0.6, interpretation = "substantial" | P0 |
| 6 | Kappa 争议标记 | 4 个样本标注不一致 | 一致性计算后 | 4 个样本标记为 DISPUTED, 进入管理员复审队列 | P1 |
| 7 | Margin Sampling 不确定性排序 | 1000 样本概率 [[0.9,0.1], [0.51,0.49], ...] | 调用 margin_sampling(n=50) | Top-1 uncertainty 样本为 P 最接近的, 返回 50 个已排序 | P0 |
| 8 | 随机采样基线 | 1000 样本无概率 | 调用 random_sampling(n=100) | 返回 100 个随机样本, 不重复, 不包含已标注样本 | P1 |
| 9 | 标注数据导出 JSON | task 含 200 个 REVIEWED 样本 | 调用 ExportService.export(format="json") | JSON 含 sample_id/content/label/annotator_count/agreement_score | P0 |
| 10 | 跳过不适用的样本 | 标注者选择 skip, reason="乱码" | 提交 skip | status=SKIPPED, 不计入标注完成数, 不污染标注数据 | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | Cohen's Kappa 空数据 | annotations_a=[], annotations_b=[] | 返回 (0.0, "insufficient_data")，不抛异常 |
| E2 | 重复分配防重 | 同一样本分配给同一标注者两次 | find_one_and_update 原子操作 PENDING → IN_PROGRESS，重复分配被拒绝 |
| E3 | 标注者无法查看他人标注 | annotator_a 查询 annotated_by=annotator_b 的结果 | 返回空或权限拒绝 |
| E4 | Gold Set 过少时误判 | 仅 3 个 Gold Set，1 个错误 = 67% 准确率 | 滑动窗口 >= 5 个时才触发暂停，防止小样本误判 |
| E5 | Fleiss' Kappa 多标注者 | 5 个标注者, 3 个类别, 100 个样本 | Kappa 值在 [-1, 1]，计算结果与手工计算一致 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | Kappa 计算分布不平衡 | Alice 标 80% "relevant", Bob 标 20% "relevant"，验证 Kappa 不为 0 且同时计算 PABAK 辅助指标 |
| R2 | 标记 skip 的样本不污染标注分布 | 10% 样本被 skip，验证 AnnotatorStats.annotation_distribution 不含 skip 样本 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 场景 | 覆盖模块 |
|----------|-------------|----------|
| TC-1 | 场景 1: 创建标注任务并分配样本 | task_service.py, assignment_service.py |
| TC-2 | 场景 2: 标注者提交标注 | annotation_repository.py |
| TC-3, TC-4 | 场景 3: Gold Set 实时质控 | quality_service.py |
| TC-5, TC-6 | 场景 4: Cohen's Kappa 一致性 | quality_service.py |
| TC-7, TC-8 | 场景 5: 主动学习 Margin Sampling | active_sampler.py |
| TC-9 | 场景 6: 标注数据导出 | export_service.py |
| TC-10 | 回归预测 #4: skip 机制 | annotation_repository.py |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| YiVad 标注界面 E2E | 跨项目联调，需前端环境配合 | P2 |
| 主动学习冷启动（无概率模型） | 需 500+ 标注数据后训练分类器 | P2 |
| 标注指南 Markdown 渲染 | 前端行为，属 YiVad 测试范围 | P3 |