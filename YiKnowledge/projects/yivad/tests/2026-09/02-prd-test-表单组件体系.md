---
doc_type: test
title: "表单组件体系 — 测试用例"
status: 进行中
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-M09"
source_prds: ["02-prd-表单组件体系"]
source_modules: ["YV-09-M09"]
---

# 表单组件体系 — 测试用例

> 来源 PRD：[02-prd-表单组件体系.md](../../prds/2026-09/02-prd-表单组件体系.md)
> 开发方案：[02-prd-task-表单组件体系.md](../../devs/2026-09/02-prd-task-表单组件体系.md)
> 需求编号：YV-09-M09 · 优先级：中

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、测试环境与前置条件](#sec-3)
- [四、准入与准出标准](#sec-4)
- [五、需求覆盖矩阵](#sec-5)
- [六、单元测试](#sec-6)
- [七、组件测试](#sec-7)
- [八、集成测试](#sec-8)
- [九、端到端场景](#sec-9)
- [十、性能验收测试](#sec-10)
- [十一、无障碍测试](#sec-11)
- [十二、缺陷分级与处理流程](#sec-12)
- [十三、自动化现状与缺口](#sec-13)
- [测试策略](#sec-strategy)
- [测试环境与前置条件](#sec-env)
- [准入与准出标准](#sec-criteria)
- [缺陷分级](#sec-defects)

---

<a id="sec-1"></a>
## 一、测试范围与目标

### 1.1 在范围内

| 范围 | 内容 |
|------|------|
| 13 个 composable | useFormValidation、useAutoSave、useFormWizard、useFieldDependency、useConditionalLogic、useFormEncryption、useRichText、useFormPersistence、useFormSubmission、useFormCollaboration、useFormOffline、useFormAccess、useFormExport |
| 2 个 Pinia store | formDraft、formCollaboration |
| 2 个验证工具 | validation/types.ts、validation/rules.ts |
| 非功能需求 | XSS 防护（useRichText.sanitize）、加密正确性（useFormEncryption round-trip）、离线同步（同步队列逻辑）、协作锁定（字段锁定/解锁） |

### 1.2 不在范围内

| 排除项 | 原因 |
|--------|------|
| UI 组件（17 个） | 全部未实现（见开发方案 §9.1） |
| 后端 WebSocket 端点 | 后端实现未验证 |
| 文件分片上传（前端 + 后端） | file_service 未落地，上传组件未实现 |
| Service Worker 缓存 | 未实现 |
| TipTap / Leaflet 第三方组件 | 依赖未安装 |

### 1.3 测试目标

| 目标 | 判定 |
|------|------|
| 需求可追溯 | 13 个 hook 每个至少关联 1 个测试文件 |
| 核心路径自动化 | 13 个 hook 全部有单元测试文件，103 个用例 |
| 验证正确性 | 加密 round-trip、XSS 净化、循环依赖检测均有断言 |
| 缺陷可复现 | 每条缺陷附最小复现步骤与预期/实际 |

---

<a id="sec-2"></a>
## 二、测试策略

### 2.1 分层模型

| 层级 | 用例编号 | 自动化 | 执行时机 |
|------|---------|--------|---------|
| L1 单元 | `UT-F01` ~ `UT-F13` | 是 | 每次提交 |
| L2 组件 | `CT-F01` ~ `CT-F07` | 是 | 每次提交（UI 组件实现后） |
| L3 集成 | `IT-F01` ~ `IT-F04` | 是 | 每次提交 |
| L4 端到端 | `E2E-F01` ~ `E2E-F07` | 否 | 提测（UI 组件实现后） |
| L5 性能 | `PT-F01` ~ `PT-F04` | 否 | 发版前 |

### 2.2 优先级定义

| 级别 | 含义 | 用例范围 |
|------|------|---------|
| P0 | 核心能力，失败即阻塞发布 | UT-F01/02/03/04/05/06/08 |
| P1 | 重要能力，失败需评估 | UT-F07/09/10/11/12/13、IT-F01~F04 |
| P2 | 增强能力，可延后 | 视图/标签/自定义字段/定时导出相关 |

### 2.3 分层职责边界

| 层 | 测什么 | 不测什么 |
|----|--------|---------|
| UT | 纯函数边界、状态流转、异常分支 | DOM、样式 |
| CT | props → 渲染、事件冒泡、插槽 | 真实 RPC |
| IT | 组合后的数据流、RPC 参数形状、持久化落盘 | 视觉细节 |
| E2E | 真实后端下的完整用户路径 | 代码分支覆盖 |

---

<a id="sec-3"></a>
## 三、测试环境与前置条件

### 3.1 环境矩阵

| 项 | 要求 |
|----|------|
| 操作系统 | macOS / Linux（CI 为 Linux） |
| Node.js | 18（与 .nvmrc 一致） |
| 包管理器 | pnpm |
| 框架 | Vitest 4 + jsdom |
| 后端 | YiAi 运行于 `:10086`（仅 E2E 需要） |

### 3.2 执行命令

```bash
# 全部测试
pnpm test

# 仅表单 hook 测试
pnpm exec vitest run tests/hooks/useForm*.test.ts \
  tests/hooks/useConditionalLogic.test.ts \
  tests/hooks/useRichText.test.ts \
  tests/hooks/useAutoSave.test.ts \
  tests/hooks/useFieldDependency.test.ts

# 单文件
pnpm exec vitest run tests/hooks/useFormValidation.test.ts

# 类型检查
pnpm exec vue-tsc --noEmit
```

---

<a id="sec-4"></a>
## 四、准入与准出标准

### 4.1 准入（开始测试的条件）

| # | 条件 |
|---|------|
| 1 | 对应 hook 文件已提交 |
| 2 | `pnpm exec vue-tsc --noEmit` 无错误（hook 级别） |
| 3 | 对应测试文件已创建 |

### 4.2 准出（提测通过的条件）

| # | 条件 | 阈值 |
|---|------|------|
| 1 | 自动化测试通过率 | 100% |
| 2 | 遗留缺陷 | 无 Blocker / Critical |
| 3 | 需求覆盖 | 13 个 hook 均有测试文件 |
| 4 | 类型检查 | `vue-tsc --noEmit` 通过 |

### 4.3 已登记缺口（计入 Blocked）

| 缺口 | 阻塞用例 | 依据 |
|------|---------|------|
| UI 组件未实现 | CT-F01~F07 全部 | [开发方案 §9.1-1](../../devs/2026-09/02-prd-task-表单组件体系.md) |
| WebSocket 后端未验证 | 协作 E2E | [开发方案 §9.1-3](../../devs/2026-09/02-prd-task-表单组件体系.md) |
| useConditionalLogic 优先级缺陷 | 优先级测试 | [开发方案 §9.2-1](../../devs/2026-09/02-prd-task-表单组件体系.md) |
| 文件上传组件 + 后端未实现 | E2E 文件上传场景 | [开发方案 §9.1-2](../../devs/2026-09/02-prd-task-表单组件体系.md) |

---

<a id="sec-5"></a>
## 五、需求覆盖矩阵

### 5.1 功能需求覆盖

| FR | 需求 | 单元 | 组件 | 集成 | 端到端 |
|----|------|------|------|------|--------|
| FR-1 表单验证 | 声明式验证 + 异步验证 + 跨字段验证 | UT-F01 | CT-F01 | IT-F01 | E2E-F01 |
| FR-2 自动保存 | 防抖草稿 + 崩溃恢复 + 多草稿管理 | UT-F02 | — | IT-F02 | E2E-F02 |
| FR-3 表单向导 | 分步导航 + 条件步骤 + 断点续填 | UT-F03 | CT-F02 | IT-F03 | E2E-F04 |
| FR-4 字段依赖 | 级联选择 + 字段计算 + 循环检测 | UT-F04 | — | IT-F03 | — |
| FR-5 条件逻辑 | if-this-then-that + 11 种运算符 | UT-F05 | CT-F03 | IT-F03 | E2E-F07 |
| FR-6 批量输入 | CSV/JSON 导入 + 列映射 + 校验报告 | UT-F13 | CT-F04 | — | E2E-F07 |
| FR-7 字段加密 | RSA-OAEP + 遮罩 + 密钥导出 | UT-F06 | — | — | — |
| FR-8 富文本 | TipTap + Markdown + XSS 净化 | UT-F07 | CT-F05 | — | — |
| FR-9 签名板 | Canvas 绘制 + PNG/SVG 导出 | — | CT-F06 | — | — |
| FR-10 位置地图 | Leaflet + 坐标选点 + 地理编码 | — | CT-F07 | — | — |
| FR-11 实时协作 | WebSocket + 字段锁定 + 光标 | UT-F11 | — | — | — |
| FR-12 离线支持 | IndexedDB 队列 + 在线同步 | UT-F12 | — | — | E2E-F05 |
| FR-13 数据持久化 | 崩溃恢复 + 多标签同步 | UT-F08 | — | IT-F02 | — |
| FR-14 提交进度 | 管线步骤 + 重试策略 | UT-F09 | — | IT-F04 | E2E-F01 |
| FR-15 访问控制 | 表单级 + 字段级权限 | UT-F10 | — | — | E2E-F06 |
| FR-16 导入导出 | CSV/JSON 导入 + 列映射 + 导出 | UT-F13 | — | — | — |

### 5.2 覆盖统计

| 项 | 数量 |
|----|------|
| Hook 测试文件 | 13（100% 覆盖） |
| Hook 测试用例 | 103 |
| Store 测试文件 | 1（formDraft，21 用例） |
| 集成测试文件 | 4（IT-F01~F04，24 用例） |
| UI 组件测试 | 0（Blocked） |
| E2E 测试 | 0（待补，需 UI 组件） |
| Blocked（缺组件或后端） | 3 类（UI 组件 + WebSocket 后端 + 文件上传） |

---

<a id="sec-6"></a>
## 六、单元测试

> 位置：`tests/hooks/useForm*.test.ts` · 框架：Vitest + jsdom
> 通用要求：每个 hook 至少覆盖正常路径、边界值、异常分支。

### UT-F01 `useFormValidation`（P0·15 用例）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 初始化所有字段为 idle 状态 | `state.fields[name].status === "idle"` |
| 2 | 必填字段为空验证失败 | `validateField("name") → false` |
| 3 | 字段值符合规则验证通过 | `validateField("name") → true` |
| 4 | 邮箱格式错误返回 false | `validateField("email") → false` |
| 5 | 邮箱格式正确返回 true | `validateField("email") → true` |
| 6 | validateAll 全部通过 | `formStatus === "valid"` |
| 7 | validateAll 任一失败则整体失败 | `formStatus === "invalid"` |
| 8 | touchField 标记 touched + dirty | `touched === true, dirty === true` |
| 9 | markDirty 设置 dirty 标志 | `dirty === true` |
| 10 | resetValidation 清除所有状态 | 所有字段 status 回到 idle |
| 11 | clearFieldError 清除单字段错误 | `errors: [], status: "idle"` |
| 12 | firstErrorField 返回首个无效字段 | 返回字段名 |
| 13 | hasErrors / isValid 响应验证状态 | 验证后正确 |
| 14 | validateTouched 仅验证已交互字段 | 未交互字段保持 idle |
| 15 | when 回调返回 false 时跳过验证 | 字段保持 idle |

### UT-F02 `useAutoSave`（P0·6 用例）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 初始状态为 idle | `saveStatus === "idle"` |
| 2 | 数据变更标记 dirty | `isDirty === true, saveStatus === "unsaved"` |
| 3 | 防抖后自动保存 | saveStatus 变为 "saved" |
| 4 | 连续修改合并为一次保存 | 仅触发一次 persist |
| 5 | saveNow 立即保存 | saveStatus 立即变为 "saved" |
| 6 | enabled=false 时不保存 | saveStatus 保持 "idle" |

### UT-F03 `useFormWizard`（P1·11 用例）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 起始步骤为 0 | `currentStepIndex === 0` |
| 2 | nextStep 前进 | `currentStepIndex` 递增 |
| 3 | prevStep 后退 | `currentStepIndex` 递减 |
| 4 | 首步骤 prevStep 不越界 | `currentStepIndex === 0` |
| 5 | 末步骤 isLastStep 为 true | `isLastStep === true` |
| 6 | 条件步骤过滤 | 条件不满足时步骤不在 activeSteps 中 |
| 7 | 条件满足时步骤出现 | 条件步骤在 activeSteps 中 |
| 8 | reset 回到初始状态 | `currentStepIndex === 0` |
| 9 | restoreState 恢复位置和数据 | 恢复到指定步骤和数据 |
| 10 | progressPercent 计算正确 | 百分比与完成步骤数一致 |
| 11 | goToStep 跳转到指定步骤 | `currentStepIndex` 更新 |

### UT-F04 `useFieldDependency`（P1·5 用例）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 无环图检测无循环 | `detectCycles() → []` |
| 2 | 检测循环依赖（A→B→A） | `detectCycles()` 返回非空 |
| 3 | 父字段变更加载级联选项 | cascadeOptions 更新为正确数量 |
| 4 | 父字段变更清除子字段值 | `formData.city === undefined` |
| 5 | compute 计算派生字段值 | `formData.total === 30`，readonly 标记正确 |

### UT-F05 `useConditionalLogic`（P1·9 用例）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 规则条件不满足时字段未设置 | `fieldStates.email === undefined` |
| 2 | 规则条件满足时显示字段 | `fieldStates.email.visible === true` |
| 3 | require 动作生效 | `fieldStates.taxId.required === true` |
| 4 | disable 动作生效 | `fieldStates.submit.disabled === true` |
| 5 | OR 条件评估正确 | 任一条件满足即触发 action |
| 6 | exportRules/importRules 往返 | 导入后规则数一致 |
| 7 | set_value 更新 formData | `formData.computed === "auto-filled"` |
| 8 | testRules 模拟数据测试 | 返回正确的 fieldStates |
| 9 | 嵌套条件组 AND(OR) 正确 | `fieldStates.c.visible === true` |

### UT-F06 ~ UT-F13

| 文件 | 用例数 | 关键覆盖 |
|------|--------|---------|
| UT-F06 `useFormEncryption` | 9 | 初始化、密钥生成、encrypt/decrypt round-trip、encrypt/decrypt 异常、maskValue、空值、importPublicKey、exportEncryptedPrivateKey |
| UT-F07 `useRichText` | 9 | 初始化、updateContent、wordCount、isDirty、toggleMode、sanitize(script)、sanitize(onclick)、sanitize(javascript:)、autoSave |
| UT-F08 `useFormPersistence` | 5 | hasRecovery、checkRecovery、clearRecovery、腐败数据处理、formId 隔离 |
| UT-F09 `useFormSubmission` | 7 | 初始化、成功提交、重试逻辑、4xx 不重试、maxRetries 后失败、reset、指数退避 |
| UT-F10 `useFormAccess` | 8 | 无规则默认可见、角色限制可见、角色限制编辑、只读模式、can 表单权限、visibleFields、editableFields |
| UT-F11 `useFormCollaboration` | 2 | 模块导出、接口参数 |
| UT-F12 `useFormOffline` | 6 | isOnline 类型、isSyncing 初始、queueLength 初始、syncQueue 防止重复、API 完整性、syncError 初始 |
| UT-F13 `useFormExport` | 10 | 初始化状态、mapFields、executeImport 成功、executeImport 错误、exportCSV、exportJSON、File 创建、transform |

---

<a id="sec-7"></a>
## 七、组件测试

> **状态：全部 Blocked** — UI 组件未实现。
> 以下为补测标准，在组件开发后执行。

### CT-F01 `FormValidationMessage`（P0）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 无错误时不渲染 | 消息容器不存在 |
| 2 | 有错误时显示错误列表 | 每行对应一条错误消息 |
| 3 | 异步验证中显示 loading | loading 图标可见 |
| 4 | 多条错误逐条渲染 | 错误数与渲染行数一致 |
| 5 | 错误清除后消息消失 | 消息容器移除 |

### CT-F02 `FormWizard`（P1）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 步骤导航渲染正确 | 步骤数与配置一致 |
| 2 | 当前步骤高亮 | 对应步骤有 active 样式 |
| 3 | 已完成步骤标记 | 有完成图标 |
| 4 | 上一步/下一步按钮 | 首步隐藏上一步、末步显示提交 |
| 5 | 点击步骤指示器跳转 | emit step-change 事件 |
| 6 | 条件步骤不渲染 | 条件不满足的步骤不出现在导航中 |

### CT-F03 `FormConditionalLogic`（P1）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 规则列表渲染 | 所有规则可见 |
| 2 | 添加规则 | 规则集合新增一条 |
| 3 | 编辑规则条件 | 规则条件更新，emit 正确 |
| 4 | 删除规则 | 规则移除，emit 正确 |
| 5 | 拖拽调整优先级 | 顺序变化后 emit 正确 |
| 6 | 空规则列表提示 | 显示空状态占位 |

### CT-F04 `FormBatchInput`（P2）

| # | 用例 | 预期 |
|---|------|------|
| 1 | CSV 粘贴到文本框 | 解析为行/列数据结构 |
| 2 | JSON 粘贴到文本框 | 解析为对象数组 |
| 3 | 列映射下拉选择 | 源列与目标字段正确关联 |
| 4 | 预览表格渲染 | 显示前 5 行预览数据 |
| 5 | 格式错误提示 | 非法 CSV/JSON 显示错误消息 |
| 6 | 空输入提交拦截 | 提示"请先输入数据" |

### CT-F05 `RichTextEditor`（P2）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 初始内容渲染 | TipTap 编辑器显示传入的 HTML 内容 |
| 2 | 输入文本更新 modelValue | emit update:modelValue 事件 |
| 3 | 工具栏按钮点击 | 对应格式生效（加粗/斜体/列表） |
| 4 | Markdown 模式切换 | 编辑器切换为纯文本 Markdown 输入 |
| 5 | XSS 净化 | 粘贴 `<script>alert(1)</script>` 被过滤 |
| 6 | 图片拖拽上传 | 触发图片上传回调 |

### CT-F06 `SignaturePad`（P2）

| # | 用例 | 预期 |
|---|------|------|
| 1 | Canvas 区域渲染 | 签名画布可见且可交互 |
| 2 | 鼠标/触摸绘制 | 画布上出现笔迹 |
| 3 | 清除按钮重置画布 | 画布恢复空白 |
| 4 | 导出 PNG | 生成非空 base64 PNG 数据 |
| 5 | 导出 SVG | 生成有效 SVG 字符串 |
| 6 | 空画布导出拦截 | 提示"请先签名" |
| 7 | 笔触颜色/粗细可配置 | props 传入的颜色/粗细生效 |

### CT-F07 `LocationPicker`（P2）

| # | 用例 | 预期 |
|---|------|------|
| 1 | 地图容器渲染 | Leaflet 地图可见 |
| 2 | 点击地图选点 | 放置标记，emit 经纬度 |
| 3 | 搜索地址地理编码 | 输入地址 → 地图定位到对应坐标 |
| 4 | 标记拖拽更新坐标 | emit 更新后的经纬度 |
| 5 | 当前坐标显示 | 经纬度文本与标记位置一致 |
| 6 | 地图加载失败降级 | 显示"地图加载失败" + 手动输入经纬度 |

---

<a id="sec-8"></a>
## 八、集成测试

> **状态**：✅ IT-F01~F04 已实现（24 用例，全部通过）
> **位置**：`tests/integration/form{ValidationConditional,AutoSavePersistence,WizardConditional,SubmissionEncryption}.test.ts`
>
> 集成测试验证多个 composable 组合后的**数据流正确性**——单个 hook 单元测试通过不代表组合后行为正确。以下是每个集成场景的**效果说明与演示思路**。

### 效果演示总览

| 场景 | 组合 | 核心验证点 | 演示方式 |
|------|------|-----------|---------|
| IT-F01 | Validation + Conditional + Dependency | 隐藏字段跳过验证、循环依赖阻断 | 切换 type=company/individual 观察 taxId 验证状态变化 |
| IT-F02 | AutoSave + Persistence | 草稿自动写入 → 崩溃恢复 → 拒绝恢复 | 填写表单 → 模拟崩溃 → 刷新页面 → 恢复对话框 |
| IT-F03 | Wizard + Conditional + Dependency | 条件步骤显隐、跨步骤数据流 | 3 步向导中选择"企业用户"→ 步骤 2 出现企业字段 |
| IT-F04 | Submission + Encryption + Offline | 加密数据提交、重试一致性、4xx 不重试 | 提交含 SSN 表单 → 断网 → 恢复 → 数据同步 |

### IT-F01 验证 × 条件逻辑 × 字段依赖（P0·5 用例）

> **效果**：表单字段随条件动态显隐，验证引擎自动跳过隐藏字段，避免"看不见的字段报错"。

| # | 用例 | 前置 | 预期 | 效果说明 |
|---|------|------|------|---------|
| 1 | 条件隐藏字段后验证跳过 | type=individual，taxId 配置 when: type===company | validateAll 跳过 taxId，表单 valid | 用户选"个人"时不填税号也能提交——验证引擎智能跳过不可见字段 |
| 2 | 条件显示字段后验证生效 | type=company，taxId 为空 | validateAll 校验 taxId，表单 invalid | "看不到不验证，看得到必须验"的双向保证 |
| 3 | 循环依赖检测阻断 | A→B→A 的依赖链 | detectCycles 返回非空，验证失败 | 防止字段间死循环导致页面卡死 |
| 4 | 无环依赖通过 | province→city→district 单向链 | detectCycles 返回 [] | 合法的级联选择不受影响 |
| 5 | 依赖清除后验证重置 | city 从 "Hangzhou" 清空 | 验证状态从 valid → invalid | 父字段切换后子字段清空，验证状态同步更新 |

### IT-F02 自动保存 × 草稿恢复 × 持久化（P0·5 用例）

> **效果**：用户填写表单时自动保存草稿到 localStorage，即使浏览器崩溃，下次打开也能恢复未提交的内容。

| # | 用例 | 前置 | 预期 | 效果说明 |
|---|------|------|------|---------|
| 1 | 持久化保存 → 恢复检测 | 用户填写 3 个字段，saveRecoveryData | 新实例 checkRecovery 返回完整数据 | 模拟崩溃恢复：系统自动保存快照，重载后检测到草稿 |
| 2 | 拒绝恢复 → 清除 | 检测到草稿数据 | clearRecovery 后 checkRecovery 返回 null | 用户选择"放弃草稿"后数据彻底清除，不会反复弹窗 |
| 3 | 多 formId 隔离 | 表单 A（alpha）和表单 B（beta）分别保存 | 各自只能读取自己的草稿 | 不同表单的草稿不会串号——表单 A 的恢复不会拿到表单 B 的数据 |
| 4 | 腐败数据降级 | localStorage 中写入非法 JSON | checkRecovery 返回 null，不抛异常 | 存储层异常不阻塞页面加载 |
| 5 | autoSave × store 集成 | 修改数据 → 等待 debounce → 查 store | store.getDraftsByForm 返回草稿列表 | 自动保存的草稿进入 Pinia store，其他组件可消费草稿列表 |

### IT-F03 向导 × 条件逻辑 × 字段依赖（P1·4 用例）

> **效果**：多步骤表单中，步骤根据前序选择动态显隐，步骤间数据流正确传递。

| # | 用例 | 前置 | 预期 | 效果说明 |
|---|------|------|------|---------|
| 1 | 步骤 1 选择触发条件步骤 | 2 步向导 + 1 个条件步骤（仅 company 可见） | type=company 时 activeSteps 为 3，type=individual 为 2 | 企业用户看到额外步骤填写税号/公司名，个人用户直接跳过 |
| 2 | 返回修改触发重新评估 | 先选 business → 再改回 individual | business 步骤从导航消失 | 用户返回修改选择后，后续步骤实时调整，不会出现无效步骤 |
| 3 | 条件步骤跳过时索引正确 | role 为空 → admin 步骤隐藏 | nextStep 从 s1 直接跳到 s3，isLastStep 正确 | 隐藏步骤不影响步骤计数和"最后一步"判断 |
| 4 | 跨步骤依赖数据流 | 步骤 1 选省 → 步骤 2 的市选项基于省份 | resolveDeps 加载对应市的选项列表 | 省份切换后市选项实时更新，前一步的数据正确流入下一步 |

### IT-F04 提交 × 加密 × 重试（P1·7 用例）

> **效果**：敏感字段加密后提交，网络异常自动重试且保持加密数据一致性，业务错误区分处理。

| # | 用例 | 前置 | 预期 | 效果说明 |
|---|------|------|------|---------|
| 1 | 加密字段以密文提交 | ssn 字段已加密为 base64 | submit 收到的 payload 中 ssn 为密文 | 敏感数据在网络传输层不可读 |
| 2 | 重试保持加密一致性 | 第 1 次网络失败，第 2 次成功 | 两次 submitFn 调用的 payload 完全一致 | 重试不会对已加密字段二次加密（避免密文变成乱码） |
| 3 | 4xx 业务错误不重试 | 后端返回 422 验证失败 | 立即返回失败，仅调 1 次 | 业务错误（如数据不合法）重试无意义，直接反馈用户 |
| 4 | 5xx 服务端错误重试 | 后端返回 500 两次后成功 | 共调 3 次，最终成功 | 服务器临时故障自动恢复，用户无感知 |
| 5 | maxRetries 耗尽后失败 | 连续 3 次网络超时 | 返回失败，submitError 显示错误信息 | 持续故障时明确告知用户，不无限重试 |
| 6 | 提交管线步骤追踪 | 正常提交流程 | validate→upload→submit→process 全部 completed | 进度条/步骤指示器准确反映当前阶段 |
| 7 | reset 清除状态 | 提交失败后调用 reset | submitError/retryCount/isSubmitting 全部归零 | 用户重新提交前状态干净，不会残留上次错误 |

---

<a id="sec-9"></a>
## 九、端到端场景

> **状态：全部待补** — UI 组件和 E2E 基础设施未就绪。
> 入口：`http://localhost:8848/#/demo/forms`（需创建演示页面）

### 9.1 验证与提交（E2E-F01·P0）

- **GIVEN** 一个包含 20 个字段的表单（含必填、格式验证、异步验证）
- **WHEN** 用户填写所有字段并提交
- **THEN** 提交前所有验证通过，提交后显示成功消息，表单重置为初始状态

### 9.2 自动保存与崩溃恢复（E2E-F02·P0）

- **GIVEN** 用户正在填写表单，已输入 5 个字段
- **WHEN** 浏览器崩溃后重新打开页面
- **THEN** 弹出草稿恢复对话框，确认后恢复已填写内容，未填写字段保持空白

### 9.3 表单向导条件步骤（E2E-F04·P1）

- **GIVEN** 一个 3 步向导表单，步骤 2 仅当步骤 1 选择"企业用户"时出现
- **WHEN** 步骤 1 选择"个人用户" → 点击下一步
- **THEN** 直接跳到步骤 3（原步骤 2 被跳过）
- **WHEN** 返回步骤 1 改为"企业用户" → 点击下一步
- **THEN** 进入步骤 2，显示企业相关信息字段

### 9.4 离线表单提交与同步（E2E-F05·P1）

- **GIVEN** 用户填写完整表单
- **WHEN** 断开网络 → 点击提交 → 提示"已保存，将在网络恢复后提交" → 恢复网络
- **THEN** 表单数据自动同步到后端，提交记录出现在列表中

### 9.5 字段级权限控制（E2E-F06·P2）

- **GIVEN** 表单含 salary 字段，仅 finance 角色可编辑，其他角色只读
- **WHEN** 非 finance 角色打开表单
- **THEN** salary 字段渲染为只读文本，无输入框；finance 角色可正常编辑

### 9.6 条件逻辑动态字段（E2E-F07·P1）

- **GIVEN** 表单配置条件规则："type=company 时显示 taxId 并设为必填"
- **WHEN** 用户选择 type=company
- **THEN** taxId 字段出现，标记为必填；用户选择 type=individual 后 taxId 隐藏

### 9.7 批量输入粘贴（E2E-F07·P2）

- **GIVEN** 表单的批量输入入口
- **WHEN** 用户粘贴 CSV 表格数据 → 映射列 → 确认导入
- **THEN** 表单各字段填充为对应列的值，校验报告显示成功/失败行数

---

<a id="sec-10"></a>
## 十、性能验收测试

### PT-F01 50+ 字段表单首次渲染（P2）

| 项 | 内容 |
|----|------|
| 前置 | 创建含 50 个字段（含 10 个异步验证字段）的表单配置 |
| 步骤 | 1. 导航到表单页面 2. Performance API 记录渲染完成时间 |
| 阈值 | `DOMContentLoaded` → 所有字段可交互 < 500ms |
| 状态 | 待补 |

### PT-F02 autosave debounce 响应（P1）

| 项 | 内容 |
|----|------|
| 前置 | 启用 autoSave，debounce 配置为 2000ms |
| 步骤 | 1. 修改字段值 2. 记录从最后输入到 saveStatus="saved" 的时间 |
| 阈值 | 输入停止后 2s ± 200ms 内触发保存 |
| 状态 | ✅ 配置已实现（dev 验证通过） |

### PT-F03 大文件分片上传吞吐（P2）

| 项 | 内容 |
|----|------|
| 前置 | 文件上传组件实现，后端 file_service 就绪（当前 Blocked） |
| 步骤 | 1. 上传 50MB 文件 2. Performance API 记录总耗时 |
| 阈值 | 平均吞吐 > 5MB/s |
| 状态 | Blocked（上传组件 + 后端未实现） |

### PT-F04 表单初始化内存占用（P2）

| 项 | 内容 |
|----|------|
| 前置 | 创建含 100 个字段的表单，挂载所有 composable |
| 步骤 | 1. Chrome DevTools Memory 面板录制堆快照 2. 挂载前后对比 |
| 阈值 | 增量 < 5MB |
| 状态 | 待补 |

---

<a id="sec-11"></a>
## 十一、无障碍测试

> **状态：全部待补** — 需 UI 组件实现后方可验证。

| # | 检查项 | 验证方法 | 预期 | 状态 |
|---|--------|---------|------|------|
| A11Y-F01 | 表单字段 `<label>` 关联 `<input>` | 检查 `for` + `id` 绑定，屏幕阅读器可读出标签 | 每个 input/select/textarea 有对应 label | 待补 |
| A11Y-F02 | 必填字段 `aria-required="true"` | 检查必填字段 DOM 属性 | 必填字段有 aria-required + 视觉星号 | 待补 |
| A11Y-F03 | 验证错误 `aria-describedby` 关联 | 触发验证错误后检查 input 的 aria-describedby | 指向错误消息元素的 id | 待补 |
| A11Y-F04 | 表单向导 `aria-current="step"` | 检查步骤导航 DOM | 当前步骤 li 有 aria-current="step" | 待补 |
| A11Y-F05 | 文件上传键盘操作 | Tab 聚焦 + Space/Enter 触发 | 键盘可完成上传操作全流程 | 待补 |
| A11Y-F06 | 签名板替代输入 | 检查是否提供文本输入 fallback | 无法绘制的用户可用文本替代 | 待补 |
| A11Y-F07 | 加载状态 `aria-busy="true"` | 触发异步验证/提交时检查容器 | 加载中区域 aria-busy="true" | 待补 |
| A11Y-F08 | 离线指示器 `role="status"` | 断网后检查状态指示器 | role="status" + aria-live="polite" 播报状态变化 | 待补 |
| A11Y-F09 | Tab 键导航顺序 | 按 Tab 键遍历表单 | 焦点顺序与视觉顺序一致 | 待补 |
| A11Y-F10 | 颜色对比度 | Chrome Lighthouse 审计 | 文本/背景对比度 ≥ 4.5:1（正文），≥ 3:1（大文本） | 待补 |

---

<a id="sec-12"></a>
## 十二、缺陷分级与处理流程

### 12.1 分级定义

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或导致数据损坏 | 加密字段解密失败导致数据丢失 |
| Critical | 核心功能不可用 | 表单提交无限重试；验证断言崩溃 |
| Major | 功能缺陷但有替代路径 | useConditionalLogic 优先级反转 |
| Minor | 体验或边界问题 | 草稿保存失败提示不清晰 |
| Trivial | 视觉细节 | 可延后 |

### 12.2 缺陷登记表

| # | 缺陷 | 级别 | 关联用例 | 复现步骤 | 状态 |
|---|------|------|---------|---------|------|
| 1 | `useConditionalLogic.runRules()` 优先级处理：高优先级规则先执行但被低优先级覆盖 | Major | UT-F05-1 | 添加 2 条规则，高优先级 set_value，低优先级 hide → hide 覆盖了 set_value | 待修复（[开发方案 §9.2-1](../../devs/2026-09/02-prd-task-表单组件体系.md)） |

### 12.3 缺陷处理流程

```
发现 → 登记（本节表格）→ 评估级别 → P0/Critical: 立即修复
                                     → Major: 当前迭代修复
                                     → Minor/Trivial: 排期或关闭
修复 → 补测 → 回归通过 → 关闭
```

---

<a id="sec-13"></a>
## 十三、自动化现状与缺口

### 13.1 已有测试文件

| 位置 | 文件数 | 覆盖本需求的文件 |
|------|--------|----------------|
| `tests/hooks/` | 34 | **13**（useFormValidation 等 13 个表单 hook 测试） |
| `tests/components/` | 11 | 0（表单组件全部未实现） |
| `tests/integration/` | 3 | 0 |
| `tests/utils/` | 11 | 0 |
| `tests/stores/` | 0 | 0（formDraft / formCollaboration 无直接测试） |

### 13.2 执行结果（2026-09-15）

| 指标 | 值 |
|------|-----|
| 全局测试文件 | 96（89 passed, 7 failed） |
| 全局测试用例 | 864（857 passed, 7 failed） |
| 表单 Hook 测试文件 | 13（103 用例，全部通过） |
| 表单 Store 测试文件 | 1（formDraft，21 用例，全部通过） |
| 表单集成测试文件 | 4（IT-F01~F04，24 用例，全部通过） |
| 执行命令 | `cd YiVad && pnpm test` |

> **表单模块状态**：13 个 hook 测试 + 1 个 store 测试 + 4 个集成测试，共 145 个用例，通过率 100%。全局存在 7 个失败文件与表单体系无关。

### 13.3 覆盖情况

| 项 | 已覆盖 | 缺口 |
|----|--------|------|
| 13 个 composable | 13（文件级 100%） | — |
| 2 个 store | 1（formDraft 21 用例） | formCollaboration store 未独立存在，协作状态在 useFormCollaboration hook 中管理 |
| 集成场景 | 4（IT-F01 ~ IT-F04，24 用例） | — |
| UI 组件（17 个） | 0 | CT-F01 ~ CT-F07 全部待补（Blocked） |
| E2E | 0 | 7 个场景全为手动 |

### 13.4 待补自动化（按优先级）

| 优先级 | 项 | 内容 | 预估 |
|--------|-----|------|------|
| P1 | 组件测试 | CT-F01 ~ CT-F07（7 个组件共 40 个用例） | 2.0d（需先实现 UI 组件） |
| P1 | E2E 场景 | 7 个场景（E2E-F01 ~ F07） | 1.5d（需 UI 组件 + E2E 基础设施） |
| P2 | 无障碍测试 | A11Y-F01 ~ F10 | 0.5d（需 UI 组件） |
| P2 | 性能测试 | PT-F01 ~ F04 | 0.5d |

---

## 附录 A：测试文件与 Hook 对应关系

| Hook | 测试文件 | 用例数 |
|------|---------|--------|
| useFormValidation | `tests/hooks/useFormValidation.test.ts` | 15 |
| useAutoSave | `tests/hooks/useAutoSave.test.ts` | 6 |
| useFormWizard | `tests/hooks/useFormWizard.test.ts` | 11 |
| useFieldDependency | `tests/hooks/useFieldDependency.test.ts` | 5 |
| useConditionalLogic | `tests/hooks/useConditionalLogic.test.ts` | 9 |
| useFormEncryption | `tests/hooks/useFormEncryption.test.ts` | 9 |
| useRichText | `tests/hooks/useRichText.test.ts` | 9 |
| useFormPersistence | `tests/hooks/useFormPersistence.test.ts` | 5 |
| useFormSubmission | `tests/hooks/useFormSubmission.test.ts` | 7 |
| useFormAccess | `tests/hooks/useFormAccess.test.ts` | 8 |
| useFormCollaboration | `tests/hooks/useFormCollaboration.test.ts` | 3 |
| useFormOffline | `tests/hooks/useFormOffline.test.ts` | 6 |
| useFormExport | `tests/hooks/useFormExport.test.ts` | 10 |
| **合计** | **13 文件** | **103** |

## 附录 A-2：Store 与集成测试文件

| 测试文件 | 覆盖范围 | 用例数 |
|---------|---------|--------|
| `tests/stores/formDraft.test.ts` | 草稿 CRUD、localStorage 持久化、过期清理、腐败数据降级、formId 隔离 | 21 |
| `tests/integration/formValidationConditional.test.ts` | IT-F01：验证 × 条件逻辑 × 字段依赖 | 5 |
| `tests/integration/formAutoSavePersistence.test.ts` | IT-F02：自动保存 × 草稿恢复 × 持久化 | 5 |
| `tests/integration/formWizardConditional.test.ts` | IT-F03：向导 × 条件逻辑 × 字段依赖 | 4 |
| `tests/integration/formSubmissionEncryption.test.ts` | IT-F04：提交 × 加密 × 重试 | 7 |
| **合计** | **5 文件** | **42** |

## 附录 B：E2E 用例编号对照

| 编号 | 场景 | 优先级 | 前置依赖 |
|------|------|--------|---------|
| E2E-F01 | 验证与提交 | P0 | 表单 UI 组件 |
| E2E-F02 | 自动保存与崩溃恢复 | P0 | 表单 UI + autoSave |
| E2E-F04 | 表单向导条件步骤 | P1 | FormWizard 组件 |
| E2E-F05 | 离线表单提交与同步 | P1 | Service Worker + 离线队列 |
| E2E-F06 | 字段级权限控制 | P2 | 权限配置后端 |
| E2E-F07 | 条件逻辑动态字段 | P1 | FormConditionalLogic 组件 |
| E2E-F07 | 批量输入粘贴 | P2 | FormBatchInput 组件 |