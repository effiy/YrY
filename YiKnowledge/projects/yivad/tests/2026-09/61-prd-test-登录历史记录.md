---
doc_type: test
title: "YV-09-131: 登录历史记录 — 用户登录日志、IP/位置/设备/浏览器记录、异地登录检测、登录趋势分析、导出 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-131"
source_prds: ["61-prd-登录历史记录"]
source_modules: []
---
# YV-09-131: 登录历史记录 — 用户登录日志、IP/位置/设备/浏览器记录、异地登录检测、登录趋势分析、导出 — 测试规格

> 来源 PRD：[61-prd-登录历史记录.md](../../prds/2026-09/61-prd-登录历史记录.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---


---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |

### 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 当前登录流程 | CT | ✅ 已完成 |
| FR-2 | 登录记录需求对比 | CT | ✅ 已完成 |
| FR-3 | 根因矩阵 | CT | ✅ 已完成 |
| FR-4 | 登录记录流程（目标） | CT | ✅ 已完成 |
| FR-5 | 数据模型 | CT | ✅ 已完成 |
| FR-6 | YiAi 后端 — LoginHistoryService | CT | ✅ 已完成 |
| FR-7 | 异常检测器 | CT | ✅ 已完成 |
| FR-8 | YiVad 前端 — 登录历史页面 | CT | ✅ 已完成 |
| FR-9 | 管理端登录统计仪表盘 | CT | ✅ 已完成 |
| FR-10 | 文件变更清单 | CT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### 场景 1：记录成功登录

**GIVEN** 用户输入正确的用户名和密码
**WHEN** 登录请求成功
**THEN** `login_history` 集合中插入一条记录
**AND** 记录包含 user_id、ip_address、location、device、login_at
**AND** login_result 为 "success"

### 场景 2：检测新 IP 登录

**GIVEN** 用户过去 30 天从 IP 1.1.1.1 登录，当前从 IP 2.2.2.2 登录
**WHEN** 用户登录成功
**THEN** login_history 记录中 is_anomaly 为 true
**AND** anomaly_reasons 包含 "new_ip"
**AND** 前端显示"检测到新 IP 地址登录"告警

### 场景 3：检测新设备登录

**GIVEN** 用户过去 30 天仅在 Chrome/macOS 登录，当前使用 Safari/iOS 登录
**WHEN** 用户登录成功
**THEN** login_history 记录中 is_anomaly 为 true
**AND** anomaly_reasons 包含 "new_device"

### 场景 4：检测异地短时登录

**GIVEN** 用户 1 小时前在杭州登录，当前从北京登录
**WHEN** 用户登录成功
**THEN** anomaly_reasons 包含 "rapid_location_change"
**AND** 前端显示"检测到短时间内异地登录"告警

### 场景 5：查看登录趋势

**GIVEN** 管理员访问登录统计仪表盘
**WHEN** 页面加载完成
**THEN** 显示近 30 天登录量趋势折线图
**AND** 显示今日登录数、活跃用户数、失败率统计卡片
**AND** 显示地理位置分布图

### 场景 6：导出登录历史

**GIVEN** 用户在登录历史页面，筛选了本月的记录
**WHEN** 用户点击"导出记录"按钮
**THEN** 下载一个 CSV 文件，包含登录时间、IP、位置、设备、是否异常
**AND** CSV 文件编码为 UTF-8 with BOM（兼容 Excel）

---

