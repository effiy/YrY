---
title: "YV-09-100-TEST: YiVad 代码质量全面优化 — 测试方案"
tags:
  - 测试方案
  - 代码质量
  - bug修复
  - 回归测试
category: 项目/管理后台/测试
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: test
status: 已完成
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-100-TEST
prd_ref: YV-09-100
dev_ref: YV-09-100-TASK
estimate: 0.75
review_status: 已评审
roles:
  - engineer
related_modules:
  - "100-prd-YiVad代码质量全面优化"
  - "100-prd-task-YiVad代码质量全面优化"
benefit: "17 个修复的系统化验证方案，覆盖单元测试、集成测试和手动验证"
lifecycle: active
---

# YV-09-100-TEST: YiVad 代码质量全面优化 — 测试方案

> 验证 17 个 bug 修复的正确性，确保无回归。

---

## 测试环境

| 环境 | 配置 |
|------|------|
| 浏览器 | Chrome 最新版 / Edge 最新版 / Firefox 最新版 |
| 后端 | YiAi FastAPI :10086 (已启动) |
| 数据库 | MongoDB (已连接) |
| 构建 | `pnpm build:pro` 成功 + `vue-tsc --noEmit` 零错误 |

---

## 测试用例

### TC-1: ReportBuilder 时间戳显示

**前置条件**: ReportBuilder 页面已打开，选择 Project 和 Date Range
**步骤**:
1. 等待数据加载完成
2. 查看页面右上角时间戳
**期望**: 显示类似 "Updated 5s ago" / "Updated 2m ago" 的相对时间
**实际**: ~~显示空白（fmtTime undefined）~~ → ✅ 显示正确时间

### TC-2: 批量删除确认对话框

**前置条件**: Bug 列表页，至少选中 2 个 bug
**步骤**:
1. 勾选多个 bug
2. 点击批量删除
3. 查看确认对话框标题
**期望**: 对话框标题为 "Delete"（国际化翻译），而非空标题
**实际**: ~~标题为空（window.confirm 不支持第二个参数）~~ → ✅ 显示正确标题

### TC-3: Issue 表单 Enter 键提交

**前置条件**: Issue 编辑对话框已打开
**步骤**:
1. 填写表单字段
2. 按 Enter 键
**期望**: 表单正常提交并关闭对话框
**实际**: ~~Enter 无反应（actions.submitForm 不存在）~~ → ✅ 正常提交

### TC-4: KPI Metric 下拉选择

**前置条件**: ReportBuilder → 添加 KPI Card → 打开配置抽屉
**步骤**:
1. 在 KPI Metric 下拉中选择一个指标
**期望**: 下拉值正常选中，控制台无 Vue 报错
**实际**: ~~可选链 v-model 导致报错~~ → ✅ 正常选择

### TC-5: Grid KeepAlive 监听器计数

**前置条件**: 使用 Grid 组件的页面（SearchForm 等）在 KeepAlive 缓存中
**步骤**:
1. 在 Chrome DevTools → Performance Monitor → JS Event Listeners 中查看
2. 切换页面 5 次（A → B → A → B → A）
3. 检查 `window.resize` 监听器数量
**期望**: 始终为 1（非累积增长）
**实际**: ~~每次激活+1 个监听器~~ → ✅ 保持 1 个

### TC-6: FileAlertsDashboard 轮询切换

**前置条件**: FileAlertsDashboard 页面打开
**步骤**:
1. 点击 "Auto" 按钮启动轮询
2. 在下拉选择中切换轮询间隔（10s → 30s → 60s）
3. 观察数据自动刷新
**期望**: 按新间隔正常刷新，无 TypeScript 错误
**实际**: ~~clearInterval/setInterval 标识符在模板不可访问~~ → ✅ 正常切换

### TC-7: ProTable 快速翻页数据一致性

**前置条件**: 任意 ProTable 页面（数据量较大，API 有明显延迟）
**步骤**:
1. 页面加载后快速点击 "下一页" 按钮 3 次
2. 观察最终显示的页码和数据
**期望**: 显示第 4 页数据，非第 2 页
**实际**: ~~可能显示第 2 页（竞态条件）~~ → ✅ 正确显示第 4 页

### TC-8: curl 竞态条件

**方式**: 在 Chrome DevTools → Network 中手动节流（Slow 3G）
**步骤**:
1. 启用网络节流
2. 快速点击翻页按钮 3 次
3. 等待所有请求返回
4. 检查表格显示的数据
**期望**: 最后一行页码对应的数据，非先返回的数据

### TC-9: SSE 认证 Token

**前置条件**: YiAi 后端启用认证模式
**步骤**:
1. 打开浏览器 DevTools → Network → WS/Fetch
2. 寻找 `/notification/stream` SSE 连接
3. 检查请求 URL 中的 `?token=` 参数
**期望**: `?token=` 后跟随有效 JWT token，非空
**实际**: ~~token 始终为空~~ → ✅ 携带有效 token

### TC-10: 生产构建 console.log 清理

**前置条件**: 执行 `pnpm build:pro`
**步骤**:
1. `grep -rn "console.log(" dist/` 检查构建产物
2. 在生产环境中使用 AI Chat
3. 观察浏览器控制台
**期望**: 无 `[setActiveMessages]` 或 `[aiChat onDone]` 等调试日志
**实际**: ~~生产环境有调试日志~~ → ✅ 仅 DEV 环境输出

### TC-11: vue-tsc 零错误回归

**步骤**:
1. 执行 `npx vue-tsc --noEmit`
2. 检查输出是否仅有 npm 警告，无 TypeScript 错误
3. 执行 `pnpm lint:eslint` 检查新增 lint 问题
**期望**: 
- vue-tsc: 0 errors（仅 npm warn 可忽略）
- ESLint: 无新增错误（预存错误除外）

### TC-12: YiAi live.py 今日统计

**前置条件**: MongoDB `issues` 集合中存在今日创建或完成的数据
**步骤**:
1. `curl http://localhost:10086/dashboard/live-snapshot`
2. 检查 JSON 响应中的 `today_done` 和 `today_created` 字段
**期望**: 字段值为非零整数（如果今日确有数据）
**实际**: ~~始终为 0~~ → ✅ 正确计数

---

## 回归检查清单

在完成所有修复后，以下关键流程必须通过回归测试：

- [ ] 用户登录 → 首页 Dashboard 加载 → KPI 卡片显示正常
- [ ] 项目列表 → 点击项目 → 详情页 Tabs 正常切换
- [ ] Issue 列表 → ProTable 搜索/排序/翻页正常
- [ ] Bug 列表 → 创建/编辑/删除正常
- [ ] AI Chat → SSE 流式对话正常 → 消息持久化
- [ ] Report Builder → 添加组件 → 配置 → 保存/加载报表
- [ ] 知识库 → SRE/Leader/Engineer Dashboard 正常加载
- [ ] 通知中心 → SSE 连接 → 新通知推送
- [ ] 菜单管理 → 动态路由 → 权限守卫
- [ ] 全局搜索 → 命令面板 (⌘K) → 快捷键

---

## 度量指标

| 指标 | 修复前 | 修复后 | 目标 |
|------|--------|--------|------|
| vue-tsc 错误数 | 7 | **0** | 0 |
| 运行时 crash 风险 | 3 处 | **0** | 0 |
| 竞态条件 | 1 (useTable) | **0** | 0 |
| 内存泄漏 | 1 (Grid) | **0** | 0 |
| 认证漏洞 | 1 (SSE) | **0** | 0 |
| 生产 console 泄漏 | 3 | **0** | 0 |
| 死代码 (void 抑制) | 1 | **0** | 0 |