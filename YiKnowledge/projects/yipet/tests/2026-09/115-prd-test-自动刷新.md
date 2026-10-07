---

doc_type: module
prd_id: "PE-09-115"
title: "PE-09-115-test: 自动刷新 — 测试方案"
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

# PE-09-115-test: 自动刷新 — 测试方案

## 测试用例

### TC-01: 初始检测

```
Given: YiAi 运行
When: 打开聊天窗口
Then: 绿点显示（serverOnline = true）
```

### TC-02: 周期性检测

```
Given: 聊天窗口已打开 60s
When: 定时器触发
Then: checkServer() 再次执行，状态更新
```

### TC-03: 组件卸载清理

```
Given: 定时器运行中
When: 关闭聊天窗口（组件卸载）
Then: clearInterval 被调用，定时器停止