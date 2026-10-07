---

doc_type: module
prd_id: "PE-09-112"
title: "PE-09-112-test: 项目自动标记 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-112-test: 项目自动标记 — 测试方案

## 测试用例

### TC-01: YiVad 页面 → project:YiVad

```
Given: pageInfo.url = "http://localhost:8848/#/project/yivad"
When: 创建新会话
Then: tags 包含 "project:YiVad"
```

### TC-02: GitHub 页面 → project:GitHub

```
Given: pageInfo.url = "https://github.com/user/repo"
When: 创建新会话
Then: tags 包含 "project:GitHub"
```

### TC-03: 未知页面 → 无 project 标签

```
Given: pageInfo.url = "https://www.example.com"
When: 创建新会话
Then: tags = ["source:YiPet", "from:..."]，无 project: 标签