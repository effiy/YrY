---

doc_type: module
prd_id: "PO-09-66"
title: "PO-09-66-test: 分析刷新按钮 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-66-test: 分析刷新按钮 — 测试方案

## 测试用例

### TC-01: 刷新更新数据

```
Given: History 页面打开，YiAi 统计显示 "142 Ai tr."
When: 做几次新翻译，点击刷新按钮
Then: YiAi 统计更新为新的翻译量（如 "145 Ai tr."）
```

### TC-02: 按钮可见

```
Given: History 页面打开
When: 查看 stats bar 右侧
Then: 搜索框左侧显示刷新图标按钮
      tooltip: "Refresh YiAi analytics"
```

### TC-03: YiAi 不可达时刷新

```
Given: History 页面打开，YiAi 不可达
When: 点击刷新按钮
Then: loadYiAiStats catch 静默处理
      之前显示的 YiAi 数据保持不变
```

## 测试环境

- YiPot `pnpm tauri dev`
- YiAi 运行在 localhost:10086