---
doc_type: test
title: "全局快捷键框架 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-43"
source_prds: ["18-prd-全局快捷键框架"]
source_modules: []
---
# 全局快捷键框架 — 测试规格

> 来源 PRD：[18-prd-全局快捷键框架.md](../../prds/2026-09/18-prd-全局快捷键框架.md)

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
| FR-1 | 快捷键注册表 | UT + CT | ✅ 已完成 |
| FR-2 | useKeyboardShortcuts Composabl | UT + CT | ✅ 已完成 |
| FR-3 | 标准化快捷键配置 | UT + CT | ✅ 已完成 |
| FR-4 | 快捷键覆盖层组件 | UT + CT | ✅ 已完成 |
| FR-5 | 快捷键设置页面 | UT + CT | ✅ 已完成 |
| FR-6 | 快捷键使用分析 | UT + CT | ✅ 已完成 |




<a id="sec-6"></a>
## 六、测试规格

### Scenario 1: 全局快捷键触发
- **GIVEN** 用户在项目列表页面，未打开任何模态框
- **WHEN** 用户按下 Ctrl+K
- **THEN** 命令面板打开，搜索框自动聚焦

### Scenario 2: 模态框内快捷键禁用
- **GIVEN** 删除确认对话框已打开
- **WHEN** 用户按下 Ctrl+S（保存快捷键）
- **THEN** 保存快捷键不触发，仅对话框内的 Escape 键可关闭对话框

### Scenario 3: 序列快捷键
- **GIVEN** 用户在任意页面
- **WHEN** 用户依次按下 G 键，然后 1 秒内按下 I 键
- **THEN** 页面导航到 Issues 页面；序列超时（超过 1 秒）则序列重置

### Scenario 4: 快捷键覆盖层
- **GIVEN** 用户在任意页面
- **WHEN** 用户按下 ? 键
- **THEN** 半透明遮罩显示，分组列出所有已注册的快捷键；搜索框可过滤快捷键；再次按 ? 或 Esc 关闭

### Scenario 5: 快捷键自定义
- **GIVEN** 用户在快捷键设置页面
- **WHEN** 用户点击"保存"快捷键，按下 Ctrl+Shift+S
- **THEN** "保存"快捷键更新为 Ctrl+Shift+S；如果 Ctrl+Shift+S 已被其他快捷键占用，显示冲突警告

### Scenario 6: 输入框内快捷键不干扰
- **GIVEN** 用户在文本输入框中编辑文本
- **WHEN** 用户按下 Ctrl+S
- **THEN** 若当前输入框注册了 `input` 作用域的 Ctrl+S，则触发输入框的保存逻辑；否则触发全局保存逻辑（取决于作用域优先级）

---


## 补充：单元测试用例

### UT-HK01: useKeyboardShortcuts

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 注册快捷键 | `register('ctrl+s', saveHandler)` | 按键触发 handler |
| 2 | 冲突检测 | 注册已存在的快捷键 | 控制台警告或后者覆盖 |
| 3 | 作用域隔离 | 弹窗内注册的快捷键 | 弹窗外不触发 |
| 4 | 注销 | 组件卸载 | 快捷键不再触发 |
| 5 | 输入框豁免 | 焦点在 input/textarea | 快捷键不触发 |
| 6 | 动态注册 | 条件变化时注册/注销 | 响应式更新快捷键绑定 |

