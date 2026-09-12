---
doc_type: test
title: "YV-09-82: 客户与外部协作门户 — 受限权限客户访问、共享项目视图、反馈收集、安全文件共享、品牌化门户、外部活动日志 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-82"
source_prds: ["37-prd-客户与外部协作门户"]
source_modules: []
---
# YV-09-82: 客户与外部协作门户 — 受限权限客户访问、共享项目视图、反馈收集、安全文件共享、品牌化门户、外部活动日志 — 测试规格

> 来源 PRD：[37-prd-客户与外部协作门户.md](../../prds/2026-09/37-prd-客户与外部协作门户.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：客户登录

**GIVEN** 客户访问 `/portal/acme-corp`
**WHEN** 输入邮箱 `client@acme.com` 并点击发送验证码
**THEN** 收到 6 位验证码邮件
**WHEN** 输入正确验证码
**THEN** 登录成功，看到 Acme Corp 品牌化门户首页

### 场景 2：品牌化门户

**GIVEN** 客户已登录，门户配置主色调为 `#FF6600`
**WHEN** 访问门户各页面
**THEN** 导航栏、按钮、链接颜色为 `#FF6600`
**AND** Logo 显示客户公司的 Logo
**AND** 页脚显示客户公司名称

### 场景 3：受限项目视图

**GIVEN** 客户被授权查看 "Website Redesign" 项目，但未授权 "Internal Tools" 项目
**WHEN** 客户访问项目列表
**THEN** 仅显示 "Website Redesign" 项目
**AND** "Internal Tools" 项目不可见

### 场景 4：客户反馈

**GIVEN** 客户在门户中查看 Issue "Implement Login Page"
**WHEN** 客户点击 "提交反馈"
**THEN** 弹出反馈表单：标题、描述、优先级
**WHEN** 客户提交反馈
**THEN** 系统创建反馈 Issue，关联到原 Issue
**AND** 内部团队收到通知

### 场景 5：安全文件共享

**GIVEN** PM 上传文件 "design-mockup.pdf" 并设置 7 天过期、最多下载 3 次
**WHEN** 客户在门户下载该文件（第 1 次）
**THEN** 下载成功，记录访问日志
**WHEN** 客户第 4 次尝试下载
**THEN** 显示 "下载次数已用完"
**WHEN** 8 天后尝试下载
**THEN** 显示 "链接已过期"

### 场景 6：活动日志

**GIVEN** 客户在门户中浏览了项目、查看了 3 个 Issue、下载了 1 个文件
**WHEN** PM 在管理后台查看客户活动日志
**THEN** 显示：登录时间、浏览页面、查看 Issue 详情、文件下载记录
**AND** 显示 IP 地址和时间戳

---

