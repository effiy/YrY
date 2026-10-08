---
prd_task_id: "YV-09-88"
title: "YV-09-88: RAG 按钮功能重写 — 测试用例"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiVad
prd_month: "202609"
source_prd: "88-prd-RAG按钮功能重写.md"
source_dev: "88-prd-task-RAG按钮功能重写.md"
tags: [RAG, UI重写, 测试用例, 状态指示]
category: 项目/管理后台/测试
source: internal
type: test
benefit: "测试用例：RAG按钮功能重写"
lifecycle: active
---

# YV-09-88: RAG 按钮功能重写 — 测试用例

> 需求编号：YV-09-88 · 状态：已完成

> **文档职责**：本文档定义**如何验证** RAG 按钮重写是否生效。

---

<a id="sec-1"></a>
## 一、功能测试

### 1.1 RAG 开启/关闭

| 项目 | 内容 |
|------|------|
| **用例 ID** | RAG-FEAT-001 |
| **测试目标** | RAG toggle 正确开关 |
| **步骤** | 1. 打开 `/#/ai-chat`，观察 RAG pill 为灰色关闭态 |
| | 2. 点击 pill 或开关，RAG 变为蓝色开启态 |
| | 3. 再次点击，RAG 恢复灰色关闭态 |
| **预期结果** | 状态切换正确，样式随之变化 |
| **状态** | 通过 |

### 1.2 健康圆点颜色

| 项目 | 内容 |
|------|------|
| **用例 ID** | RAG-FEAT-002 |
| **测试目标** | 健康圆点正确反映索引状态 |
| **步骤** | 1. RAG 索引已构建 → 绿色圆点 |
| | 2. RAG 索引构建中/异常 → 橙色圆点 |
| | 3. RAG 索引未构建 → 红色圆点 |
| | 4. 状态未知（fetch 失败）→ 红色圆点 |
| **预期结果** | 四种状态颜色正确，hover 有 tooltip |
| **状态** | 通过 |

### 1.3 检索中状态

| 项目 | 内容 |
|------|------|
| **用例 ID** | RAG-FEAT-003 |
| **测试目标** | 检索中 pill 显示脉冲动画 |
| **步骤** | 1. 开启 RAG |
| | 2. 发送消息触发 RAG 检索 |
| | 3. 观察 pill 是否变为橙色 + "Retrieving" + 旋转 loading 图标 |
| **预期结果** | `streamingPhase === "retrieving"` 时 pill 有橙色脉冲动画 |
| **状态** | 通过（代码逻辑验证） |

### 1.4 Fast Mode

| 项目 | 内容 |
|------|------|
| **用例 ID** | RAG-FEAT-004 |
| **测试目标** | Fast Mode 开关和视觉反馈 |
| **步骤** | 1. 开启 RAG，打开齿轮弹窗 |
| | 2. 开启 Fast Mode switch |
| | 3. pill 显示虚线边框 + "FAST" 橙色徽章 |
| | 4. 关闭 Fast Mode，pill 恢复正常 |
| **预期结果** | Fast Mode 状态正确切换，视觉反馈一致 |
| **状态** | 通过 |

### 1.5 Scope 角色选项

| 项目 | 内容 |
|------|------|
| **用例 ID** | RAG-FEAT-005 |
| **测试目标** | Scope 下拉选项为 YiKnowledge 实际角色 |
| **步骤** | 1. 开启 RAG，打开齿轮弹窗 |
| | 2. 展开 Scope 下拉 |
| | 3. 验证选项列表 |
| **预期结果** | 选项为：All, curator, engineer, product, leader, executive, sre, aier |
| **状态** | 通过 |

### 1.6 设置弹窗分组

| 项目 | 内容 |
|------|------|
| **用例 ID** | RAG-FEAT-006 |
| **测试目标** | 设置弹窗分 Quick Settings 和 Advanced 两组 |
| **步骤** | 1. 开启 RAG，点击齿轮图标 |
| | 2. 观察弹窗布局 |
| **预期结果** | 两组各自有标题，Quick Settings 在上 (scope/mode/fast)，Advanced 在下 (hybrid/rerank/hyde/citations/query variants) |
| **状态** | 通过 |

---

<a id="sec-2"></a>
## 二、回归测试

| 用例 ID | 测试目标 | 验证方法 | 状态 |
|---------|---------|---------|------|
| RG-001 | 非 RAG 聊天功能正常 | 关闭 RAG，发送消息 | 通过 |
| RG-002 | Web Search pill 功能正常 | 开启 Web Search，验证检索 | 通过 |
| RG-003 | RAG+Web 联合 pill 样式 | 同时开启 RAG+Web | 通过 |
| RG-004 | Context 文件功能正常 | 添加/删除 context 文件 | 通过 |
| RG-005 | `vue-tsc --noEmit` 无新错误 | 类型检查 | 通过（0 错误） |
| RG-006 | `git grep RagPill` 无残留引用 (YiVad) | 代码搜索 | 通过 |

---

## 三、测试总结

| 维度 | 总数 | 通过 | 失败 |
|------|------|------|------|
| 功能测试 | 6 | 6 | 0 |
| 回归测试 | 6 | 6 | 0 |

**结论**：所有功能测试和回归测试通过。RAG 按钮的三态视觉设计、索引健康指示、Fast Mode、修正的角色选项均正确实现。类型检查 0 错误。