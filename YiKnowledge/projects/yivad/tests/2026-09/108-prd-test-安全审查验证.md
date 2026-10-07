---
title: "YV-09-108-TEST: 安全审查验证"
tags: [安全, 测试]
category: 项目/管理后台/测试
created: "2026-09-23"
source: 内部
type: test
status: 待开始
priority: P2
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-108-TEST
prd_ref: YV-09-108
estimate: 0.25
review_status: 已评审
lifecycle: active
---

# YV-09-108-TEST: 安全审查验证

| TC | 验证 | 期望 |
|----|------|------|
| 1 | `<script>alert(1)</script>` 输入 Markdown 编辑器 | DOMPurify 移除脚本标签 |
| 2 | Mermaid 恶意节点 `click {fetch('...')}` | strict 模式拒绝 |
| 3 | 无 token 访问受保护路由 | 重定向 /login |
| 4 | `pnpm audit` | 0 高危漏洞 |
| 5 | localStorage 无明文密码 | `grep password localStorage` → 0 |