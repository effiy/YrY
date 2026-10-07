---
doc_type: test
title: "YiVad 运行时稳定性修复 — 测试方案"
tags:
- 测试方案
- 运行时稳定性
- 回归测试
category: 项目/管理后台/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P0
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: '202609'
test_id: YV-09-100
prd_ref: YV-09-100
dev_ref: YV-09-100
estimate: 0.25
review_status: 已评审
roles:
- engineer
---

# YiVad 运行时稳定性修复 — 测试方案

> 测试编号：YV-09-100 · 关联 PRD：YV-09-100 · 关联 Dev：YV-09-100

---

## 一、测试策略

三层覆盖：编译验证 → 单元行为 → 集成场景

---

## 二、编译验证

### TC-001: TypeScript 类型检查

```bash
cd YiVad && npx vue-tsc --noEmit
```

**预期**：无新增类型错误。预存错误（`knowledge/`、`reports/`）不受影响。

### TC-002: 生产构建

```bash
cd YiVad && pnpm build
```

**预期**：构建成功，产物在 `dist/`。

---

## 三、Pinia Store 测试

### TC-003: tabs store 正常初始化

**步骤**：
1. 清除所有 localStorage（模拟首次访问）
2. 访问 YiVad 任意页面
3. 打开多个标签页

**预期**：标签页功能正常，无 Pinia 崩溃错误。

### TC-004: tabs store 关闭标签页

**步骤**：
1. 打开 3+ 标签页
2. 逐个关闭标签页

**预期**：`closeMultipleTab`、`closeTabsOnSide`、`removeTabs` 正常执行，KeepAlive 缓存正确更新。

---

## 四、错误处理测试

### TC-005: HTTP 5xx 错误仅弹一次 toast

**步骤**：
1. Mock API 返回 500 错误
2. 触发一个调用该 API 的操作

**预期**：仅弹一次错误 toast（HTTP 拦截器处理），`errorHandler` 不再重复弹窗。

### TC-006: HTTP 401 错误仅弹一次 toast

**步骤**：
1. Token 过期 → API 返回 401
2. Vue `errorHandler` 收到错误

**预期**：仅弹一次"登录过期"toast。

### TC-007: Vue 渲染错误正常捕获

**步骤**：
1. 在某个组件 `template` 中故意触发渲染异常
2. 观察控制台

**预期**：错误被 `reportError()` 捕获并报告，不重复弹 toast。

### TC-008: 网络断开错误正常处理

**步骤**：
1. 断开网络
2. 发起 API 请求

**预期**：仅弹一次"网络连接失败"toast。

---

## 五、路由测试

### TC-009: 大小写登录路径匹配

**步骤**：
1. 直接访问 `/Login`（大写 L）
2. 直接访问 `/login`（小写）

**预期**：两个路径均正确识别为登录页，token 存在时跳转到首页。

### TC-010: 土耳其语区域登录路径

**步骤**：
1. 浏览器语言设为 `tr-TR`
2. 访问 `/LOGIN`

**预期**：路由守卫正确识别为登录页（不依赖 locale）。

---

## 六、错误报告测试

### TC-011: sendBeacon 发送到正确地址

**前置**：`RSBUILD_ENV_API_URL = "https://api.example.com/yiai"`

**步骤**：
1. 触发一个 SCRIPT 错误
2. 检查 Network 面板中 sendBeacon 目标

**预期**：发送到 `https://api.example.com/yiai/api/error-report`。

### TC-012: 未设置 API URL 时回退

**前置**：未设置 `RSBUILD_ENV_API_URL`

**步骤**：
1. 触发错误

**预期**：发送到 `/api/error-report`（相对路径回退）。

---

## 七、测试结果

| 测试编号 | 描述 | 结果 | 备注 |
|----------|------|------|------|
| TC-001 | TypeScript 类型检查 | ✅ | 无新增错误 |
| TC-002 | 生产构建 | ✅ | `pnpm build` 通过 |
| TC-003 | tabs store 初始化 | ✅ | 无 Pinia 崩溃 |
| TC-004 | tabs store 关闭 | ✅ | KeepAlive 正常 |
| TC-005 | 5xx 单次 toast | — | 需 mock |
| TC-006 | 401 单次 toast | — | 需 mock |
| TC-007 | 渲染错误捕获 | — | 需手动触发 |
| TC-008 | 网络断开处理 | — | 需断网测试 |
| TC-009 | 大小写登录路径 | ✅ | 行为正确 |
| TC-010 | 土耳其语区域 | ✅ | `toLowerCase()` 不受 locale 影响 |
| TC-011 | sendBeacon 地址 | — | 需配置环境变量验证 |
| TC-012 | 路径回退 | ✅ | 回退逻辑正确 |

---

## 八、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/100-prd-运行时稳定性修复.md` |
| Dev | `../devs/2026-09/100-prd-task-运行时稳定性修复.md` |
| Bug × 4 | `../bugs/2026-09/代码质量/75-76-*.md` `../bugs/2026-09/路由权限/02-*.md` `../bugs/2026-09/数据/01-*.md` |