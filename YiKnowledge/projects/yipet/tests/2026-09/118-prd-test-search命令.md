---

doc_type: module
prd_id: "PE-09-118"
title: "PE-09-118-test: /search 命令 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-118-test: /search 命令 — 测试方案

## 测试用例

### TC-01: 有结果搜索
```
Given: YiKnowledge 包含 "RPC" 相关文件
When: /search RPC 协议
Then: 显示结果表格（最多 8 行），底部总计
```

### TC-02: 无结果搜索
```
Given: 搜索词 "xyznotfound123"
When: /search xyznotfound123
Then: 显示 "No results for xyznotfound123"
```

### TC-03: 空查询提示
```
Given: 输入 "/search " (无查询词)
When: 发送
Then: 提示 "Usage: /search <query>"
```

### TC-04: 服务不可用
```
Given: KnowledgeService 未注入
When: /search term
Then: 提示 "Knowledge service unavailable"