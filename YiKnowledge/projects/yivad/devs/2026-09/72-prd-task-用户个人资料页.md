---
prd_task_id: "YV-09-198"
title: "YV-09-198: 用户个人资料页 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "72-prd-用户个人资料页.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户个人资料页]
roles: [engineer]
benefit: "开发方案：task-用户个人资料页"
lifecycle: active
---

# YV-09-198: 用户个人资料页 — 开发方案

> 需求编号：YV-09-198 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `ProfilePage.vue` | 个人资料编辑页面 | `src/views/settings/` |
| `AvatarUpload.vue` | 头像上传+裁剪组件 | `src/components/user/` |
| `userSettingsStore.ts` | 用户设置 Store（资料+通知+安全） | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户个人资料编辑页面：头像/姓名/邮箱/手机/部门/职位。

### 架构方案

**技术路线**：独立路由页面 `/settings/profile`，`el-form` + 字段级校验规则。头像上传复用现有 Upload 组件连接到 YiAi 文件服务，回显通过 `userStore.currentUser` 获取。保存通过 YiAi `data_service.update_document("users", ...)` 持久化。

**数据模型**：
```typescript
interface UserProfile {
  avatar_url: string;
  display_name: string;    // 2-20 字符，必填
  email: string;           // 格式校验，修改后需验证
  phone?: string;          // 格式校验，可选
  department: string;      // 下拉选择
  position: string;        // 文本输入
}
```

**组件树**：
```
ProfilePage.vue (el-form + 保存按钮)
├── AvatarUpload.vue (头像上传 + 裁剪 + 预览)
│   └── AvatarCropper.vue (vue-advanced-cropper 或 cropperjs)
├── el-form-item × 5 (display_name / email / phone / department / position)
└── SaveStatusIndicator.vue (saved / saving / error)
```

**关键决策**：
- 头像上传：复用现有 Upload 组件 → YiAi `/upload-file` API → 返回 URL → 更新 `userStore.currentUser.avatar_url`
- 邮箱修改：需要验证流程（发送验证码 → 输入验证码 → 确认修改），防止误填不可达邮箱
- 用户名唯一性：修改 `display_name` 时需调用 `data_service.query_documents` 检查重名
- 保存策略：手动保存（非自动保存），因为涉及网络请求和验证流程
- 部门下拉选项：从 `data_service.query_documents("departments")` 动态加载

### 可编辑字段

| 字段 | 校验规则 | 编辑方式 |
|------|---------|---------|
| 头像 | 图片上传，<2MB，支持 jpg/png/webp | Upload 组件 + 裁剪 |
| 姓名 | 必填，2-20 字符，不能纯数字 | el-input |
| 邮箱 | RFC 5322 格式，修改需验证 | el-input + 验证码 |
| 手机 | E.164 格式（可选） | el-input |
| 部门 | 从下拉列表选择 | el-select |
| 职位 | 文本输入，≤ 50 字符 | el-input |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | ProfilePage 表单页面 + 6 字段校验规则 | 表单渲染 + 校验 | 0.10 |
| 2 | AvatarUpload 头像上传+裁剪 | 选择→裁剪→上传→回显 | 0.08 |
| 3 | 邮箱修改验证流程 | 发送验证码→确认→保存 | 0.04 |
| 4 | 集成 userStore 数据加载+保存 | 加载→编辑→保存→刷新 | 0.03 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 6 个字段正确渲染 + 校验规则生效
- [ ] 头像上传→裁剪→上传→回显流程完整
- [ ] 邮箱修改需要验证（验证码确认后才保存）
- [ ] 用户名唯一性检查（修改时查询重名）
- [ ] 保存成功后 userStore 更新 + ElMessage 成功提示
- [ ] 加载状态（skeleton）+ 错误状态（重试按钮）
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | ProfilePage.vue |
| 组件 | 1 | AvatarUpload.vue (头像上传+裁剪) |
| Store | 1 | userSettingsStore.ts |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 6 字段校验规则覆盖（必填/格式/长度）
- [x] 头像上传→裁剪→回显流程
- [x] 邮箱修改验证码流程
- [x] 用户名唯一性检查
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过