---

doc_type: module
prd_id: "PE-09-105"
title: "PE-09-105-test: 项目健康摘要 — 测试方案"
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

# PE-09-105-test: 项目健康摘要 — 测试方案

## 测试用例

### TC-01: 项目页上显示健康卡片

```
Given: 当前页面 URL = "http://localhost:8848/#/project/yivad"
       YiAi 运行，/dashboard/summary 返回数据
When: 打开 YiPet 聊天窗口
Then: isOnProjectPage = true
      fetchSummary() 调用成功
      显示 "Project Health" 卡片 + 4 格统计 + 子项目列表
```

### TC-02: 非项目页不显示

```
Given: 当前页面 URL = "https://www.baidu.com"
When: 打开 YiPet 聊天窗口
Then: isOnProjectPage = false
      卡片不渲染
```

### TC-03: 健康色彩点

```
Given: summary.projects = [{health:"healthy"},{health:"warning"},{health:"critical"}]
When: 渲染子项目列表
Then: 显示绿点/黄点/红点
```

### TC-04: YiAi 不可达时不阻塞

```
Given: YiAi 未运行
When: 在项目页上打开聊天窗口
Then: fetchSummary() 抛出异常，catch 块捕获
      卡片显示红色错误提示 "Failed to load"
      聊天功能不受影响
```

### TC-05: 页面切换刷新

```
Given: 从 /project/yivad 导航到 /project/yiai
When: URL 变化，watch(isOnProjectPage) 触发
Then: 重新调用 fetchSummary()
      卡篇显示新项目的健康数据
```

## 测试环境

- YiAi 运行在 localhost:10086
- YiVad 运行在 localhost:8848
- Chrome 加载 YiPet 扩展